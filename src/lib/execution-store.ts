/**
 * Shared execution store for the R-WASM pipeline.
 * Holds execution results keyed by node ID.
 * Nodes read their results from this store; the orchestrator writes to it.
 */
import { get, writable } from 'svelte/store'
import type { Edge, Node } from '@xyflow/svelte'
import type { NodeExecutionResult } from './engine/types'

/** Store holding all execution results keyed by node ID */
export const executionResults = writable<Map<string, NodeExecutionResult>>(new Map())

/** Get the execution result for a specific node */
export function getNodeResult(nodeId: string): NodeExecutionResult | undefined {
    return get(executionResults).get(nodeId)
}

/** Whether the pipeline is currently executing */
export const isExecuting = writable<boolean>(false)

/** Store tracking which nodes are currently computing */
export const computingNodes = writable<Set<string>>(new Set())

/**
 * Trigger pipeline execution for a specific node and its downstream.
 * This is the main function nodes call when their config changes.
 */
let executionTimeout: ReturnType<typeof setTimeout> | null = null
const pendingTriggers: Set<string> = new Set()

export function triggerNodeExecution(nodeId: string): void {
    pendingTriggers.add(nodeId)

    // Debounce: wait 100ms for more triggers before executing
    if (executionTimeout) {
        clearTimeout(executionTimeout)
    }
    executionTimeout = setTimeout(() => {
        const triggers = new Set(pendingTriggers)
        pendingTriggers.clear()
        executionTimeout = null
        runPipeline(triggers)
    }, 100)
}

/** Internal: actually run the pipeline */
async function runPipeline(triggerNodeIds: Set<string>): Promise<void> {
    const { executePipeline } = await import('./engine/executor')

    isExecuting.set(true)

    try {
        const currentNodes = get(pipelineNodes)
        const currentEdges = get(pipelineEdges)

        if (!currentNodes.length) return

        const allResults = new Map<string, NodeExecutionResult>()

        for (const triggerId of triggerNodeIds) {
            const results = await executePipeline(currentNodes, currentEdges, triggerId)
            for (const [id, result] of results) {
                allResults.set(id, result)
            }
        }

        // Merge results into the store
        executionResults.update((current) => {
            for (const [id, result] of allResults) {
                current.set(id, result)
            }
            return new Map(current)
        })
    } catch (err) {
        console.error('Pipeline execution error:', err)
    } finally {
        isExecuting.set(false)
    }
}

/** Run the full pipeline (all nodes) */
export async function runFullPipeline(): Promise<void> {
    const { executeFullPipeline } = await import('./engine/executor')

    isExecuting.set(true)

    try {
        const currentNodes = get(pipelineNodes)
        const currentEdges = get(pipelineEdges)

        if (!currentNodes.length) return

        const results = await executeFullPipeline(currentNodes, currentEdges)

        executionResults.set(results)
    } catch (err) {
        console.error('Full pipeline execution error:', err)
    } finally {
        isExecuting.set(false)
    }
}

/**
 * These stores are set by Flow.svelte to give the execution store
 * access to the current nodes and edges.
 */
export const pipelineNodes = writable<Node[]>([])
export const pipelineEdges = writable<Edge[]>([])
