<script lang="ts">
    import {
        Handle,
        Position,
        useHandleConnections,
        useNodesData,
        useSvelteFlow
    } from '@xyflow/svelte'
    import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte'
    import { getColumnData } from '$lib/helpers'
    import type { ColumnData, GenericRow, NodePropsExt } from '$lib/types'

    export let id: NodePropsExt['id']

    const { updateNodeData } = useSvelteFlow()
    const datasetConnection = useHandleConnections({
        nodeId: id,
        type: 'target',
        id: 'dataset-target'
    })
    const vectorConnection = useHandleConnections({
        nodeId: id,
        type: 'target',
        id: 'vector-target'
    })

    $: inflow = useNodesData(
        $datasetConnection[0]?.source || $vectorConnection[0]?.source
    )
    $: dataset = $inflow?.data.dataset as GenericRow[]

    let min: string = ''
    let max: string = ''
    let setAsMissing: boolean = true

    $: columnData = $inflow?.data.columnData as ColumnData
    $: selectedColumn = $inflow?.data.selectedColumn as string

    $: if (columnData?.type === 'numeric') {
        console.log('numeric column')
        filterByRange(Number(min), Number(max), setAsMissing)
    }

    $: if (columnData?.type === 'mixed') {
        console.log('not mixed')
        filterByRange(Number(min), Number(max), setAsMissing)
    }

    function filterByRange(min: number, max: number, setAsMissing = true) {
        // Make sure the min and max are plausible
        if (min > max) {
            // console.log('min is greater than max');
            return
        }
        if (dataset === undefined) {
            return
        }

        function setOutOfRangeValuesToNull(min: number, max: number) {
            const filteredData = dataset.map((row) => {
                const value = row[selectedColumn] as number

                if (value < min || value > max || typeof value !== 'number') {
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

        function removeOutOfRangeRows(min: number, max: number) {
            const filteredData = dataset.filter((row) => {
                const value = row[selectedColumn] as number

                if (value < min || value > max || typeof value !== 'number') {
                    return false
                }

                return true
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

        // Set out-of-range values to null
        if (setAsMissing === true) {
            setOutOfRangeValuesToNull(min, max)
            console.log('set as missing')
        } else {
            removeOutOfRangeRows(min, max)
            console.log('remove rows')
        }
    }

    $$restProps
</script>

<OperationalNodeContainer title="Filter by range">
    <div class="my-2 border-t border-[#5d3a8b]" />
    <!-- TODO: Only one of two target handles should be active -->
    <Handle
        id="dataset-target"
        position={Position.Top}
        type="target"
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white"
    />
    <Handle id="vector-target" position={Position.Left} type="target" />
    {#if columnData?.type === 'numeric' || columnData?.type === 'mixed'}
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
        <p class="px-3 font-sans text-sm">Select a number-containing column</p>
    {/if}
    <!-- Divider -->
    <div class="my-2 border-t border-[#5d3a8b]" />
    <!-- Checkbox -->
    <div class="flex items-center space-x-2 px-3">
        <input
            class="rounded border-[#5d3a8b]"
            type="checkbox"
            bind:checked={setAsMissing}
        />
        <p class="text-sm text-[#5d3a8b]">Set as missing</p>
    </div>

    <Handle id="vector-source" position={Position.Right} type="source" />
    <Handle
        id="dataset-source"
        position={Position.Bottom}
        type="source"
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white "
    />
</OperationalNodeContainer>
