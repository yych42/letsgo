import type { Edge, Node } from '@xyflow/svelte'
import type { RDataRef } from '../r-engine/types'
import { executeR, executeRAndGetDataRef } from '../r-engine/r-executor'
import type { NodeExecutionResult } from './types'
import { buildDag, getDownstreamNodes, getSubgraphOrder } from './dag'
import { getGenerator } from './node-registry'

/**
 * Pull a preview (first N rows) for a given R variable.
 */
async function getPreview(
    varName: string,
    maxRows = 50
): Promise<{ columns: string[]; rows: Record<string, unknown>[]; totalRows: number; totalCols: number }> {
    const { executeRAndGetResult } = await import('../r-engine/r-executor')

    const code = [
        `.letsgo_tmp <- ${varName}`,
        `.letsgo_nr <- nrow(.letsgo_tmp)`,
        `.letsgo_nc <- ncol(.letsgo_tmp)`,
        `.letsgo_preview <- head(.letsgo_tmp, ${maxRows})`,
        `.letsgo_preview`
    ].join('\n')

    const rows = await executeRAndGetResult<Record<string, unknown>[]>(code, 'd3')

    // Get dimensions separately
    const nrow = await executeRAndGetResult<number>('nrow(.letsgo_tmp)', 'number')
    const ncol = await executeRAndGetResult<number>('ncol(.letsgo_tmp)', 'number')
    const colNames = await executeRAndGetResult<unknown[]>('colnames(.letsgo_tmp)', 'array')

    // Clean up temp vars
    await executeR('rm(.letsgo_tmp, .letsgo_nr, .letsgo_nc, .letsgo_preview)')

    const columns = await Promise.all(
        (colNames as any[]).map(async (c) => (typeof c === 'string' ? c : await c.toString()))
    )

    return {
        columns,
        rows: rows ?? [],
        totalRows: nrow,
        totalCols: ncol
    }
}

/**
 * Get column statistics for all columns of a given R variable.
 */
async function getColumnStats(
    varName: string
): Promise<Record<string, import('../r-engine/types').ColumnStats>> {
    const { executeRAndGetResult } = await import('../r-engine/r-executor')

    /* eslint-disable style/no-tabs */
    const code = `
		.letsgo_stats_df <- ${varName}
		.letsgo_stats <- lapply(names(.letsgo_stats_df), function(col_name) {
			col <- .letsgo_stats_df[[col_name]]
			col_class <- class(col)[1]
			n_total <- length(col)
			n_missing <- sum(is.na(col))
			n_unique <- length(unique(na.omit(col)))

			result <- list(
				name = col_name,
				type = col_class,
				missing = n_missing,
				missingPct = if (n_total > 0) round(n_missing / n_total * 100, 2) else 0,
				unique = n_unique,
				total = n_total
			)

			if (col_class %in% c("numeric", "integer")) {
				clean <- na.omit(col)
				if (length(clean) > 0) {
					result$min <- min(clean)
					result$max <- max(clean)
					result$mean <- mean(clean)
					result$median <- median(clean)
					result$sd <- sd(clean)
				}
			}

			if (col_class %in% c("character", "factor")) {
				tbl <- sort(table(col), decreasing = TRUE)
				top <- head(tbl, 10)
				result$topValues <- lapply(seq_along(top), function(i) {
					list(value = names(top)[i], count = as.integer(top[i]))
				})
			}

			result
		})
		names(.letsgo_stats) <- names(.letsgo_stats_df)
		.letsgo_stats
	`
    /* eslint-enable style/no-tabs */

    try {
        const raw = await executeRAndGetResult<any>(code, 'object')
        await executeR('rm(.letsgo_stats_df, .letsgo_stats)')

        const stats: Record<string, import('../r-engine/types').ColumnStats> = {}

        if (raw && raw.values) {
            const names = raw.names ?? []
            for (let i = 0; i < raw.values.length; i++) {
                const entry = raw.values[i]
                const colName = names[i] ?? `col_${i}`

                const stat: import('../r-engine/types').ColumnStats = {
                    name: extractScalar(entry, 'name', colName),
                    type: extractScalar(entry, 'type', 'character'),
                    missing: extractScalar(entry, 'missing', 0),
                    missingPct: extractScalar(entry, 'missingPct', 0),
                    unique: extractScalar(entry, 'unique', 0),
                    total: extractScalar(entry, 'total', 0)
                }

                if (stat.type === 'numeric' || stat.type === 'integer') {
                    stat.min = extractOptionalScalar(entry, 'min')
                    stat.max = extractOptionalScalar(entry, 'max')
                    stat.mean = extractOptionalScalar(entry, 'mean')
                    stat.median = extractOptionalScalar(entry, 'median')
                    stat.sd = extractOptionalScalar(entry, 'sd')
                }

                if (stat.type === 'character' || stat.type === 'factor') {
                    stat.topValues = extractTopValues(entry)
                }

                stats[colName] = stat
            }
        }

        return stats
    } catch {
        await executeR('try(rm(.letsgo_stats_df, .letsgo_stats), silent = TRUE)')
        return {}
    }
}

/** Extract a scalar from an R list-like JS object */
function extractScalar<T>(obj: any, key: string, fallback: T): T {
    if (!obj || !obj.names || !obj.values) return fallback
    const idx = obj.names.indexOf(key)
    if (idx === -1) return fallback
    const val = obj.values[idx]
    if (val && val.values && val.values.length > 0) return val.values[0] as T
    return fallback
}

function extractOptionalScalar(obj: any, key: string): number | undefined {
    if (!obj || !obj.names || !obj.values) return undefined
    const idx = obj.names.indexOf(key)
    if (idx === -1) return undefined
    const val = obj.values[idx]
    if (val && val.values && val.values.length > 0) {
        const num = val.values[0]
        return typeof num === 'number' && Number.isFinite(num) ? num : undefined
    }
    return undefined
}

function extractTopValues(obj: any): { value: string; count: number }[] | undefined {
    if (!obj || !obj.names || !obj.values) return undefined
    const idx = obj.names.indexOf('topValues')
    if (idx === -1) return undefined
    const val = obj.values[idx]
    if (!val || !val.values) return undefined

    return val.values
        .map((item: any) => {
            if (!item || !item.names || !item.values) return null
            const vIdx = item.names.indexOf('value')
            const cIdx = item.names.indexOf('count')
            if (vIdx === -1 || cIdx === -1) return null
            return {
                value: item.values[vIdx]?.values?.[0] ?? '',
                count: item.values[cIdx]?.values?.[0] ?? 0
            }
        })
        .filter(Boolean) as { value: string; count: number }[]
}

/**
 * Flatten an R list from toJs() format ({ names: [...], values: [{ values: [...] }, ...] })
 * into a flat JS object with scalar values.
 */
function flattenRList(obj: any): Record<string, unknown> {
    if (!obj || !obj.names || !obj.values) return obj ?? {}
    const result: Record<string, unknown> = {}
    for (let i = 0; i < obj.names.length; i++) {
        const key = obj.names[i]
        const val = obj.values[i]
        if (val && val.values && val.values.length > 0) {
            result[key] = val.values[0]
        } else {
            result[key] = val
        }
    }
    return result
}

/**
 * Execute an analysis node and return the result in a format the Svelte components expect.
 */
async function executeAnalysisNode(operation: import('./types').RNodeOperation): Promise<Record<string, unknown>> {
    const { executeRAndGetResult: getResult } = await import('../r-engine/r-executor')

    if (operation.type === 'UniqueValues') {
        const rows = await getResult<Record<string, unknown>[]>(operation.rCode, 'd3')
        return { rows: rows ?? [] }
    } else if (operation.type === 'Mean') {
        const rows = await getResult<Record<string, unknown>[]>(operation.rCode, 'd3')
        return rows?.[0] ?? {}
    } else {
        const raw = await getResult<any>(operation.rCode, 'object')
        return flattenRList(raw)
    }
}

/**
 * Execute the pipeline for a triggered node and all its downstream nodes.
 * Returns a map of nodeId -> execution results.
 */
export async function executePipeline(
    nodes: Node[],
    edges: Edge[],
    triggerNodeId: string
): Promise<Map<string, NodeExecutionResult>> {
    const dag = buildDag(nodes, edges)
    const results = new Map<string, NodeExecutionResult>()

    // Collect the trigger node + all downstream
    const downstream = getDownstreamNodes(dag, triggerNodeId)
    downstream.add(triggerNodeId)

    // Get topological execution order for the affected subgraph
    const executionOrder = getSubgraphOrder(dag, downstream)

    // Track successful dataRefs for passing to downstream nodes
    const dataRefs = new Map<string, RDataRef>()

    for (const nodeId of executionOrder) {
        const dagNode = dag.nodes.get(nodeId)
        if (!dagNode) continue

        const generator = getGenerator(dagNode.type)
        if (!generator) {
            // No generator registered for this node type (e.g., PostyNode) -- skip
            results.set(nodeId, {
                nodeId,
                dataRef: null,
                preview: null,
                stats: {},
                error: null
            })
            continue
        }

        // Collect upstream RDataRefs as inputs keyed by handle ID
        const inputs: Record<string, RDataRef> = {}
        for (const [handleId, sourceId] of Object.entries(dagNode.inputs)) {
            const ref = dataRefs.get(sourceId)
            if (ref) {
                inputs[handleId] = ref
            }
        }

        try {
            // Generate the R code
            const operation = generator(nodeId, dagNode.data, inputs)

            if (operation.rCode) {
                if (operation.isAnalysis) {
                    const analysisResult = await executeAnalysisNode(operation)
                    results.set(nodeId, {
                        nodeId,
                        dataRef: null,
                        preview: null,
                        stats: {},
                        error: null,
                        analysisResult
                    })
                } else if (operation.outputVar) {
                    // Data node: execute and capture the data reference
                    const dataRef = await executeRAndGetDataRef(operation.rCode, operation.outputVar)
                    const typedRef: RDataRef = {
                        varName: dataRef.varName,
                        nrow: dataRef.nrow,
                        ncol: dataRef.ncol,
                        colNames: dataRef.colNames,
                        colTypes: dataRef.colTypes as RDataRef['colTypes']
                    }

                    dataRefs.set(nodeId, typedRef)

                    // Pull preview and stats
                    const preview = await getPreview(operation.outputVar)
                    const stats = await getColumnStats(operation.outputVar)

                    results.set(nodeId, {
                        nodeId,
                        dataRef: typedRef,
                        preview,
                        stats,
                        error: null
                    })
                } else {
                    // No output variable - just execute the code
                    await executeR(operation.rCode)
                    results.set(nodeId, {
                        nodeId,
                        dataRef: null,
                        preview: null,
                        stats: {},
                        error: null
                    })
                }
            } else {
                results.set(nodeId, {
                    nodeId,
                    dataRef: null,
                    preview: null,
                    stats: {},
                    error: null
                })
            }
        } catch (err) {
            // Node failed -- record error but continue with other branches
            results.set(nodeId, {
                nodeId,
                dataRef: null,
                preview: null,
                stats: {},
                error: err instanceof Error ? err.message : String(err)
            })
        }
    }

    return results
}

/**
 * Execute the full pipeline (all nodes in topological order).
 */
export async function executeFullPipeline(
    nodes: Node[],
    edges: Edge[]
): Promise<Map<string, NodeExecutionResult>> {
    const dag = buildDag(nodes, edges)
    const results = new Map<string, NodeExecutionResult>()
    const dataRefs = new Map<string, RDataRef>()

    for (const nodeId of dag.order) {
        const dagNode = dag.nodes.get(nodeId)
        if (!dagNode) continue

        const generator = getGenerator(dagNode.type)
        if (!generator) {
            results.set(nodeId, {
                nodeId,
                dataRef: null,
                preview: null,
                stats: {},
                error: null
            })
            continue
        }

        const inputs: Record<string, RDataRef> = {}
        for (const [handleId, sourceId] of Object.entries(dagNode.inputs)) {
            const ref = dataRefs.get(sourceId)
            if (ref) {
                inputs[handleId] = ref
            }
        }

        try {
            const operation = generator(nodeId, dagNode.data, inputs)

            if (operation.rCode) {
                if (operation.isAnalysis) {
                    const analysisResult = await executeAnalysisNode(operation)
                    results.set(nodeId, {
                        nodeId,
                        dataRef: null,
                        preview: null,
                        stats: {},
                        error: null,
                        analysisResult
                    })
                } else if (operation.outputVar) {
                    const dataRef = await executeRAndGetDataRef(operation.rCode, operation.outputVar)
                    const typedRef: RDataRef = {
                        varName: dataRef.varName,
                        nrow: dataRef.nrow,
                        ncol: dataRef.ncol,
                        colNames: dataRef.colNames,
                        colTypes: dataRef.colTypes as RDataRef['colTypes']
                    }

                    dataRefs.set(nodeId, typedRef)

                    const preview = await getPreview(operation.outputVar)
                    const stats = await getColumnStats(operation.outputVar)

                    results.set(nodeId, {
                        nodeId,
                        dataRef: typedRef,
                        preview,
                        stats,
                        error: null
                    })
                } else {
                    await executeR(operation.rCode)
                    results.set(nodeId, {
                        nodeId,
                        dataRef: null,
                        preview: null,
                        stats: {},
                        error: null
                    })
                }
            } else {
                results.set(nodeId, {
                    nodeId,
                    dataRef: null,
                    preview: null,
                    stats: {},
                    error: null
                })
            }
        } catch (err) {
            results.set(nodeId, {
                nodeId,
                dataRef: null,
                preview: null,
                stats: {},
                error: err instanceof Error ? err.message : String(err)
            })
        }
    }

    return results
}
