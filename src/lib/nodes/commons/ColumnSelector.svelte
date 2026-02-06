<script lang="ts">
    import {
        Handle,
        Position,
        useHandleConnections,
        useSvelteFlow
    } from '@xyflow/svelte'
    import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte'
    import Divider from '$lib/node-elements/Divider.svelte'
    import type { NodePropsExt } from '$lib/types'
    import { executionResults, triggerNodeExecution } from '$lib/execution-store'

    export let id: NodePropsExt['id']
    export let data: NodePropsExt['data']

    const { updateNodeData } = useSvelteFlow()
    const connections = useHandleConnections({
        nodeId: id,
        type: 'target'
    })

    let selectedColumn: string = ''

    // Get upstream node's execution result to know available columns
    $: upstreamId = $connections[0]?.source
    $: upstreamResult = upstreamId
        ? $executionResults.get(upstreamId)
        : undefined
    $: columnNames = upstreamResult?.dataRef?.colNames ?? []

    // Get this node's own execution result for column stats
    $: result = $executionResults.get(id)
    $: colStats =
        selectedColumn && result?.stats
            ? result.stats[selectedColumn]
            : undefined

    // Initialize selected column from saved data
    $: if (selectedColumn === '' && data.selectedColumn) {
        selectedColumn = data.selectedColumn as string
    }

    function onColumnChange(col: string) {
        selectedColumn = col
        updateNodeData(id, { selectedColumn: col }, { replace: false })
        triggerNodeExecution(id)
    }
</script>

<OperationalNodeContainer title="Select Column">
    <Handle
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white"
        position={Position.Top}
        type="target"
    />
    <!-- Selector -->
    <div class="px-3">
        <select
            class="nodrag my-1 w-full rounded-md border border-[#5d3a8b] bg-white text-sm text-[#5d3a8b]"
            bind:value={selectedColumn}
            on:change={() => onColumnChange(selectedColumn)}
        >
            {#each columnNames as colName}
                <option
                    selected={colName === selectedColumn}
                    value={colName}
                >
                    {colName}
                </option>
            {/each}
        </select>
    </div>
    <!-- Divider -->
    <div class="my-2 border-t border-[#5d3a8b]" />

    {#if result?.dataRef}
        <!-- Dataset Information -->
        <div class="flex flex-col space-y-2 px-3 py-1">
            <!-- Rows -->
            <div
                class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
            >
                rows <span class="font-normal">{result.dataRef.nrow}</span>
            </div>
        </div>
        <Divider />
    {/if}

    <div class="flex flex-col space-y-2 px-3 py-1">
        {#if colStats && selectedColumn !== ''}
            {#if colStats.type === 'numeric' || colStats.type === 'integer'}
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
                        >{colStats.min?.toFixed(2) ?? 'NA'} - {colStats.max?.toFixed(2) ?? 'NA'}</span
                    >
                </div>
                <!-- Valid -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    valid <span class="font-normal"
                        >{colStats.total - colStats.missing}</span
                    >
                </div>
                <!-- Missing -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    missing <span class="font-normal"
                        >{colStats.missing} ({colStats.missingPct.toFixed(2)}%)</span
                    >
                </div>
            {:else if colStats.type === 'character'}
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
                    unique <span class="font-normal">{colStats.unique}</span>
                </div>
                <!-- Valid -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    valid <span class="font-normal"
                        >{colStats.total - colStats.missing}</span
                    >
                </div>
                <!-- Missing -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    missing <span class="font-normal"
                        >{colStats.missing} ({colStats.missingPct.toFixed(2)}%)</span
                    >
                </div>
            {:else}
                <!-- Fallback for other types (factor, logical) -->
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    type <span class="font-normal">{colStats.type}</span>
                </div>
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    unique <span class="font-normal">{colStats.unique}</span>
                </div>
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    valid <span class="font-normal"
                        >{colStats.total - colStats.missing}</span
                    >
                </div>
                <div
                    class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
                >
                    missing <span class="font-normal"
                        >{colStats.missing} ({colStats.missingPct.toFixed(2)}%)</span
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

    {#if result?.error}
        <div class="px-3 text-xs text-red-500">{result.error}</div>
    {/if}

    <Handle id="selected-values" position={Position.Right} type="source" />
    <Handle
        id="dataset-provider"
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white "
        position={Position.Bottom}
        type="source"
    />
</OperationalNodeContainer>
