import type { NodeData } from '$lib/types'

export enum VariableType {
    string = 'string',
    number = 'number',
    boolean = 'boolean',
    object = 'object',
    array = 'array',
    null = 'null'
}

export type ValueTypes = string | number | boolean | object | any[] | null

export interface VariableData extends NodeData {
    type: VariableType
    value: any
}
