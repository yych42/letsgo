<script lang="ts">
    import {
        Handle,
        Position,
        useHandleConnections,
        useNodesData,
        useSvelteFlow
    } from '@xyflow/svelte'
    import InfoNodeContainer from '$lib/node-elements/InfoNodeContainer.svelte'
    import { getColumnNames } from '$lib/helpers'
    import Divider from '$lib/node-elements/Divider.svelte'
    import type { ColumnNameData, GenericRow, NodePropsExt } from '$lib/types'

    export let id: NodePropsExt<ColumnNameData>['id']
    export let data: NodePropsExt<ColumnNameData>['data']
    const { updateNodeData } = useSvelteFlow()
    const connections = useHandleConnections({
        nodeId: id,
        type: 'target'
    })

    $: inflow = useNodesData($connections[0]?.source)
    $: dataset = $inflow?.data.dataset as GenericRow[]

    $: updateNodeData(
        id,
        {
            columnNames: getColumnNames(dataset || [])
        },
        { replace: true }
    )
    $: columns = data.columnNames
</script>

<InfoNodeContainer title="Column Names">
    {#if columns && columns.length}
        {#each columns.slice(0, 5) ?? [] as column}
            <li>{column}</li>
        {/each}
        {#if columns.length > 5}
            <li>...</li>
        {/if}
    {:else}
        <li>No data</li>
    {/if}

    <Divider />

    <p class="font-sans text-sm">{(columns ?? []).length} total</p>

    <Handle position={Position.Left} type="target" />
    <Handle position={Position.Right} type="source" />
</InfoNodeContainer>
