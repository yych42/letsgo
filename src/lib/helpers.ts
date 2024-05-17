import type { ValueTypes } from './nodes/dev-tools/variable-types'
import type {
    ColumnData,
    ColumnType,
    DataType,
    GenericRow,
    Global
} from './types'
import { useNodesData } from '@xyflow/svelte'

function generateHistogram(data: DataType[]): string {
    // Define histogram characters
    const histogramChars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
    const maxBars = 10

    // Helper function to map frequency to a histogram character
    function getHistogramSymbol(freq: number, maxFreq: number): string {
        const index = Math.floor((freq / maxFreq) * (histogramChars.length - 1))
        return histogramChars[index]
    }

    // Filter out null and undefined values
    const filteredData = data.filter((value): value is number => value != null)

    if (filteredData.length === 0) {
        return ''
    }

    // Determine the range of the data
    const min = Math.min(...filteredData)
    const max = Math.max(...filteredData)

    // Calculate the range for each bar
    const range = (max - min) / maxBars

    // Initialize the frequency array
    const frequencies = Array.from({ length: maxBars }).fill(0) as number[]

    // Calculate the frequency for each bar
    for (const value of filteredData) {
        const index = Math.min(Math.floor((value - min) / range), maxBars - 1)
        frequencies[index]++
    }

    // Find the maximum frequency
    const maxFrequency = Math.max(...frequencies)

    // Generate the histogram string
    const histogramString = frequencies
        .map((frequency) => getHistogramSymbol(frequency, maxFrequency))
        .join('')

    return histogramString
}

function range(data: DataType[]): { min: number; max: number } | null {
    // Filter out null and undefined values
    const filteredData = data.filter((value): value is number => value != null)

    if (filteredData.length === 0) return null

    // Calculate the minimum and maximum values
    const min = Math.min(...filteredData)
    const max = Math.max(...filteredData)

    return { min, max }
}

function missing(data: DataType[]): { percent: number; count: number } {
    // Calculate the number of missing values
    const missingCount = data.filter((value) => value == null).length

    // Calculate the percentage of missing values
    const percentage = (missingCount / data.length) * 100

    // Return the percentage and the count
    return { percent: percentage, count: missingCount }
}

export { generateHistogram, range, missing }

function getColumnNames(data: GenericRow[]): string[] {
    if (data.length === 0) {
        return []
    }

    return Object.keys(data[0])
}

function determineColumnType(columnData: DataType[]): ColumnType {
    if (
        columnData.every(
            (d) => typeof d === 'number' || d === undefined || d === null
        )
    ) {
        return 'numeric'
    } else if (
        columnData.every(
            (d) => typeof d === 'string' || d === undefined || d === null
        )
    ) {
        return 'string'
    } else {
        return 'mixed'
    }
}

function getColumnData(data: GenericRow[], columnName: string): ColumnData {
    if (data === undefined || data.length === 0) {
        return { values: [], type: undefined }
    }
    const values = data.map((row) => row[columnName])
    const type = determineColumnType(values)
    return { values, type }
}

export { getColumnNames, getColumnData }

export function getBoolean(value: ValueTypes) {
    switch (value) {
        case true:
        case 'true':
        case 1:
        case '1':
        case 'on':
        case 'yes':
            return true
        default:
            return false
    }
}

const getGlobal = (global: Global) => {
    return useNodesData(global.id)
}

export { getGlobal }
