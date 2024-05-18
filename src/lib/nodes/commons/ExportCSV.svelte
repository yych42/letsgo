<script lang="ts">
    import {
        Handle,
        Position,
        useHandleConnections,
        useNodesData,
        useSvelteFlow
    } from '@xyflow/svelte'
    import { derived } from 'svelte/store'
    import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte'
    import Divider from '$lib/node-elements/Divider.svelte'
    import Papa from 'papaparse'

    import type { MeanData, NodePropsExt } from '$lib/types'

    export let id: NodePropsExt<MeanData>['id']
    export let data: NodePropsExt<MeanData>['data']

    const connections = useHandleConnections({
        nodeId: id,
        type: 'target'
    })

    $: inflows = $connections.map((connection) =>
        useNodesData(connection.source)
    )

    $: combinedDataset = derived(
        inflows,
        ([...arr]) => {
            return arr.flatMap((object) => object?.data.dataset)
        },
        []
    )
</script>

<OperationalNodeContainer title="Save as CSV">
    <Handle
        position={Position.Top}
        type="target"
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white"
    />

    {#if $combinedDataset.length > 0}
        <button
            class="mx-2 cursor-pointer file:cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium"
            on:click={() => {
                console.log($combinedDataset)
                const csv = Papa.unparse($combinedDataset)
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'combined-dataset.csv'
                a.click()
                URL.revokeObjectURL(url)
            }}
        >
            Export CSV
        </button>
    {:else}
        <p class="px-3 font-sans text-sm">Connect with dataset sources</p>
    {/if}
</OperationalNodeContainer>
