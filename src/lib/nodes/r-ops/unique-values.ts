import type { RCodeGenerator } from '../../engine/types'
import { quoteColumn, sanitizeNodeId } from './utils'

/**
 * R code generator for UniqueValues (analysis) nodes.
 *
 * Computes the top N most frequent values in a column, with counts and percentages.
 * This is an analysis node - it produces a frequency table, not a transformed dataset.
 */
export const uniqueValuesGenerator: RCodeGenerator = (nodeId, nodeData, inputs) => {
    const safeId = sanitizeNodeId(nodeId)
    const resultVar = `letsgo_${safeId}_result`

    const input = inputs.default
    if (!input) {
        throw new Error(`UniqueValues node ${nodeId}: no input connected`)
    }

    const selectedColumn = nodeData.selectedColumn as string
    if (!selectedColumn) {
        throw new Error(`UniqueValues node ${nodeId}: no column selected`)
    }

    const topN = (nodeData.topN as number) || 5
    const col = quoteColumn(selectedColumn)

    const rCode = [
        `${resultVar} <- ${input.varName} %>%`,
        `  count(${col}, name = "frequency") %>%`,
        `  arrange(desc(frequency)) %>%`,
        `  head(${topN}) %>%`,
        `  mutate(percentage = frequency / sum(frequency) * 100)`
    ].join('\n')

    return {
        type: 'UniqueValues',
        nodeId,
        rCode,
        outputVar: resultVar,
        isAnalysis: true,
        dependencies: [input.varName]
    }
}
