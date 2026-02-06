import { getWebR } from './webr-service'

export async function executeR(code: string): Promise<void> {
    const webR = await getWebR()
    const shelter = await new webR.Shelter()
    try {
        await shelter.evalR(code)
    } catch (err) {
        throw new Error(`R execution error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
        shelter.purge()
    }
}

export async function executeRAndGetResult<T = unknown>(
    code: string,
    convert: 'number' | 'string' | 'array' | 'object' | 'd3'
): Promise<T> {
    const webR = await getWebR()
    const shelter = await new webR.Shelter()
    try {
        const result = await shelter.evalR(code)
        let jsValue: unknown

        switch (convert) {
            case 'number': {
                const values = await result.toArray()
                jsValue = await values[0].toNumber()
                break
            }
            case 'string': {
                const values = await result.toArray()
                jsValue = await values[0].toString()
                break
            }
            case 'array': {
                jsValue = await result.toArray()
                break
            }
            case 'object': {
                jsValue = await result.toJs()
                break
            }
            case 'd3': {
                jsValue = await result.toD3()
                break
            }
        }

        return jsValue as T
    } catch (err) {
        throw new Error(`R execution error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
        shelter.purge()
    }
}

export async function executeRAndGetDataRef(
    code: string,
    varName: string
): Promise<{
        varName: string;
        nrow: number;
        ncol: number;
        colNames: string[];
        colTypes: Record<string, string>;
    }> {
    const webR = await getWebR()
    const shelter = await new webR.Shelter()
    try {
        await shelter.evalR(code)

        const metaCode = [
            `list(`,
            `  nrow = nrow(${varName}),`,
            `  ncol = ncol(${varName}),`,
            `  colNames = colnames(${varName}),`,
            `  colTypes = sapply(${varName}, function(x) class(x)[1])`,
            `)`
        ].join('\n')
        const metaResult = await shelter.evalR(metaCode)
        const meta = await metaResult.toJs()

        const nrow = meta.values[0].values[0] as number
        const ncol = meta.values[1].values[0] as number
        const colNames = meta.values[2].values as string[]
        const colTypesArr = meta.values[3].values as string[]

        const colTypes: Record<string, string> = {}
        for (let i = 0; i < colNames.length; i++) {
            colTypes[colNames[i]] = colTypesArr[i]
        }

        return { varName, nrow, ncol, colNames: [...colNames], colTypes }
    } catch (err) {
        throw new Error(`R execution error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
        shelter.purge()
    }
}
