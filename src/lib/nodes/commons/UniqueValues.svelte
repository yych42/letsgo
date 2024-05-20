<script lang="ts">
    import {
        Handle,
        Position,
        useHandleConnections,
        useNodesData,
        useSvelteFlow
    } from '@xyflow/svelte'
    import { derived } from 'svelte/store'
    import InfoNodeContainer from '$lib/node-elements/InfoNodeContainer.svelte'
    import Divider from '$lib/node-elements/Divider.svelte'
    import { getFrequencyRankedSet } from '$lib/utils/frequency-rank'

    import type { ColumnData, MeanData, NodePropsExt } from '$lib/types'

    export let id: NodePropsExt<MeanData>['id']
    export let data: NodePropsExt<MeanData>['data']

    const { updateNodeData } = useSvelteFlow()
    const connections = useHandleConnections({
        nodeId: id,
        type: 'target'
    })

    $: inflows = $connections.map((connection) =>
        useNodesData(connection.source)
    )

    $: columnData = derived(
        inflows,
        ([...arr]) => {
            return arr.flatMap(
                (object) => (object?.data.columnData as ColumnData)?.values
            ) as number[]
        },
        []
    )

    $: updateNodeData(
        id,
        {
            freqRankedSet: getFrequencyRankedSet($columnData, 5)
        },
        { replace: false }
    )
</script>

<InfoNodeContainer title="Unique values">
    {#if data && data.freqRankedSet && data.freqRankedSet.totalUniqueValues}
        {#each data.freqRankedSet.topValues as value}
            <li
                class="border-b border-white font-mono text-sm hover:border-current"
                title="copy value to clipboard"
                on:click={() =>
                    navigator.clipboard.writeText(String(value.value))}
            >
                {value.value} (n = {value.frequency}; {value.percentage.toFixed(
                    2
                )}%)
            </li>
        {/each}

        <Divider />
        <p class="font-sans text-sm">
            {data.freqRankedSet.totalUniqueValues} unique values
        </p>
    {:else}
        <p class="font-sans text-sm">Provide a column</p>
    {/if}

    <Handle position={Position.Left} type="target" />
    <Handle position={Position.Right} type="source" />
</InfoNodeContainer>
