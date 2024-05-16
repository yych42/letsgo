<script lang="ts">
    import {
        Handle,
        Position,
        useHandleConnections,
        useNodesData,
        useSvelteFlow
    } from '@xyflow/svelte'
    import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte'
    import { getColumnData, getGlobal } from '$lib/helpers'
    import type {
        ColumnData,
        GenericRow,
        Global,
        NodePropsExt
    } from '$lib/types'

    export let id: NodePropsExt['id']

    const { updateNodeData } = useSvelteFlow()
    const connections = useHandleConnections({
        nodeId: id,
        type: 'target'
    })

    $: inflow = useNodesData($connections[0]?.source)
    $: globals = $inflow?.data.globals as Global[]

    $: globalData = globals?.map((global) => getGlobal(global))[0]
    $: dataset = $globalData?.data.dataset as GenericRow[]

    let min: string = ''
    let max: string = ''

    $: columnData = $inflow?.data.columnData as ColumnData
    $: selectedColumn = $inflow?.data.selectedColumn as string

    $: if (columnData?.type === 'numeric') {
        filterByRange(Number(min), Number(max))
    }

    function filterByRange(min: number, max: number) {
        // Make sure the min and max are plausible
        if (min > max) {
            // console.log('min is greater than max');
            return
        }
        if (dataset === undefined) {
            return
        }
        // Set out-of-range values to null
        const filteredData = dataset.map((row) => {
            const value = row[selectedColumn] as number

            if (value && (value < min || value > max)) {
                // console.log(value, 'is out of range of', min, max);
                const updatedRow = { ...row, [selectedColumn]: null }
                // console.log(updatedRow);
                return updatedRow
            }

            return row
        })

        updateNodeData(
            id,
            {
                dataset: filteredData,
                selectedColumn,
                columnData: getColumnData(filteredData, selectedColumn)
            },
            { replace: false }
        )
    }

    $$restProps
</script>

<OperationalNodeContainer title="Filter by range">
    <div class="my-2 border-t border-[#5d3a8b]" />
    <Handle position={Position.Left} type="target" />
    {#if columnData?.type === 'numeric'}
        <div class="flex flex-col space-y-2 px-3 py-1">
            <input
                class="w-full rounded-md border border-[#5d3a8b] bg-white px-3 py-1 text-sm text-[#5d3a8b]"
                placeholder="min"
                type="number"
                bind:value={min}
            />
            <input
                class="w-full rounded-md border border-[#5d3a8b] bg-white px-3 py-1 text-sm text-[#5d3a8b]"
                placeholder="max"
                type="number"
                bind:value={max}
            />
        </div>
    {:else}
        <p class="px-3 font-sans text-sm">Select a numeric column</p>
    {/if}
    <!-- Divider -->
    <div class="my-2 border-t border-[#5d3a8b]" />
    <!-- Checkbox -->
    <div class="flex items-center space-x-2 px-3">
        <input
            class="rounded border-[#5d3a8b]"
            checked
            disabled
            type="checkbox"
        />
        <p class="text-sm text-[#5d3a8b]">Set as missing</p>
    </div>

    <Handle position={Position.Right} type="source" />
</OperationalNodeContainer>
