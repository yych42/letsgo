import { describe, expect, it } from 'vitest'
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
import type { RDataRef } from '../../r-engine/types'

function makeRef(varName: string): RDataRef {
    return { varName, nrow: 10, ncol: 3, colNames: ['a', 'b', 'c'], colTypes: { a: 'numeric', b: 'numeric', c: 'character' } }
}

describe('csvLoaderGenerator', () => {
    it('returns pass-through operation with correct metadata', () => {
        const result = csvLoaderGenerator('node-1', { rVarName: 'letsgo_csv_1' }, {})
        expect(result.type).toBe('CsvLoader')
        expect(result.nodeId).toBe('node-1')
        expect(result.outputVar).toBe('letsgo_csv_1')
        expect(result.dependencies).toEqual([])
        expect(result.rCode).toContain('stopifnot')
        expect(result.rCode).toContain('letsgo_csv_1')
    })

    it('throws when rVarName is missing', () => {
        expect(() => csvLoaderGenerator('node-1', {}, {})).toThrow('missing rVarName')
    })
})

describe('columnSelectorGenerator', () => {
    it('generates pass-through assignment', () => {
        const result = columnSelectorGenerator(
            'col-sel-1',
            { selectedColumn: 'age' },
            { default: makeRef('letsgo_upstream') }
        )
        expect(result.type).toBe('ColumnSelector')
        expect(result.outputVar).toBe('letsgo_col_sel_1')
        expect(result.rCode).toBe('letsgo_col_sel_1 <- letsgo_upstream')
        expect(result.dependencies).toEqual(['letsgo_upstream'])
    })

    it('throws when no input connected', () => {
        expect(() =>
            columnSelectorGenerator('col-sel-1', { selectedColumn: 'age' }, {})
        ).toThrow('no input connected')
    })

    it('throws when no column selected', () => {
        expect(() =>
            columnSelectorGenerator('col-sel-1', {}, { default: makeRef('letsgo_upstream') })
        ).toThrow('no column selected')
    })
})

describe('rangeFilterGenerator', () => {
    const baseData = { min: 0, max: 100, setAsMissing: false, selectedColumn: 'score' }
    const inputs = { 'dataset-target': makeRef('letsgo_up') }

    it('generates filter code when setAsMissing is false', () => {
        const result = rangeFilterGenerator('rf-1', baseData, inputs)
        expect(result.type).toBe('RangeFilter')
        expect(result.outputVar).toBe('letsgo_rf_1')
        expect(result.rCode).toContain('filter')
        expect(result.rCode).toContain('`score`')
        expect(result.rCode).toContain('>= 0')
        expect(result.rCode).toContain('<= 100')
        expect(result.dependencies).toEqual(['letsgo_up'])
    })

    it('generates mutate code when setAsMissing is true', () => {
        const result = rangeFilterGenerator(
            'rf-1',
            { ...baseData, setAsMissing: true },
            inputs
        )
        expect(result.rCode).toContain('mutate')
        expect(result.rCode).toContain('ifelse')
        expect(result.rCode).toContain('NA')
    })

    it('accepts input from vector-target handle', () => {
        const result = rangeFilterGenerator('rf-1', baseData, {
            'vector-target': makeRef('letsgo_vec')
        })
        expect(result.dependencies).toEqual(['letsgo_vec'])
    })

    it('throws when no input connected', () => {
        expect(() => rangeFilterGenerator('rf-1', baseData, {})).toThrow('no input connected')
    })

    it('throws when no column selected', () => {
        expect(() =>
            rangeFilterGenerator('rf-1', { ...baseData, selectedColumn: '' }, inputs)
        ).toThrow('no column selected')
    })
})

describe('valueFilterGenerator', () => {
    const baseData = { filterValue: 'hello', setAsMissing: false, selectedColumn: 'name' }
    const inputs = { 'dataset-target': makeRef('letsgo_up') }

    it('generates filter code when setAsMissing is false', () => {
        const result = valueFilterGenerator('vf-1', baseData, inputs)
        expect(result.type).toBe('ValueFilter')
        expect(result.outputVar).toBe('letsgo_vf_1')
        expect(result.rCode).toContain('filter')
        expect(result.rCode).toContain('`name`')
        expect(result.rCode).toContain('"hello"')
        expect(result.dependencies).toEqual(['letsgo_up'])
    })

    it('generates mutate code when setAsMissing is true', () => {
        const result = valueFilterGenerator(
            'vf-1',
            { ...baseData, setAsMissing: true },
            inputs
        )
        expect(result.rCode).toContain('mutate')
        expect(result.rCode).toContain('ifelse')
        expect(result.rCode).toContain('NA')
    })

    it('escapes special characters in value', () => {
        const result = valueFilterGenerator(
            'vf-1',
            { ...baseData, filterValue: 'say "hi"' },
            inputs
        )
        expect(result.rCode).toContain('say \\"hi\\"')
    })

    it('reads value from nodeData.value as fallback', () => {
        const result = valueFilterGenerator(
            'vf-1',
            { value: 'fallback', setAsMissing: false, selectedColumn: 'name' },
            inputs
        )
        expect(result.rCode).toContain('"fallback"')
    })

    it('throws when no input connected', () => {
        expect(() => valueFilterGenerator('vf-1', baseData, {})).toThrow('no input connected')
    })

    it('throws when no column selected', () => {
        expect(() =>
            valueFilterGenerator('vf-1', { ...baseData, selectedColumn: '' }, inputs)
        ).toThrow('no column selected')
    })
})

describe('renameColumnGenerator', () => {
    const inputs = { default: makeRef('letsgo_up') }

    it('generates rename code with backtick quoting', () => {
        const result = renameColumnGenerator(
            'rn-1',
            { selectedColumn: 'old name', newColumnName: 'new name' },
            inputs
        )
        expect(result.type).toBe('RenameColumn')
        expect(result.outputVar).toBe('letsgo_rn_1')
        expect(result.rCode).toContain('rename')
        expect(result.rCode).toContain('`new name`')
        expect(result.rCode).toContain('`old name`')
        expect(result.dependencies).toEqual(['letsgo_up'])
    })

    it('throws when no input connected', () => {
        expect(() =>
            renameColumnGenerator('rn-1', { selectedColumn: 'a', newColumnName: 'b' }, {})
        ).toThrow('no input connected')
    })

    it('throws when no column selected', () => {
        expect(() =>
            renameColumnGenerator('rn-1', { newColumnName: 'b' }, inputs)
        ).toThrow('no column selected')
    })

    it('throws when no new column name specified', () => {
        expect(() =>
            renameColumnGenerator('rn-1', { selectedColumn: 'a' }, inputs)
        ).toThrow('no new column name')
    })
})

describe('meanGenerator', () => {
    const inputs = { default: makeRef('letsgo_up') }

    it('generates summarise code with mean/sd/n', () => {
        const result = meanGenerator(
            'mean-1',
            { selectedColumn: 'score' },
            inputs
        )
        expect(result.type).toBe('Mean')
        expect(result.outputVar).toBe('letsgo_mean_1_result')
        expect(result.isAnalysis).toBe(true)
        expect(result.rCode).toContain('summarise')
        expect(result.rCode).toContain('mean(`score`')
        expect(result.rCode).toContain('sd(`score`')
        expect(result.rCode).toContain('sum(!is.na(`score`))')
        expect(result.dependencies).toEqual(['letsgo_up'])
    })

    it('throws when no input connected', () => {
        expect(() =>
            meanGenerator('mean-1', { selectedColumn: 'score' }, {})
        ).toThrow('no input connected')
    })

    it('throws when no column selected', () => {
        expect(() =>
            meanGenerator('mean-1', {}, inputs)
        ).toThrow('no column selected')
    })
})

describe('uniqueValuesGenerator', () => {
    const inputs = { default: makeRef('letsgo_up') }

    it('generates count + frequency code', () => {
        const result = uniqueValuesGenerator(
            'uv-1',
            { selectedColumn: 'color' },
            inputs
        )
        expect(result.type).toBe('UniqueValues')
        expect(result.outputVar).toBe('letsgo_uv_1_result')
        expect(result.isAnalysis).toBe(true)
        expect(result.rCode).toContain('count(`color`')
        expect(result.rCode).toContain('frequency')
        expect(result.rCode).toContain('percentage')
        expect(result.rCode).toContain('head(5)')
        expect(result.dependencies).toEqual(['letsgo_up'])
    })

    it('respects custom topN', () => {
        const result = uniqueValuesGenerator(
            'uv-1',
            { selectedColumn: 'color', topN: 10 },
            inputs
        )
        expect(result.rCode).toContain('head(10)')
    })

    it('throws when no input connected', () => {
        expect(() =>
            uniqueValuesGenerator('uv-1', { selectedColumn: 'color' }, {})
        ).toThrow('no input connected')
    })

    it('throws when no column selected', () => {
        expect(() =>
            uniqueValuesGenerator('uv-1', {}, inputs)
        ).toThrow('no column selected')
    })
})

describe('tTestGenerator', () => {
    const inputs = {
        'handle-1': makeRef('letsgo_a'),
        'handle-2': makeRef('letsgo_b')
    }

    it('generates t-test and levene test code', () => {
        const result = tTestGenerator('tt-1', {}, inputs)
        expect(result.type).toBe('TwoSampleTTest')
        expect(result.outputVar).toBe('letsgo_tt_1_result')
        expect(result.isAnalysis).toBe(true)
        expect(result.rCode).toContain('t.test')
        expect(result.rCode).toContain('var.test')
        expect(result.rCode).toContain('paired = FALSE')
        expect(result.dependencies).toEqual(['letsgo_a', 'letsgo_b'])
    })

    it('generates paired t-test when paired is true', () => {
        const result = tTestGenerator('tt-1', { paired: true }, inputs)
        expect(result.rCode).toContain('paired = TRUE')
    })

    it('uses column names when provided', () => {
        const result = tTestGenerator(
            'tt-1',
            { selectedColumn1: 'x', selectedColumn2: 'y' },
            inputs
        )
        expect(result.rCode).toContain('`x`')
        expect(result.rCode).toContain('`y`')
    })

    it('uses first column as fallback when no column names', () => {
        const result = tTestGenerator('tt-1', {}, inputs)
        expect(result.rCode).toContain('[[1]]')
    })

    it('throws when fewer than 2 inputs', () => {
        expect(() =>
            tTestGenerator('tt-1', {}, { 'handle-1': makeRef('letsgo_a') })
        ).toThrow('requires exactly 2 inputs')
    })
})

describe('corrTestGenerator', () => {
    const inputs = {
        'handle-1': makeRef('letsgo_a'),
        'handle-2': makeRef('letsgo_b')
    }

    it('generates correlation test code', () => {
        const result = corrTestGenerator('ct-1', {}, inputs)
        expect(result.type).toBe('CorrTest')
        expect(result.outputVar).toBe('letsgo_ct_1_result')
        expect(result.isAnalysis).toBe(true)
        expect(result.rCode).toContain('cor.test')
        expect(result.rCode).toContain('pearson')
        expect(result.rCode).toContain('complete.cases')
        expect(result.dependencies).toEqual(['letsgo_a', 'letsgo_b'])
    })

    it('uses column names when provided', () => {
        const result = corrTestGenerator(
            'ct-1',
            { selectedColumn1: 'x', selectedColumn2: 'y' },
            inputs
        )
        expect(result.rCode).toContain('`x`')
        expect(result.rCode).toContain('`y`')
    })

    it('uses first column as fallback when no column names', () => {
        const result = corrTestGenerator('ct-1', {}, inputs)
        expect(result.rCode).toContain('[[1]]')
    })

    it('throws when fewer than 2 inputs', () => {
        expect(() =>
            corrTestGenerator('ct-1', {}, { 'handle-1': makeRef('letsgo_a') })
        ).toThrow('requires exactly 2 inputs')
    })
})

describe('exportCsvGenerator', () => {
    it('generates simple assignment for single input', () => {
        const result = exportCsvGenerator('exp-1', {}, {
            default: makeRef('letsgo_up')
        })
        expect(result.type).toBe('ExportCSV')
        expect(result.outputVar).toBe('letsgo_exp_1')
        expect(result.rCode).toBe('letsgo_exp_1 <- letsgo_up')
        expect(result.dependencies).toEqual(['letsgo_up'])
    })

    it('generates bind_rows for multiple inputs', () => {
        const result = exportCsvGenerator('exp-1', {}, {
            'handle-1': makeRef('letsgo_a'),
            'handle-2': makeRef('letsgo_b')
        })
        expect(result.rCode).toContain('bind_rows')
        expect(result.rCode).toContain('letsgo_a')
        expect(result.rCode).toContain('letsgo_b')
        expect(result.dependencies).toEqual(['letsgo_a', 'letsgo_b'])
    })

    it('does not set isAnalysis', () => {
        const result = exportCsvGenerator('exp-1', {}, {
            default: makeRef('letsgo_up')
        })
        expect(result.isAnalysis).toBeUndefined()
    })

    it('throws when no inputs connected', () => {
        expect(() => exportCsvGenerator('exp-1', {}, {})).toThrow('no inputs connected')
    })
})
