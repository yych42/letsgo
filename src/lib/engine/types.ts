import type { ColumnStats, DataPreview, RDataRef } from '../r-engine/types'

/** Configuration for a node's R operation */
export interface RNodeOperation {
    /** Node type identifier */
    type: string;
    /** Node instance ID */
    nodeId: string;
    /** R code to execute (may reference upstream variable names) */
    rCode: string;
    /** Name of the R variable this node outputs */
    outputVar: string | null;
    /** If true, the output is an analysis result (list/summary), not a dataset */
    isAnalysis?: boolean;
    /** IDs of upstream nodes this depends on */
    dependencies: string[];
}

/** Function that generates R code for a node */
export type RCodeGenerator = (
    nodeId: string,
    nodeData: Record<string, unknown>,
    inputs: Record<string, RDataRef>
) => RNodeOperation

/** Result of executing a single node */
export interface NodeExecutionResult {
    nodeId: string;
    /** Reference to the output dataset in R (null for analysis-only nodes) */
    dataRef: RDataRef | null;
    /** Preview rows for UI display */
    preview: DataPreview | null;
    /** Column statistics for the output dataset */
    stats: Record<string, ColumnStats>;
    /** Error message if execution failed */
    error: string | null;
    /** For analysis nodes, structured results (mean, t-test results, etc.) */
    analysisResult?: Record<string, unknown>;
}

/** A node in the execution DAG */
export interface DagNode {
    id: string;
    type: string;
    data: Record<string, unknown>;
    /** IDs of nodes that feed into this node, keyed by handle ID */
    inputs: Record<string, string>;
    /** IDs of nodes that this node feeds into */
    outputs: string[];
}

/** The execution DAG */
export interface ExecutionDag {
    nodes: Map<string, DagNode>;
    /** Topological ordering of node IDs */
    order: string[];
}
