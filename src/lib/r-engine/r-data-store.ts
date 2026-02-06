import { getWebR } from './webr-service'
import type { ColumnStats, DataPreview, RColumnType, RDataRef } from './types'

function sanitizeVarName(nodeId: string): string {
    return `letsgo_${nodeId.replace(/[^a-z0-9]/gi, '_')}`
}

export async function pushDataToR(
    nodeId: string,
    data: Record<string, unknown>[] | { [col: string]: unknown[] }
): Promise<RDataRef> {
    const webR = await getWebR()
    const shelter = await new webR.Shelter()
    const varName = sanitizeVarName(nodeId)

    try {
        let rows: Record<string, unknown>[]
        if (Array.isArray(data)) {
            rows = data
        } else {
            const cols = Object.keys(data)
            const len = (data[cols[0]]).length
            rows = []
            for (let i = 0; i < len; i++) {
                const row: Record<string, unknown> = {}
                for (const col of cols) {
                    row[col] = (data[col])[i]
                }
                rows.push(row)
            }
        }

        if (rows.length === 0) {
            await shelter.evalR(`${varName} <- data.frame()`)
            return { varName, nrow: 0, ncol: 0, colNames: [], colTypes: {} }
        }

        const columns = Object.keys(rows[0])
        const colData: Record<string, unknown[]> = {}
        for (const col of columns) {
            colData[col] = rows.map((r) => r[col])
        }

        const dfObj: Record<string, any> = {}
        for (const col of columns) {
            const values = colData[col]
            const isNumeric = values.every(
                (v) => v === null || v === undefined || typeof v === 'number' || !Number.isNaN(Number(v))
            )
            if (isNumeric) {
                dfObj[col] = new Float64Array(
                    values.map((v) => (v === null || v === undefined ? Number.NaN : Number(v)))
                )
            } else {
                dfObj[col] = values.map((v) => (v === null || v === undefined ? 'NA' : String(v)))
            }
        }

        const rDf = await new webR.RObject(dfObj)
        await webR.objs.globalEnv.bind(varName, rDf)

        const metaCode = `
			list(
				nrow = nrow(${varName}),
				ncol = ncol(${varName}),
				colNames = colnames(${varName}),
				colTypes = sapply(${varName}, function(x) class(x)[1])
			)
		`
        const metaResult = await shelter.evalR(metaCode)
        const meta = await metaResult.toJs()

        const nrow = meta.values[0].values[0] as number
        const ncol = meta.values[1].values[0] as number
        const colNames = meta.values[2].values as string[]
        const colTypesArr = meta.values[3].values as string[]

        const colTypes: Record<string, RColumnType> = {}
        for (let i = 0; i < colNames.length; i++) {
            colTypes[colNames[i]] = colTypesArr[i] as RColumnType
        }

        return { varName, nrow, ncol, colNames: [...colNames], colTypes }
    } catch (err) {
        throw new Error(
            `Failed to push data to R: ${err instanceof Error ? err.message : String(err)}`
        )
    } finally {
        shelter.purge()
    }
}

export async function getPreview(varName: string, maxRows: number = 100): Promise<DataPreview> {
    const webR = await getWebR()
    const shelter = await new webR.Shelter()

    try {
        const metaCode = `list(nrow = nrow(${varName}), ncol = ncol(${varName}), colNames = colnames(${varName}))`
        const metaResult = await shelter.evalR(metaCode)
        const meta = await metaResult.toJs()

        const totalRows = meta.values[0].values[0] as number
        const totalCols = meta.values[1].values[0] as number
        const columns = meta.values[2].values as string[]

        const previewCode = `head(${varName}, ${maxRows})`
        const previewResult = await shelter.evalR(previewCode)
        const rows = (await previewResult.toD3()) as Record<string, unknown>[]

        return {
            columns: [...columns],
            rows,
            totalRows,
            totalCols
        }
    } catch (err) {
        throw new Error(
            `Failed to get preview: ${err instanceof Error ? err.message : String(err)}`
        )
    } finally {
        shelter.purge()
    }
}

export async function getColumnStats(varName: string, columnName: string): Promise<ColumnStats> {
    const webR = await getWebR()
    const shelter = await new webR.Shelter()

    try {
        const safeCol = columnName.replace(/`/g, '\\`')

        const code = `
			col <- ${varName}[[\`${safeCol}\`]]
			stats <- list(
				type = class(col)[1],
				missing = sum(is.na(col)),
				total = length(col),
				unique = length(unique(col))
			)
			if (is.numeric(col)) {
				stats$min <- min(col, na.rm=TRUE)
				stats$max <- max(col, na.rm=TRUE)
				stats$mean <- mean(col, na.rm=TRUE)
				stats$median <- median(col, na.rm=TRUE)
				stats$sd <- sd(col, na.rm=TRUE)
			}
			stats
		`

        const result = await shelter.evalR(code)
        const statsJs = await result.toJs()

        const names = statsJs.names as string[]
        const values = statsJs.values as any[]

        const statsMap: Record<string, any> = {}
        for (let i = 0; i < names.length; i++) {
            const val = values[i]
            statsMap[names[i]] = val.values !== undefined ? val.values[0] : val
        }

        const total = statsMap.total as number
        const missing = statsMap.missing as number

        const colStats: ColumnStats = {
            name: columnName,
            type: statsMap.type as RColumnType,
            missing,
            missingPct: total > 0 ? (missing / total) * 100 : 0,
            unique: statsMap.unique as number,
            total
        }

        if (statsMap.min !== undefined) {
            colStats.min = statsMap.min as number
            colStats.max = statsMap.max as number
            colStats.mean = statsMap.mean as number
            colStats.median = statsMap.median as number
            colStats.sd = statsMap.sd as number
        }

        return colStats
    } catch (err) {
        throw new Error(
            `Failed to get column stats: ${err instanceof Error ? err.message : String(err)}`
        )
    } finally {
        shelter.purge()
    }
}

export async function getAllColumnStats(varName: string): Promise<Record<string, ColumnStats>> {
    const webR = await getWebR()
    const shelter = await new webR.Shelter()

    try {
        const colNamesResult = await shelter.evalR(`colnames(${varName})`)
        const colNamesJs = await colNamesResult.toJs()
        const colNames = colNamesJs.values as string[]

        const allStats: Record<string, ColumnStats> = {}
        for (const col of colNames) {
            allStats[col] = await getColumnStats(varName, col)
        }

        return allStats
    } finally {
        shelter.purge()
    }
}

export async function deleteDataset(varName: string): Promise<void> {
    const webR = await getWebR()
    const shelter = await new webR.Shelter()
    try {
        await shelter.evalR(`rm(${varName})`)
    } finally {
        shelter.purge()
    }
}

export async function getDataAsCSV(varName: string): Promise<string> {
    const webR = await getWebR()
    const shelter = await new webR.Shelter()

    try {
        const code = `
			con <- textConnection("csv_output", "w")
			write.csv(${varName}, con, row.names = FALSE)
			close(con)
			paste(csv_output, collapse = "\\n")
		`
        const result = await shelter.evalR(code)
        const jsResult = await result.toJs()
        return jsResult.values[0] as string
    } catch (err) {
        throw new Error(
            `Failed to export CSV: ${err instanceof Error ? err.message : String(err)}`
        )
    } finally {
        shelter.purge()
    }
}
