# LetsGo 1.0 Architecture

## Overview

LetsGo is a node-based data transformation, cleaning, and analysis tool powered by
R running in WebAssembly (via WebR). Data lives in R's memory space; the JavaScript
layer handles UI rendering and orchestration only.

## Core Principles

1. **R owns the data** - Datasets live as R data.frames. JS only holds previews.
2. **Nodes generate R code** - Each node produces an R expression that transforms data.
3. **DAG execution** - Nodes execute in topological order; changes cascade downstream.
4. **Shelter-per-execution** - Each execution cycle uses a WebR Shelter, purged after.
5. **Lazy previews** - UI displays at most 100 rows; full data stays in R.

## Directory Structure

```
src/lib/
├── r-engine/                    # WebR integration layer
│   ├── webr-service.ts          # Singleton WebR instance + initialization
│   ├── r-data-store.ts          # R-side dataset management (create/read/delete)
│   ├── r-executor.ts            # Execute R code with shelter management
│   └── types.ts                 # R engine types
│
├── engine/                      # Node execution engine
│   ├── dag.ts                   # Build DAG from Svelte Flow edges
│   ├── executor.ts              # Topological sort + execute pipeline
│   ├── node-registry.ts         # Maps node types → R code generators
│   └── types.ts                 # Engine types
│
├── nodes/                       # Node definitions
│   ├── index.ts                 # Node type registry (for Svelte Flow)
│   ├── r-ops/                   # R code generators (pure functions)
│   │   ├── csv-loader.ts
│   │   ├── column-selector.ts
│   │   ├── range-filter.ts
│   │   ├── value-filter.ts
│   │   ├── rename-column.ts
│   │   ├── mean.ts
│   │   ├── unique-values.ts
│   │   ├── t-test.ts
│   │   ├── corr-test.ts
│   │   ├── export-csv.ts
│   │   └── index.ts
│   │
│   └── commons/                 # Svelte UI components for nodes
│       ├── CSVLoader.svelte
│       ├── ColumnSelector.svelte
│       ├── RangeFilter.svelte
│       ├── ValueFilter.svelte
│       ├── RenameColumn.svelte
│       ├── Mean.svelte
│       ├── UniqueValues.svelte
│       ├── TwoSampleTTest.svelte
│       ├── CorrTest.svelte
│       ├── ExportCSV.svelte
│       ├── PostyNode.svelte
│       └── index.ts
│
├── node-elements/               # Shared node UI containers
│   ├── OperationalNodeContainer.svelte
│   ├── InfoNodeContainer.svelte
│   └── Divider.svelte
│
├── menus/                       # Application menus
│   ├── TopMenu.svelte
│   └── LibraryMenu.svelte
│
├── types/                       # Shared TypeScript types
│   └── index.ts
│
├── utils/                       # Utility functions
│   ├── frequency-rank.ts
│   └── emoji-hash.ts
│
├── Flow.svelte                  # Main flow editor
├── helpers.ts                   # Data processing helpers
└── index.ts                     # Lib exports
```

## Key Interfaces

### R Engine Layer

```typescript
// src/lib/r-engine/types.ts

/** Reference to data living in R's memory */
export interface RDataRef {
    /** R variable name (e.g., "letsgo_df_abc123") */
    varName: string;
    /** Number of rows */
    nrow: number;
    /** Number of columns */
    ncol: number;
    /** Column names */
    colNames: string[];
    /** Column types (as reported by R) */
    colTypes: Record<string, 'numeric' | 'character' | 'logical' | 'factor' | 'integer'>;
}

/** Preview of data for UI display */
export interface DataPreview {
    columns: string[];
    rows: Record<string, unknown>[];
    totalRows: number;
    totalCols: number;
}

/** Column statistics for UI display */
export interface ColumnStats {
    name: string;
    type: 'numeric' | 'character' | 'logical' | 'factor' | 'integer';
    missing: number;
    missingPct: number;
    unique: number;
    // Numeric only:
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    sd?: number;
    // Character only:
    topValues?: { value: string; count: number }[];
}
```

### Node Execution Engine

```typescript
// src/lib/engine/types.ts

/** Configuration for a node's R operation */
export interface RNodeOperation {
    /** Node type identifier */
    type: string;
    /** Node instance ID */
    nodeId: string;
    /** R code to execute (may reference upstream variable names) */
    rCode: string;
    /** Name of the R variable this node outputs */
    outputVar: string;
    /** IDs of upstream nodes this depends on */
    dependencies: string[];
}

/** Function that generates R code for a node */
export type RCodeGenerator = (
    nodeId: string,
    nodeData: Record<string, unknown>,
    inputs: Record<string, RDataRef>
) => RNodeOperation

/** Result of executing a node */
export interface NodeExecutionResult {
    nodeId: string;
    dataRef: RDataRef | null;
    preview: DataPreview | null;
    stats: Record<string, ColumnStats>;
    error: string | null;
    /** For analysis nodes, structured results */
    analysisResult?: Record<string, unknown>;
}
```

## Data Flow

```
User loads CSV file
       ↓
CSVLoader: PapaParse in JS → push to R as data.frame → RDataRef
       ↓
ColumnSelector: R select() → new RDataRef
       ↓
RangeFilter/ValueFilter: R filter() → new RDataRef
       ↓
Mean/UniqueValues/TTest: R summarise()/count()/t.test() → analysis results
       ↓
ExportCSV: Pull full data from R → download as CSV
```

Each arrow represents: node generates R code → engine executes in R → result
stored as R variable → preview pulled for UI display.

## Memory Management Strategy

1. **Naming convention**: R variables follow `letsgo_{nodeId}` pattern
2. **Overwrite on re-execute**: When a node re-runs, its R variable is overwritten
3. **Cleanup on node delete**: `rm()` called for deleted node variables
4. **Preview caching**: UI preview is a small JS object (≤100 rows)
5. **Shelter per execution**: Each pipeline execution uses one Shelter, purged after
6. **Avoid round-tripping**: Data moves JS→R once (CSV load) and R→JS once (export)

## Package Dependencies (R)

Pre-loaded at startup:

-   `dplyr` - Data manipulation (select, filter, mutate, summarise, rename)
-   `tidyr` - Data tidying (pivot, separate, unite)
-   `stats` - Statistical tests (t.test, cor.test) - built-in, no install needed

## Execution Model

1. User modifies a node (changes config, connects edge, etc.)
2. Engine builds DAG from current Svelte Flow state
3. Engine identifies affected subgraph (the modified node + all downstream)
4. Engine topologically sorts the affected subgraph
5. For each node in order:
   a. Get its R code generator from the registry
   b. Call generator with node config + upstream RDataRefs
   c. Execute generated R code via WebR Shelter
   d. Store result as new RDataRef
   e. Pull preview for UI display
6. Update Svelte stores with new previews/results
7. Purge shelter

## Cross-Origin Isolation

WebR requires SharedArrayBuffer for optimal performance. This requires:

-   `Cross-Origin-Opener-Policy: same-origin`
-   `Cross-Origin-Embedder-Policy: require-corp`

Set via `hooks.server.ts` (SvelteKit) and `vite.config.ts` (dev server).

## Node Types for 1.0

| Node           | Category  | R Operation                       | Input            | Output                  |
| -------------- | --------- | --------------------------------- | ---------------- | ----------------------- |
| CSVLoader      | Input     | (JS parse → R)                    | File             | dataset                 |
| ColumnSelector | Transform | `select()`                        | dataset          | dataset + column values |
| RangeFilter    | Transform | `filter(col >= min & col <= max)` | dataset          | dataset                 |
| ValueFilter    | Transform | `filter(col %in% values)`         | dataset          | dataset                 |
| RenameColumn   | Transform | `rename(new = old)`               | dataset          | dataset                 |
| Mean           | Analysis  | `summarise(mean, sd, n)`          | dataset + column | stats                   |
| UniqueValues   | Analysis  | `count() %>% arrange(desc(n))`    | dataset + column | frequency table         |
| TwoSampleTTest | Analysis  | `t.test()`                        | 2 columns        | test results            |
| CorrTest       | Analysis  | `cor.test()`                      | 2 columns        | test results            |
| ExportCSV      | Output    | (R → JS → download)               | dataset(s)       | CSV file                |
| PostyNode      | Utility   | (none)                            | -                | -                       |
