import type { RCodeGenerator } from '../../engine/types'
import { quoteColumn, sanitizeNodeId } from './utils'

/**
 * R code generator for CorrTest (analysis) nodes.
 *
 * Performs a Pearson correlation test between two columns.
 * Returns the correlation coefficient (r) and p-value.
 *
 * Expects two inputs, each providing a dataset+column reference.
 */
export const corrTestGenerator: RCodeGenerator = (nodeId, nodeData, inputs) => {
    const safeId = sanitizeNodeId(nodeId)
    const resultVar = `letsgo_${safeId}_result`

    // Get the two input references
    const inputKeys = Object.keys(inputs)
    if (inputKeys.length < 2) {
        throw new Error(`CorrTest node ${nodeId}: requires exactly 2 inputs, got ${inputKeys.length}`)
    }

    const input1 = inputs[inputKeys[0]]
    const input2 = inputs[inputKeys[1]]

    const col1 = nodeData.selectedColumn1 as string
    const col2 = nodeData.selectedColumn2 as string

    let col1Expr: string
    let col2Expr: string

    if (col1 && col2) {
        col1Expr = `${input1.varName}[[${quoteColumn(col1)}]]`
        col2Expr = `${input2.varName}[[${quoteColumn(col2)}]]`
    } else {
        col1Expr = `${input1.varName}[[1]]`
        col2Expr = `${input2.varName}[[1]]`
    }

    const rCode = [
        `letsgo_${safeId}_complete <- complete.cases(${col1Expr}, ${col2Expr})`,
        `letsgo_${safeId}_col1 <- (${col1Expr})[letsgo_${safeId}_complete]`,
        `letsgo_${safeId}_col2 <- (${col2Expr})[letsgo_${safeId}_complete]`,
        `letsgo_${safeId}_corr <- cor.test(letsgo_${safeId}_col1, letsgo_${safeId}_col2, method = "pearson")`,
        `${resultVar} <- list(r = letsgo_${safeId}_corr$estimate, p = letsgo_${safeId}_corr$p.value)`
    ].join('\n')

    return {
        type: 'CorrTest',
        nodeId,
        rCode,
        outputVar: resultVar,
        isAnalysis: true,
        dependencies: [input1.varName, input2.varName]
    }
}
