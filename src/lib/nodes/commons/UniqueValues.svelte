<script lang="ts">
    import { Handle, Position, useHandleConnections, useSvelteFlow } from '@xyflow/svelte'
    import InfoNodeContainer from '$lib/node-elements/InfoNodeContainer.svelte'
    import Divider from '$lib/node-elements/Divider.svelte'
    import type { NodePropsExt } from '$lib/types'
    import { executionResults } from '$lib/execution-store'

    export let id: NodePropsExt['id']
    export let data: NodePropsExt['data']

    const { getNode, updateNodeData } = useSvelteFlow()
    const connections = useHandleConnections({ nodeId: id, type: 'target' })

    // Propagate selectedColumn from upstream ColumnSelector into this node's data
    $: upstreamId = $connections[0]?.source
    $: {
        void $executionResults
        if (upstreamId) {
            const upstreamNode = getNode(upstreamId)
            if (upstreamNode?.data?.selectedColumn) {
                updateNodeData(id, { selectedColumn: upstreamNode.data.selectedColumn }, { replace: false })
            }
        }
    }

    // Get this node's execution result (analysis node)
    $: result = $executionResults.get(id)
    $: analysisResult = result?.analysisResult

    // The R code produces a data.frame via toD3() with columns: <selectedColumn>, frequency, percentage
    // The value column key varies based on the selected column name
    $: topValues = (() => {
        const rows = analysisResult?.rows as Record<string, unknown>[] | undefined
        if (!rows || rows.length === 0) return undefined
        return rows.map(row => {
            const valueKey = Object.keys(row).find(k => k !== 'frequency' && k !== 'percentage')
            return {
                value: valueKey ? row[valueKey] : '',
                frequency: row.frequency as number,
                percentage: row.percentage as number
            }
        })
    })()
</script>

<InfoNodeContainer title="Unique values">
    {#if topValues && topValues.length > 0}
        {#each topValues as item}
            <li
                class="border-b border-white font-mono text-sm hover:border-current"
                title="copy value to clipboard"
                on:click={async () =>
                    navigator.clipboard.writeText(String(item.value))}
            >
                {item.value} (n = {item.frequency}; {item.percentage.toFixed(
                    2
                )}%)
            </li>
        {/each}

        <Divider />
        <p class="font-sans text-sm">
            {topValues.length} unique values
        </p>
    {:else if result?.error}
        <p class="font-sans text-sm text-red-500">{result.error}</p>
    {:else}
        <p class="font-sans text-sm">Provide a column</p>
    {/if}

    <Handle position={Position.Left} type="target" />
    <Handle position={Position.Right} type="source" />
</InfoNodeContainer>
