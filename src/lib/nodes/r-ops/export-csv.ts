import type { RCodeGenerator } from '../../engine/types'
import { sanitizeNodeId } from './utils'

/**
 * R code generator for ExportCSV nodes.
 *
 * Combines one or more input datasets using bind_rows() and prepares
 * the result for export. The actual CSV string generation is handled
 * by the executor (pulling data from R to JS).
 */
export const exportCsvGenerator: RCodeGenerator = (nodeId, _nodeData, inputs) => {
    const safeId = sanitizeNodeId(nodeId)
    const outputVar = `letsgo_${safeId}`

    const inputKeys = Object.keys(inputs)
    if (inputKeys.length === 0) {
        throw new Error(`ExportCSV node ${nodeId}: no inputs connected`)
    }

    const inputVars = inputKeys.map((key) => inputs[key].varName)
    const dependencies = [...inputVars]

    let rCode: string
    if (inputVars.length === 1) {
        rCode = `${outputVar} <- ${inputVars[0]}`
    } else {
        rCode = `${outputVar} <- bind_rows(${inputVars.join(', ')})`
    }

    return {
        type: 'ExportCSV',
        nodeId,
        rCode,
        outputVar,
        dependencies
    }
}
