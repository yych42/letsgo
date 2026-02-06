<script lang="ts">
    import {
        Handle,
        Position,
        useHandleConnections
    } from '@xyflow/svelte'
    import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte'
    import type { NodePropsExt } from '$lib/types'
    import { executionResults } from '$lib/execution-store'

    export let id: NodePropsExt['id']
    export let data: NodePropsExt['data']

    const connections = useHandleConnections({
        nodeId: id,
        type: 'target'
    })

    let exporting = false

    // Get upstream node's execution result to find its R data ref
    $: upstreamId = $connections[0]?.source
    $: upstreamResult = upstreamId
        ? $executionResults.get(upstreamId)
        : undefined
    $: hasData = upstreamResult?.dataRef != null

    // Get this node's own execution result
    $: result = $executionResults.get(id)

    async function exportCSV() {
        const varName = upstreamResult?.dataRef?.varName
        if (!varName) return

        exporting = true
        try {
            const { getDataAsCSV } = await import('$lib/r-engine/r-data-store')
            const csv = await getDataAsCSV(varName)
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'export.csv'
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Export failed:', err)
        } finally {
            exporting = false
        }
    }
</script>

<OperationalNodeContainer {...$$restProps} title="Save as CSV">
    <Handle
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white"
        position={Position.Top}
        type="target"
    />

    {#if hasData}
        <button
            class="mx-2 cursor-pointer file:cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium"
            disabled={exporting}
            on:click={exportCSV}
        >
            {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
        {#if upstreamResult?.dataRef}
            <div class="my-1 px-3 font-mono text-xs text-[#5d3a8b]">
                {upstreamResult.dataRef.nrow} rows x {upstreamResult.dataRef.ncol} cols
            </div>
        {/if}
    {:else}
        <p class="px-3 font-sans text-sm">Connect with dataset sources</p>
    {/if}

    {#if result?.error}
        <div class="px-3 text-xs text-red-500">{result.error}</div>
    {/if}
</OperationalNodeContainer>
