/** Reference to data living in R's memory */
export interface RDataRef {
    /** R variable name (e.g., "letsgo_abc123") */
    varName: string;
    /** Number of rows */
    nrow: number;
    /** Number of columns */
    ncol: number;
    /** Column names */
    colNames: string[];
    /** Column types (as reported by R) */
    colTypes: Record<string, RColumnType>;
}

export type RColumnType = 'numeric' | 'character' | 'logical' | 'factor' | 'integer'

/** Preview of data for UI display (limited rows) */
export interface DataPreview {
    columns: string[];
    rows: Record<string, unknown>[];
    totalRows: number;
    totalCols: number;
}

/** Column statistics computed in R for UI display */
export interface ColumnStats {
    name: string;
    type: RColumnType;
    missing: number;
    missingPct: number;
    unique: number;
    total: number;
    // Numeric only:
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    sd?: number;
    histogram?: number[];
    // Character only:
    topValues?: { value: string; count: number }[];
}

/** Status of the WebR runtime */
export type WebRStatus = 'uninitialized' | 'initializing' | 'loading-packages' | 'ready' | 'error'

/** Result of an R execution */
export interface RExecutionResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}
