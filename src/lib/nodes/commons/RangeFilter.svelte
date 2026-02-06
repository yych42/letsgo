<script lang="ts">
    import {
        Handle,
        Position,
        useHandleConnections,
        useSvelteFlow
    } from '@xyflow/svelte'
    import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte'
    import type { NodePropsExt } from '$lib/types'
    import { executionResults, triggerNodeExecution } from '$lib/execution-store'

    export let id: NodePropsExt['id']
    export let data: NodePropsExt['data']

    const { updateNodeData, getNode } = useSvelteFlow()
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

    let min: string = ''
    let max: string = ''
    let setAsMissing: boolean = true

    // Get upstream node's result to check column type
    $: upstreamId =
        $datasetConnection[0]?.source || $vectorConnection[0]?.source
    $: upstreamResult = upstreamId
        ? $executionResults.get(upstreamId)
        : undefined

    // Read the upstream ColumnSelector's selectedColumn from its node data
    // Re-read whenever execution results change (signals upstream has been processed)
    $: vectorSourceId = $vectorConnection[0]?.source
    $: selectedColumn = (() => {
        // Trigger reactivity on executionResults
        void $executionResults
        if (vectorSourceId) {
            const upstreamNode = getNode(vectorSourceId)
            if (upstreamNode?.data?.selectedColumn) {
                return upstreamNode.data.selectedColumn as string
            }
        }
        return undefined
    })()

    $: colType = selectedColumn && upstreamResult?.stats
        ? upstreamResult.stats[selectedColumn]?.type
        : undefined
    $: isNumeric = colType === 'numeric' || colType === 'integer'

    // Propagate selectedColumn into this node's data so the R code generator can access it
    $: if (selectedColumn) {
        updateNodeData(id, { selectedColumn }, { replace: false })
    }

    // Get this node's own execution result
    $: result = $executionResults.get(id)

    // Initialize from saved data
    $: if (min === '' && data.min != null) min = String(data.min)
    $: if (max === '' && data.max != null) max = String(data.max)
    $: if (data.setAsMissing != null) setAsMissing = data.setAsMissing as boolean

    function onConfigChange() {
        updateNodeData(
            id,
            {
                min: min !== '' ? Number(min) : null,
                max: max !== '' ? Number(max) : null,
                setAsMissing
            },
            { replace: false }
        )
        triggerNodeExecution(id)
    }
</script>

<OperationalNodeContainer {...$$restProps} title="Filter by range">
    <div class="my-2 border-t border-[#5d3a8b]" />
    <Handle
        id="dataset-target"
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white"
        position={Position.Top}
        type="target"
    />
    <Handle id="vector-target" position={Position.Left} type="target" />
    {#if isNumeric}
        <div class="flex flex-col space-y-2 px-3 py-1">
            <input
                class="w-full rounded-md border border-[#5d3a8b] bg-white px-3 py-1 text-sm text-[#5d3a8b]"
                placeholder="min"
                type="number"
                bind:value={min}
                on:change={onConfigChange}
            />
            <input
                class="w-full rounded-md border border-[#5d3a8b] bg-white px-3 py-1 text-sm text-[#5d3a8b]"
                placeholder="max"
                type="number"
                bind:value={max}
                on:change={onConfigChange}
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
            on:change={onConfigChange}
        />
        <p class="text-sm text-[#5d3a8b]">Set as missing</p>
    </div>

    {#if result?.dataRef}
        <div class="my-2 border-t border-[#5d3a8b]" />
        <div class="flex flex-col space-y-1 px-3 py-1">
            <div
                class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]"
            >
                rows <span class="font-normal">{result.dataRef.nrow}</span>
            </div>
        </div>
    {/if}

    {#if result?.error}
        <div class="px-3 text-xs text-red-500">{result.error}</div>
    {/if}

    <Handle id="vector-source" position={Position.Right} type="source" />
    <Handle
        id="dataset-source"
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white "
        position={Position.Bottom}
        type="source"
    />
</OperationalNodeContainer>
