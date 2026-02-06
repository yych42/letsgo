import type { RCodeGenerator } from '../../engine/types'
import { sanitizeNodeId } from './utils'

/**
 * R code generator for ColumnSelector nodes.
 *
 * Passes the full dataset through. The selectedColumn metadata is used
 * by downstream nodes to know which column to operate on.
 */
export const columnSelectorGenerator: RCodeGenerator = (nodeId, nodeData, inputs) => {
    const safeId = sanitizeNodeId(nodeId)
    const outputVar = `letsgo_${safeId}`

    // The input comes from the default (top) handle
    const input = inputs.default
    if (!input) {
        throw new Error(`ColumnSelector node ${nodeId}: no input connected`)
    }

    const selectedColumn = nodeData.selectedColumn as string
    if (!selectedColumn) {
        throw new Error(`ColumnSelector node ${nodeId}: no column selected`)
    }

    // Pass through the full dataset - column selection info is in metadata
    const rCode = `${outputVar} <- ${input.varName}`

    return {
        type: 'ColumnSelector',
        nodeId,
        rCode,
        outputVar,
        dependencies: [input.varName]
    }
}
