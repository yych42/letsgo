import { prettier, runkai, svelte, tailwind } from '@runkai/eslint-config'

export default runkai(
    {}, // @antfu/eslint-config options, must always be present as first item
    svelte,
    tailwind,
    prettier,
    {
        // ESlint Flat config rule object
    }
)
