<script lang="ts">
    import { Handle, Position } from '@xyflow/svelte'
    import InfoNodeContainer from '$lib/node-elements/InfoNodeContainer.svelte'
    import type { NodePropsExt } from '$lib/types'
    import { executionResults } from '$lib/execution-store'

    export let id: NodePropsExt['id']
    export let data: NodePropsExt['data']

    // Get this node's execution result (analysis node)
    $: result = $executionResults.get(id)
    $: analysisResult = result?.analysisResult

    // Extract correlation test results from R
    // Values may be wrapped in arrays from toJs()/toD3()
    $: r = analysisResult?.r != null
        ? (Array.isArray(analysisResult.r) ? analysisResult.r[0] : analysisResult.r) as number
        : null
    $: p = analysisResult?.p != null
        ? (Array.isArray(analysisResult.p) ? analysisResult.p[0] : analysisResult.p) as number
        : null
</script>

<InfoNodeContainer title="Pearson Correlation Test">
    {#if r != null && p != null}
        <li>r: {r.toFixed(3)}</li>
        <li>p: {p.toFixed(2)}</li>
    {:else if result?.error}
        <p class="font-sans text-sm text-red-500">{result.error}</p>
    {:else}
        <p class="font-sans text-sm">Connect with two columns</p>
    {/if}

    <Handle position={Position.Left} type="target" />
    <Handle position={Position.Right} type="source" />
</InfoNodeContainer>
