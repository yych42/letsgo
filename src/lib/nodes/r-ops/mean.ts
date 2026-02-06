import type { RCodeGenerator } from '../../engine/types'
import { quoteColumn, sanitizeNodeId } from './utils'

/**
 * R code generator for Mean (analysis) nodes.
 *
 * Computes mean, standard deviation, and count of valid values for a column.
 * This is an analysis node - it produces a result list, not a transformed dataset.
 */
export const meanGenerator: RCodeGenerator = (nodeId, nodeData, inputs) => {
    const safeId = sanitizeNodeId(nodeId)
    const resultVar = `letsgo_${safeId}_result`

    const input = inputs.default
    if (!input) {
        throw new Error(`Mean node ${nodeId}: no input connected`)
    }

    const selectedColumn = nodeData.selectedColumn as string
    if (!selectedColumn) {
        throw new Error(`Mean node ${nodeId}: no column selected`)
    }

    const col = quoteColumn(selectedColumn)

    const rCode = [
        `${resultVar} <- ${input.varName} %>%`,
        `  summarise(`,
        `    mean = mean(${col}, na.rm = TRUE),`,
        `    sd = sd(${col}, na.rm = TRUE),`,
        `    n = sum(!is.na(${col}))`,
        `  )`
    ].join('\n')

    return {
        type: 'Mean',
        nodeId,
        rCode,
        outputVar: resultVar,
        isAnalysis: true,
        dependencies: [input.varName]
    }
}
