/**
 * Sanitize a node ID for use as an R variable name.
 * Replaces any non-alphanumeric characters with underscores.
 */
export function sanitizeNodeId(nodeId: string): string {
    return nodeId.replace(/[^a-z0-9]/gi, '_')
}

/**
 * Quote a column name for safe use in R code.
 * Uses backtick quoting to handle spaces and special characters.
 */
export function quoteColumn(columnName: string): string {
    return `\`${columnName}\``
}

/**
 * Escape a string value for safe inclusion in R string literals.
 * Escapes backslashes and double quotes.
 */
export function escapeRString(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}
