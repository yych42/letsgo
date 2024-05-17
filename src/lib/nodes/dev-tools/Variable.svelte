<script lang="ts">
    import { Handle, Position, useSvelteFlow } from '@xyflow/svelte'
    import { type VariableData, VariableType } from './variable-types'
    import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte'
    import type { NodePropsExt } from '$lib/types'
    import Divider from '$lib/node-elements/Divider.svelte'

    export let id: NodePropsExt<VariableData>['id']
    export let data: NodePropsExt<VariableData>['data']

    const { updateNodeData } = useSvelteFlow()

    const types = Object.keys(VariableType)
        .map((key) => VariableType[key as keyof typeof VariableType])
        .filter((value) => typeof value === 'string')
    let selectedType = VariableType[data.type]
    let value: string

    $: updateNodeData(
        id,
        {
            type: selectedType,
            value
        },
        { replace: true }
    )
</script>

<OperationalNodeContainer title="Variable">
    <div>
        Type: {selectedType}
    </div>
    <select
        class="nodrag my-1 w-full rounded-md border border-[#5d3a8b] bg-white text-sm text-[#5d3a8b]"
        bind:value={selectedType}
    >
        {#each types as type}
            <option selected={type === selectedType} value={type}>{type}</option
            >
        {/each}
    </select>
    <Divider />
    {#if selectedType === VariableType.string}
        <input
            class="nodrag my-1 w-full rounded-md border border-[#5d3a8b] bg-white px-3 py-2 text-sm text-[#5d3a8b]"
            type="text"
            bind:value
        />
    {/if}
    {#if selectedType === VariableType.number}
        <input
            class="nodrag my-1 w-full rounded-md border border-[#5d3a8b] bg-white px-3 py-2 text-sm text-[#5d3a8b]"
            type="number"
            bind:value
        />
    {/if}
    {#if selectedType === VariableType.boolean}
        <select
            class="nodrag my-1 w-full rounded-md border border-[#5d3a8b] bg-white px-3 py-2 text-sm text-[#5d3a8b]"
            bind:value
        >
            <option value="true">true</option>
            <option value="false">false</option>
        </select>
    {/if}
    <Handle position={Position.Right} type="source" />
</OperationalNodeContainer>
