import type { RCodeGenerator } from '../../engine/types'
import { quoteColumn, sanitizeNodeId } from './utils'

/**
 * R code generator for TwoSampleTTest (analysis) nodes.
 *
 * Performs a two-sample or paired t-test between two columns,
 * along with a variance equality test (var.test / F-test, analogous to Levene's).
 *
 * Expects two inputs keyed by handle ID, each providing a dataset+column reference.
 * The upstream ColumnSelector nodes set the selectedColumn in their nodeData.
 */
export const tTestGenerator: RCodeGenerator = (nodeId, nodeData, inputs) => {
    const safeId = sanitizeNodeId(nodeId)
    const resultVar = `letsgo_${safeId}_result`

    const paired = (nodeData.paired as boolean) ?? false

    // Get the two input references - they come from two separate connections
    const inputKeys = Object.keys(inputs)
    if (inputKeys.length < 2) {
        throw new Error(`TwoSampleTTest node ${nodeId}: requires exactly 2 inputs, got ${inputKeys.length}`)
    }

    const input1 = inputs[inputKeys[0]]
    const input2 = inputs[inputKeys[1]]

    // The selectedColumn for each input comes from the upstream node's data
    // which is encoded in the nodeData by the executor
    const col1 = nodeData.selectedColumn1 as string
    const col2 = nodeData.selectedColumn2 as string

    let col1Expr: string
    let col2Expr: string

    if (col1 && col2) {
        // Column names are provided - extract vectors from datasets
        col1Expr = `na.omit(${input1.varName}[[${quoteColumn(col1)}]])`
        col2Expr = `na.omit(${input2.varName}[[${quoteColumn(col2)}]])`
    } else {
        // Inputs are already column vectors (from ColumnSelector selected-values handle)
        // Use the first column of each input
        col1Expr = `na.omit(${input1.varName}[[1]])`
        col2Expr = `na.omit(${input2.varName}[[1]])`
    }

    const rCode = [
        `letsgo_${safeId}_col1 <- ${col1Expr}`,
        `letsgo_${safeId}_col2 <- ${col2Expr}`,
        `letsgo_${safeId}_ttest <- t.test(letsgo_${safeId}_col1, letsgo_${safeId}_col2, paired = ${paired ? 'TRUE' : 'FALSE'})`,
        `letsgo_${safeId}_levene <- var.test(letsgo_${safeId}_col1, letsgo_${safeId}_col2)`,
        `${resultVar} <- list(`,
        `  t = letsgo_${safeId}_ttest$statistic,`,
        `  p = letsgo_${safeId}_ttest$p.value,`,
        `  df = letsgo_${safeId}_ttest$parameter,`,
        `  levene_statistic = letsgo_${safeId}_levene$statistic,`,
        `  levene_p = letsgo_${safeId}_levene$p.value`,
        `)`
    ].join('\n')

    return {
        type: 'TwoSampleTTest',
        nodeId,
        rCode,
        outputVar: resultVar,
        isAnalysis: true,
        dependencies: [input1.varName, input2.varName]
    }
}
