import type { RCodeGenerator } from '../../engine/types'

/**
 * R code generator for CSVLoader nodes.
 *
 * The CSV data is already pushed to R by the UI layer (via r-data-store).
 * This generator simply verifies the variable exists and passes it through.
 */
export const csvLoaderGenerator: RCodeGenerator = (nodeId, nodeData, _inputs) => {
    const rVarName = nodeData.rVarName as string

    if (!rVarName) {
        throw new Error(`CSVLoader node ${nodeId}: missing rVarName in nodeData`)
    }

    // Just verify the variable exists in R - no transformation needed
    const rCode = `stopifnot(exists("${rVarName}"))`

    return {
        type: 'CsvLoader',
        nodeId,
        rCode,
        outputVar: rVarName,
        dependencies: []
    }
}
