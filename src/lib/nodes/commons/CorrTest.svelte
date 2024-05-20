<script lang="ts">
    import pcorrTest from '@stdlib/stats/pcorrtest'

    function runCorrTest(data1: number[], data2: number[]) {
        const result = pcorrTest(data1, data2)

        return {
            r: result.pcorr,
            p: result.pValue
        }
    }

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

    import type {
        CentralTendency,
        ColumnData,
        MeanData,
        NodePropsExt
    } from '$lib/types'

    export let id: NodePropsExt<MeanData>['id']
    export let data: NodePropsExt<MeanData>['data']

    const { updateNodeData } = useSvelteFlow()
    const connections = useHandleConnections({
        nodeId: id,
        type: 'target'
    })

    let betweenGroup = true

    $: inflows = $connections.map((connection) =>
        useNodesData(connection.source)
    )

    // Check if we can find two valid columns
    $: columnsData = derived(
        inflows,
        ([...arr]) => {
            return arr.map(
                (object) => object?.data.columnData?.values as number[]
            )
        },
        []
    )

    $: updateNodeData(
        id,
        {
            results:
                $columnsData.length === 2
                    ? runCorrTest(
                          $columnsData[0] as number[],
                          $columnsData[1] as number[]
                      )
                    : null
        },
        { replace: false }
    )
</script>

<InfoNodeContainer title="Pearson Correlation Test">
    {#if data && data.results}
        <!-- <li class="font-bold">Pearson product-moment correlation</li> -->
        <li>t: {data.results.r.toFixed(3)}</li>
        <li>p: {data.results.p.toFixed(2)}</li>
    {:else}
        <p class="font-sans text-sm">Connect with two columns</p>
    {/if}

    <Handle position={Position.Left} type="target" />
    <Handle position={Position.Right} type="source" />
</InfoNodeContainer>
