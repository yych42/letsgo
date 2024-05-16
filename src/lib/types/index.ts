import type { Node, NodeProps, NodeTypes } from '@xyflow/svelte'

export interface NodeExt extends Node {
    data: { [key: string]: any }
}

export interface NodeTypesExt extends NodeTypes {
    [key: string]: any
}

export type Global = { id: string, object: string }

export interface NodeData extends Record<string, unknown> {
    [key: string]: any
    globals?: Global[]
}

export interface NodePropsExt<T extends NodeData = any> extends NodeProps {
    function?: string | null
    args?: any[]
    kwargs?: { [key: string]: any }
    advanced?: boolean
    connected?: { [key: string]: boolean }
    data: T
}

export interface ColumnNameData extends NodeData {
    columnNames: string[]
}

export interface ColumnSelectorData extends ColumnNameData, CSVLoaderData {
    selectedColumn: string
    columnData: ColumnData
}

export type ColumnData = {
    values: DataType[]
    type: ColumnType
}

export interface CSVLoaderData extends NodeData {
    dataset: GenericRow[]
}

export type ColumnType = 'string' | 'numeric' | 'mixed' | undefined
export type DataType = string | number | null | undefined

export type GenericRow = {
    [key: string]: DataType
}

export interface MeanData extends ColumnSelectorData {
    centralTendency: CentralTendency
}

export type CentralTendency = { mean: number, sd: number, n: number } | null
