<script lang="ts">
    import {
        Handle,
        Position,
        useHandleConnections,
        useNodesData
    } from '@xyflow/svelte'
    import InfoNodeContainer from '$lib/node-elements/InfoNodeContainer.svelte'

    import type { NodePropsExt } from '$lib/types'
    import Divider from '$lib/node-elements/Divider.svelte'

    export let id: NodePropsExt['id']

    const connections = useHandleConnections({
        nodeId: id,
        type: 'target'
    })

    $: inflow = useNodesData($connections[0]?.source)
    $: data = $inflow?.data ?? {}
    $: ({ length } = $connections)
    $: id = ($inflow?.id as string) ?? ''
    $: type = ($inflow?.type as string) ?? ''
</script>

<InfoNodeContainer title="Inspector">
    <Handle
        isConnectable={length === 0}
        position={Position.Left}
        type="target"
    />
    {#if $inflow}
        <p>ID: {id}</p>
        <p>Type: {type}</p>
        <Divider />
        {#each Object.entries(data) as [key, value]}
            <p class="overflow-hidden truncate">
                {key}: {JSON.stringify(value)}
            </p>
        {/each}
    {/if}
</InfoNodeContainer>
