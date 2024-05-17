<script lang="ts">
    import {
        Handle,
        Position,
        useHandleConnections,
        useNodesData,
        useSvelteFlow
    } from '@xyflow/svelte'
    import {
        type ValueTypes,
        type VariableData,
        VariableType
    } from './variable-types'
    import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte'
    import type { Global, NodePropsExt } from '$lib/types'
    import Divider from '$lib/node-elements/Divider.svelte'
    import { getBoolean } from '$lib/helpers'

    export let id: NodePropsExt<VariableData>['id']
    export let data: NodePropsExt<VariableData>['data']

    const types = Object.keys(VariableType)
        .map((key) => VariableType[key as keyof typeof VariableType])
        .filter((value) => typeof value === 'string')
    let selectedType = data.type

    const { updateNodeData } = useSvelteFlow()
    const connections = useHandleConnections({
        nodeId: id,
        type: 'target'
    })

    $: inflow = useNodesData($connections[0]?.source)
    $: inputType = $inflow?.data.type as keyof typeof VariableType
    $: globals = $inflow?.data.globals as Global[]
    $: value = $inflow?.data.value as ValueTypes

    let status: string
    let castedValue: ValueTypes
    $: switch (selectedType) {
        case VariableType.string:
            castedValue = String(value)
            status = castedValue == null ? 'Failed' : 'Success'
            break
        case VariableType.number:
            castedValue = Number(value)
            status =
                castedValue == null || Number.isNaN(castedValue)
                    ? 'Failed'
                    : 'Success'
            break
        case VariableType.boolean:
            castedValue = getBoolean(value)
            status = castedValue == null ? 'Failed' : 'Success'
            break
        default:
            castedValue = value
    }

    $: updateNodeData(
        id,
        { globals: globals ?? [], type: selectedType, value: castedValue },
        { replace: false }
    )
</script>

<OperationalNodeContainer title="Tranform to">
    <Handle position={Position.Left} type="target" />
    <select
        class="nodrag my-1 w-full rounded-md border border-[#5d3a8b] bg-white text-sm text-[#5d3a8b]"
        bind:value={selectedType}
    >
        {#each types as type}
            {#if type !== 'null' && type !== inputType}
                <option
                    selected={type === VariableType[selectedType]}
                    value={type}>{type}</option
                >
            {/if}
        {/each}
    </select>
    <Divider />
    <div>Status: {status}</div>
    <Handle position={Position.Right} type="source" />
</OperationalNodeContainer>
