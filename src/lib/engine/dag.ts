import type { Edge, Node } from '@xyflow/svelte'
import type { DagNode, ExecutionDag } from './types'

/**
 * Build an ExecutionDag from Svelte Flow nodes and edges.
 * Maps edge source/target handle IDs to input keys.
 */
export function buildDag(nodes: Node[], edges: Edge[]): ExecutionDag {
    const dagNodes = new Map<string, DagNode>()

    // Initialize all nodes
    for (const node of nodes) {
        dagNodes.set(node.id, {
            id: node.id,
            type: node.type ?? 'unknown',
            data: (node.data ?? {}),
            inputs: {},
            outputs: []
        })
    }

    // Wire edges
    for (const edge of edges) {
        const sourceNode = dagNodes.get(edge.source)
        const targetNode = dagNodes.get(edge.target)
        if (!sourceNode || !targetNode) continue

        // Key the input by the target handle ID, or 'default' if null/undefined
        const inputKey = edge.targetHandle ?? 'default'
        targetNode.inputs[inputKey] = edge.source

        // Track outputs
        if (!sourceNode.outputs.includes(edge.target)) {
            sourceNode.outputs.push(edge.target)
        }
    }

    // Topological sort using Kahn's algorithm
    const order = topologicalSort(dagNodes)

    return { nodes: dagNodes, order }
}

/**
 * Kahn's algorithm for topological sorting.
 */
function topologicalSort(dagNodes: Map<string, DagNode>): string[] {
    // Compute in-degrees
    const inDegree = new Map<string, number>()
    for (const [id] of dagNodes) {
        inDegree.set(id, 0)
    }
    for (const [, node] of dagNodes) {
        for (const targetId of node.outputs) {
            inDegree.set(targetId, (inDegree.get(targetId) ?? 0) + 1)
        }
    }

    // Start with nodes that have no incoming edges
    const queue: string[] = []
    for (const [id, degree] of inDegree) {
        if (degree === 0) {
            queue.push(id)
        }
    }

    const order: string[] = []
    while (queue.length > 0) {
        const nodeId = queue.shift()!
        order.push(nodeId)

        const node = dagNodes.get(nodeId)
        if (!node) continue

        for (const targetId of node.outputs) {
            const newDegree = (inDegree.get(targetId) ?? 1) - 1
            inDegree.set(targetId, newDegree)
            if (newDegree === 0) {
                queue.push(targetId)
            }
        }
    }

    return order
}

/**
 * Get all downstream node IDs from a given node (transitive).
 */
export function getDownstreamNodes(dag: ExecutionDag, nodeId: string): Set<string> {
    const downstream = new Set<string>()
    const queue: string[] = [nodeId]

    while (queue.length > 0) {
        const current = queue.shift()!
        const node = dag.nodes.get(current)
        if (!node) continue

        for (const targetId of node.outputs) {
            if (!downstream.has(targetId)) {
                downstream.add(targetId)
                queue.push(targetId)
            }
        }
    }

    return downstream
}

/**
 * Get the topological order of a subset of nodes.
 * Returns only nodes in the subset, in the same relative order as the full DAG.
 */
export function getSubgraphOrder(dag: ExecutionDag, nodeIds: Set<string>): string[] {
    return dag.order.filter((id) => nodeIds.has(id))
}
