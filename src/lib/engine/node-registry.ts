import type { RCodeGenerator } from './types'

const registry = new Map<string, RCodeGenerator>()

export function registerNode(type: string, generator: RCodeGenerator): void {
    registry.set(type, generator)
}

export function getGenerator(type: string): RCodeGenerator | undefined {
    return registry.get(type)
}

export function getAllTypes(): string[] {
    return [...registry.keys()]
}
