<script lang="ts">
    import {
        Handle,
        Position,
        useHandleConnections,
        useNodesData,
        useSvelteFlow
    } from '@xyflow/svelte'
    import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte'

    import {
        generateHistogram,
        getColumnData,
        getColumnNames,
        missing,
        range
    } from '$lib/helpers'
    import type {
        ColumnSelectorData,
        GenericRow,
        NodePropsExt
    } from '$lib/types'
    import { emojiHash } from '$lib/utils/emoji-hash'
    import Divider from '$lib/node-elements/Divider.svelte'
    import { derived } from 'svelte/store'

    export let id: NodePropsExt<ColumnSelectorData>['id']
    export let data: NodePropsExt<ColumnSelectorData>['data']

    const { updateNodeData } = useSvelteFlow()
    const connections = useHandleConnections({
        nodeId: id,
        type: 'target'
    })

    let selectedColumn: string = ''
    let datasetHash: string = ''

    $: inflows = $connections.map((connection) =>
        useNodesData(connection.source)
    )

    $: dataset = derived(
        inflows,
        ([...arr]) => {
            return arr.flatMap((object) => object?.data.dataset as GenericRow[])
        },
        []
    )

    $: updateNodeData(
        id,
        {
            dataset: $dataset,
            columnNames: getColumnNames($dataset ?? []),
            selectedColumn,
            columnData: getColumnData($dataset ?? [], selectedColumn)
        },
        { replace: false }
    )

    $: if (selectedColumn === '' && data.selectedColumn)
        selectedColumn = data.selectedColumn as string

    $: emojiHash($dataset).then((hash) => {
        datasetHash = hash
    })
</script>

<OperationalNodeContainer title="Select Column">
    <Handle
        position={Position.Top}
        type="target"
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white"
    />
    <!-- Selector -->
    <div class="px-3">
        <select
            class="nodrag my-1 w-full rounded-md border border-[#5d3a8b] bg-white text-sm text-[#5d3a8b]"
            bind:value={selectedColumn}
        >
            {#if data.columnNames}
                {#each data.columnNames as columnName}
                    <option
                        selected={columnName === selectedColumn}
                        value={columnName}
                    >
                        {columnName}
                    </option>
                {/each}
            {/if}
        </select>
    </div>
    <!-- Divder -->
    <div class="my-2 border-t border-[#5d3a8b]" />
    {#if data.dataset && data.dataset.length > 0}
        <!-- Dataset Information -->
        <div class="flex flex-col space-y-2 px-3 py-1">
            <!-- Hash -->
            <div
                class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
            >
                dataset <span>{datasetHash}</span>
            </div>
            <!-- Rows -->
            <div
                class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
            >
                rows <span class="font-normal">{data.dataset.length}</span>
            </div>
        </div>
        <Divider />
    {/if}
    <div class="flex flex-col space-y-2 px-3 py-1">
        {#if data.columnData && selectedColumn !== ''}
            {#if data.columnData.type === 'numeric'}
                <!-- Type -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    type <span class="font-normal">numeric</span>
                </div>
                <!-- Range -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    range <span class="font-normal"
                        >{range(data.columnData.values)?.min ?? 'NA'} - {range(
                            data.columnData.values
                        )?.max ?? 'NA'}</span
                    >
                </div>
                <!-- Valid -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    valid <span class="font-normal"
                        >{data.columnData.values.length -
                            missing(data.columnData.values).count}</span
                    >
                </div>
                <!-- Missing -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    missing <span class="font-normal"
                        >{missing(data.columnData.values).count} ({missing(
                            data.columnData.values
                        ).percent.toFixed(2)}%)</span
                    >
                </div>
                <!-- Ascii Histogram -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    distribution
                    <span class="text-xs"
                        >{generateHistogram(data.columnData.values)}</span
                    >
                </div>
                <!-- Check if is nullable string -->
            {:else if data.columnData.type === 'string'}
                <!-- Type -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    type <span class="font-normal">text</span>
                </div>
                <!-- Unique -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    unique <span class="font-normal"
                        >{[...new Set(data.columnData.values)].length}</span
                    >
                </div>
                <!-- Valid -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    valid <span class="font-normal"
                        >{data.columnData.values.length -
                            missing(data.columnData.values).count}</span
                    >
                </div>
                <!-- Missing -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    missing <span class="font-normal"
                        >{missing(data.columnData.values).count} ({missing(
                            data.columnData.values
                        ).percent.toFixed(2)}%)</span
                    >
                </div>
                <!-- Check if is numeric-string mixed -->
            {:else if data.columnData.type === 'mixed'}
                <!-- Type -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    type <span class="font-normal">mixed</span>
                </div>
                <!-- Percent numeric -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    numeric <span class="font-normal"
                        >{(
                            (data.columnData.values.filter(
                                (d) => typeof d === 'number'
                            ).length /
                                data.columnData.values.length) *
                            100
                        ).toFixed(2)}%</span
                    >
                </div>
                <!-- Percent string -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    string <span class="font-normal"
                        >{(
                            (data.columnData.values.filter(
                                (d) => typeof d === 'string'
                            ).length /
                                data.columnData.values.length) *
                            100
                        ).toFixed(2)}%</span
                    >
                </div>
                <!-- Valid -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    valid <span class="font-normal"
                        >{data.columnData.values.length -
                            missing(data.columnData.values).count}</span
                    >
                </div>
                <!-- Missing -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    missing <span class="font-normal"
                        >{missing(data.columnData.values).count} ({missing(
                            data.columnData.values
                        ).percent.toFixed(2)}%)</span
                    >
                </div>
            {/if}
        {:else}
            <!-- Unselected -->
            <div
                class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
            >
                <span class="font-normal">Select a column</span>
            </div>
        {/if}
    </div>

    <Handle id="selected-values" position={Position.Right} type="source" />
    <Handle
        id="dataset-provider"
        position={Position.Bottom}
        type="source"
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white "
    />
</OperationalNodeContainer>
