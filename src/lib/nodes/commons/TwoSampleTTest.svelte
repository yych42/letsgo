<script lang="ts">
    import ttest2 from '@stdlib/stats/ttest2'
    import leveneTest from '@stdlib/stats/levene-test'

    function twoSampleTTest(data1: number[], data2: number[]) {
        const ttestResult = ttest2(data1, data2)
        const leveneResult = leveneTest(data1, data2)

        return {
            t: ttestResult.statistic,
            p: ttestResult.pValue,
            levene: {
                statistic: leveneResult.statistic,
                p: leveneResult.pValue
            }
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

    $: inflows = $connections.map((connection) =>
        useNodesData(connection.source)
    )

    // $: columnData = derived(
    //     inflows,
    //     ([...arr]) => {
    //         return arr.flatMap(
    //             (object) => (object?.data.columnData as ColumnData)?.values
    //         ) as number[]
    //     },
    //     []
    // )

    // Check if we can find two valid columns
    $: columnsData = derived(
        inflows,
        ([...arr]) => {
            return arr.map((object) => object?.data.columnData as number[])
        },
        []
    )

    $: updateNodeData(
        id,
        {
            results:
                $columnsData.length === 2
                    ? twoSampleTTest(
                          $columnsData[0] as number[],
                          $columnsData[1] as number[]
                      )
                    : null
        },
        { replace: false }
    )
</script>

<InfoNodeContainer title="Compare Means">
    {#if data && data.results}
        <!-- <li>Mean: {data.centralTendency.mean.toFixed(2)}</li>
        <li>SD: {data.centralTendency.sd.toFixed(2)}</li> -->
        <li class="font-bold">Welch Two-sample T-Test</li>
        <li>t: {data.results.t.toFixed(3)}</li>
        <li>p: {data.results.p.toFixed(3)}</li>

        <Divider />
        <li class="font-bold">Levene's Test</li>
        <li>Statistic: {data.results.levene.statistic.toFixed(3)}</li>
        <li>p: {data.results.levene.p.toFixed(2)}</li>
    {:else}
        <p class="font-sans text-sm">Provide a column</p>
    {/if}

    <Handle position={Position.Left} type="target" />
    <Handle position={Position.Right} type="source" />
</InfoNodeContainer>
