<script lang="ts">
    import { SvelteFlowProvider } from '@xyflow/svelte'
    import '@xyflow/svelte/dist/style.css'
    import Flow from '$lib/Flow.svelte'
</script>

<SvelteFlowProvider>
    <Flow></Flow>
</SvelteFlowProvider>
