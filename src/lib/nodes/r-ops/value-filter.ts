import type { RCodeGenerator } from '../../engine/types'
import { escapeRString, quoteColumn, sanitizeNodeId } from './utils'

/**
 * R code generator for ValueFilter nodes.
 *
 * Filters rows by matching a specific value in a selected column.
 * When setAsMissing=true, non-matching values become NA (mutate + ifelse).
 * When setAsMissing=false, non-matching rows are removed (filter).
 */
export const valueFilterGenerator: RCodeGenerator = (nodeId, nodeData, inputs) => {
    const safeId = sanitizeNodeId(nodeId)
    const outputVar = `letsgo_${safeId}`

    // Accept input from any of the possible handles
    const input = inputs['dataset-target'] || inputs['vector-target'] || inputs.default
    if (!input) {
        throw new Error(`ValueFilter node ${nodeId}: no input connected`)
    }

    const value = (nodeData.filterValue ?? nodeData.value) as string
    const setAsMissing = nodeData.setAsMissing as boolean
    const selectedColumn = nodeData.selectedColumn as string

    if (selectedColumn === undefined || selectedColumn === '') {
        throw new Error(`ValueFilter node ${nodeId}: no column selected`)
    }

    const col = quoteColumn(selectedColumn)
    const safeValue = escapeRString(value)

    let rCode: string
    if (setAsMissing) {
        rCode = [
            `${outputVar} <- ${input.varName} %>%`,
            `  mutate(${col} = ifelse(${col} == "${safeValue}", ${col}, NA))`
        ].join('\n')
    } else {
        rCode = [
            `${outputVar} <- ${input.varName} %>%`,
            `  filter(${col} == "${safeValue}")`
        ].join('\n')
    }

    return {
        type: 'ValueFilter',
        nodeId,
        rCode,
        outputVar,
        dependencies: [input.varName]
    }
}
