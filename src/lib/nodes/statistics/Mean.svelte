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

    import type {
        CentralTendency,
        ColumnData,
        Global,
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

    function centralTendency(data: number[]): CentralTendency {
        if (data.length === 0) return null

        const validData = data.filter((n) => !Number.isNaN(n) && n !== null)
        const validN = validData.length
        const mean = validData.reduce((a, b) => a + b, 0) / validN
        const sd = Math.sqrt(
            validData.reduce((a, b) => a + (b - mean) ** 2, 0) / validN
        )

        return { mean, sd, n: validN }
    }

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

    $: globals = derived(
        inflows,
        ([...arr]) => {
            const seen = new Set()
            const uniqueGlobals = arr
                .flatMap((object) => object?.data.globals as Global)
                .filter((global) => {
                    const duplicate = seen.has(global.id)
                    seen.add(global.id)
                    return !duplicate
                })
            return uniqueGlobals
        },
        []
    )

    $: updateNodeData(
        id,
        {
            globals,
            centralTendency: centralTendency($columnData)
        },
        { replace: false }
    )
</script>

<InfoNodeContainer title="Mean">
    {#if data && data.centralTendency}
        <li>Mean: {data.centralTendency.mean.toFixed(2)}</li>
        <li>SD: {data.centralTendency.sd.toFixed(2)}</li>

        <Divider />
        <p class="font-sans text-sm">{data.centralTendency.n} valid values</p>
    {:else}
        <p class="font-sans text-sm">Provide a column</p>
    {/if}

    <Handle position={Position.Left} type="target" />
    <Handle position={Position.Right} type="source" />
</InfoNodeContainer>
