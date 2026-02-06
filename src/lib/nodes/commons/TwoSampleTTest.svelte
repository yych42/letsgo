<script lang="ts">
    import { Handle, Position } from '@xyflow/svelte'
    import InfoNodeContainer from '$lib/node-elements/InfoNodeContainer.svelte'
    import Divider from '$lib/node-elements/Divider.svelte'
    import type { NodePropsExt } from '$lib/types'
    import { executionResults } from '$lib/execution-store'

    export let id: NodePropsExt['id']
    export let data: NodePropsExt['data']

    // Get this node's execution result (analysis node)
    $: result = $executionResults.get(id)
    $: analysisResult = result?.analysisResult

    // Extract t-test results from R
    // Values may be wrapped in arrays from toJs()/toD3()
    $: t = analysisResult?.t != null
        ? (Array.isArray(analysisResult.t) ? analysisResult.t[0] : analysisResult.t) as number
        : null
    $: p = analysisResult?.p != null
        ? (Array.isArray(analysisResult.p) ? analysisResult.p[0] : analysisResult.p) as number
        : null
    $: df = analysisResult?.df != null
        ? (Array.isArray(analysisResult.df) ? analysisResult.df[0] : analysisResult.df) as number
        : null
    $: leveneStatistic = analysisResult?.levene_statistic != null
        ? (Array.isArray(analysisResult.levene_statistic) ? analysisResult.levene_statistic[0] : analysisResult.levene_statistic) as number
        : null
    $: leveneP = analysisResult?.levene_p != null
        ? (Array.isArray(analysisResult.levene_p) ? analysisResult.levene_p[0] : analysisResult.levene_p) as number
        : null
</script>

<InfoNodeContainer title="Compare Means">
    {#if t != null && p != null}
        <li class="font-bold">Welch Two-sample T-Test</li>
        <li>t: {t.toFixed(3)}</li>
        <li>p: {p.toFixed(3)}</li>
        {#if df != null}
            <li>df: {df.toFixed(1)}</li>
        {/if}

        {#if leveneStatistic != null && leveneP != null}
            <Divider />
            <li class="font-bold">Levene's Test</li>
            <li>Statistic: {leveneStatistic.toFixed(3)}</li>
            <li>p: {leveneP.toFixed(2)}</li>
        {/if}
    {:else if result?.error}
        <p class="font-sans text-sm text-red-500">{result.error}</p>
    {:else}
        <p class="font-sans text-sm">Connect with two means</p>
    {/if}

    <Handle position={Position.Left} type="target" />
    <Handle position={Position.Right} type="source" />
</InfoNodeContainer>
