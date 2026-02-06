import type { RCodeGenerator } from '../../engine/types'
import { quoteColumn, sanitizeNodeId } from './utils'

/**
 * R code generator for RangeFilter nodes.
 *
 * Filters rows by a numeric range on a selected column.
 * When setAsMissing=true, out-of-range values become NA (mutate + ifelse).
 * When setAsMissing=false, out-of-range rows are removed (filter).
 */
export const rangeFilterGenerator: RCodeGenerator = (nodeId, nodeData, inputs) => {
    const safeId = sanitizeNodeId(nodeId)
    const outputVar = `letsgo_${safeId}`

    // Accept input from any of the possible handles
    const input = inputs['dataset-target'] || inputs['vector-target'] || inputs.default
    if (!input) {
        throw new Error(`RangeFilter node ${nodeId}: no input connected`)
    }

    const min = nodeData.min as number
    const max = nodeData.max as number
    const setAsMissing = nodeData.setAsMissing as boolean
    const selectedColumn = nodeData.selectedColumn as string

    if (selectedColumn === undefined || selectedColumn === '') {
        throw new Error(`RangeFilter node ${nodeId}: no column selected`)
    }

    const col = quoteColumn(selectedColumn)

    let rCode: string
    if (setAsMissing) {
        rCode = [
            `${outputVar} <- ${input.varName} %>%`,
            `  mutate(${col} = ifelse(${col} >= ${min} & ${col} <= ${max}, ${col}, NA))`
        ].join('\n')
    } else {
        rCode = [
            `${outputVar} <- ${input.varName} %>%`,
            `  filter(${col} >= ${min} & ${col} <= ${max})`
        ].join('\n')
    }

    return {
        type: 'RangeFilter',
        nodeId,
        rCode,
        outputVar,
        dependencies: [input.varName]
    }
}
