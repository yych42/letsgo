import type { RCodeGenerator } from '../../engine/types'
import { quoteColumn, sanitizeNodeId } from './utils'

/**
 * R code generator for RenameColumn nodes.
 *
 * Renames a column in the dataset using dplyr::rename().
 */
export const renameColumnGenerator: RCodeGenerator = (nodeId, nodeData, inputs) => {
    const safeId = sanitizeNodeId(nodeId)
    const outputVar = `letsgo_${safeId}`

    const input = inputs.default
    if (!input) {
        throw new Error(`RenameColumn node ${nodeId}: no input connected`)
    }

    const selectedColumn = nodeData.selectedColumn as string
    const newColumnName = nodeData.newColumnName as string

    if (!selectedColumn) {
        throw new Error(`RenameColumn node ${nodeId}: no column selected`)
    }
    if (!newColumnName) {
        throw new Error(`RenameColumn node ${nodeId}: no new column name specified`)
    }

    const oldCol = quoteColumn(selectedColumn)
    const newCol = quoteColumn(newColumnName)

    const rCode = `${outputVar} <- ${input.varName} %>% rename(${newCol} = ${oldCol})`

    return {
        type: 'RenameColumn',
        nodeId,
        rCode,
        outputVar,
        dependencies: [input.varName]
    }
}
