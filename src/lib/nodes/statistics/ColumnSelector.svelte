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

    export let id: NodePropsExt<ColumnSelectorData>['id']
    export let data: NodePropsExt<ColumnSelectorData>['data']

    const { updateNodeData } = useSvelteFlow()
    const connections = useHandleConnections({
        nodeId: id,
        type: 'target'
    })

    let selectedColumn: string = ''

    $: inflow = useNodesData($connections[0]?.source)
    $: dataset = $inflow?.data.dataset as GenericRow[]
    $: updateNodeData(
        id,
        {
            globals: $inflow?.data.globals ?? [],
            columnNames: getColumnNames(dataset ?? []),
            selectedColumn,
            columnData: getColumnData(dataset ?? [], selectedColumn)
        },
        { replace: false }
    )
</script>

<OperationalNodeContainer title="Select Column">
    <Handle position={Position.Left} type="target" />
    <!-- Selector -->
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
    <!-- Divder -->
    <div class="my-2 border-t border-[#5d3a8b]" />
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
                    Distribution {generateHistogram(data.columnData.values)}
                </div>
                <!-- Check if is nullable string -->
            {:else if data.columnData.type === 'string'}
                <!-- Type -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    type <span class="font-normal">string</span>
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

    <Handle
        id="selected-values"
        style="top: 35%;"
        position={Position.Right}
        type="source"
    />
    <!-- <Handle
        id="dataset"
        style="top: 65%;"
        onconnect={() => {
            updateNodeData(
                id,
                {
                    dataset: $inflow?.data.dataset
                },
                { replace: false }
            )
        }}
        position={Position.Right}
        type="source"
    /> -->
</OperationalNodeContainer>
