import type { RCodeGenerator } from '../../engine/types'

import { csvLoaderGenerator } from './csv-loader'
import { columnSelectorGenerator } from './column-selector'
import { rangeFilterGenerator } from './range-filter'
import { valueFilterGenerator } from './value-filter'
import { renameColumnGenerator } from './rename-column'
import { meanGenerator } from './mean'
import { uniqueValuesGenerator } from './unique-values'
import { tTestGenerator } from './t-test'
import { corrTestGenerator } from './corr-test'
import { exportCsvGenerator } from './export-csv'

export {
    csvLoaderGenerator,
    columnSelectorGenerator,
    rangeFilterGenerator,
    valueFilterGenerator,
    renameColumnGenerator,
    meanGenerator,
    uniqueValuesGenerator,
    tTestGenerator,
    corrTestGenerator,
    exportCsvGenerator
}

/**
 * Map of node type names to their R code generators.
 * Keys match the Svelte Flow node type names used in commons/index.ts.
 */
export const generators: Record<string, RCodeGenerator> = {
    CsvLoader: csvLoaderGenerator,
    ColumnSelector: columnSelectorGenerator,
    RangeFilter: rangeFilterGenerator,
    ValueFilter: valueFilterGenerator,
    RenameColumn: renameColumnGenerator,
    Mean: meanGenerator,
    UniqueValues: uniqueValuesGenerator,
    TwoSampleTTest: tTestGenerator,
    CorrTest: corrTestGenerator,
    ExportCSV: exportCsvGenerator
}

/**
 * Register all node R code generators with the given registry.
 * The registry is a Map<string, RCodeGenerator> that maps node type names
 * to their generator functions.
 */
export function registerAllNodes(registry: Map<string, RCodeGenerator>): void {
    for (const [type, generator] of Object.entries(generators)) {
        registry.set(type, generator)
    }
}
