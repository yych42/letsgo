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
    const connections = useHandleConnections({
        nodeId: id,
        type: 'target'
    })

    let newName: string = ''

    // Get upstream node's result and selectedColumn from its node data
    $: upstreamId = $connections[0]?.source
    $: upstreamResult = upstreamId
        ? $executionResults.get(upstreamId)
        : undefined
    $: selectedColumn = (() => {
        void $executionResults
        if (upstreamId) {
            const upstreamNode = getNode(upstreamId)
            if (upstreamNode?.data?.selectedColumn) {
                return upstreamNode.data.selectedColumn as string
            }
        }
        return upstreamResult?.dataRef?.colNames?.[0] ?? ''
    })()

    // Propagate selectedColumn into this node's data so the R code generator can access it
    $: if (selectedColumn) {
        updateNodeData(id, { selectedColumn }, { replace: false })
    }

    // Get this node's own execution result
    $: result = $executionResults.get(id)

    // Initialize from saved data
    $: if (newName === '' && data.newColumnName)
        newName = data.newColumnName as string

    function onNameChange(name: string) {
        newName = name
        updateNodeData(
            id,
            { newColumnName: name },
            { replace: false }
        )
        triggerNodeExecution(id)
    }
</script>

<OperationalNodeContainer title="Rename Column">
    <Handle
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white"
        position={Position.Top}
        type="target"
    />
    <!-- New Name Input -->
    <div class="px-3">
        <input
            class="w-full rounded-md border border-[#5d3a8b] bg-transparent px-2 py-1 font-mono text-sm font-medium leading-none text-[#5d3a8b]"
            placeholder="New Column Name"
            type="text"
            bind:value={newName}
            on:input={() => onNameChange(newName)}
        />
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

    <Handle id="selected-values" position={Position.Right} type="source" />
    <Handle
        id="dataset-provider"
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white "
        position={Position.Bottom}
        type="source"
    />
</OperationalNodeContainer>
