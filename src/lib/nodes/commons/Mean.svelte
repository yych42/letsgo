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

    // Extract mean/sd/n from the R analysis result
    // The R code produces a data.frame with columns mean, sd, n
    // Values may be wrapped in arrays from toJs()/toD3()
    $: mean = analysisResult?.mean != null
        ? (Array.isArray(analysisResult.mean) ? analysisResult.mean[0] : analysisResult.mean) as number
        : null
    $: sd = analysisResult?.sd != null
        ? (Array.isArray(analysisResult.sd) ? analysisResult.sd[0] : analysisResult.sd) as number
        : null
    $: n = analysisResult?.n != null
        ? (Array.isArray(analysisResult.n) ? analysisResult.n[0] : analysisResult.n) as number
        : null
</script>

<InfoNodeContainer title="Mean">
    {#if mean != null && sd != null && n != null}
        <li>Mean: {mean.toFixed(2)}</li>
        <li>SD: {sd.toFixed(2)}</li>

        <Divider />
        <p class="font-sans text-sm">{n} valid values</p>
    {:else if result?.error}
        <p class="font-sans text-sm text-red-500">{result.error}</p>
    {:else}
        <p class="font-sans text-sm">Provide a column</p>
    {/if}

    <Handle position={Position.Left} type="target" />
    <Handle position={Position.Right} type="source" />
</InfoNodeContainer>
