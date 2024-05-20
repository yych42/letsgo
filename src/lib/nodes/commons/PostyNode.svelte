<script lang="ts">
    import InfoNodeContainer from '$lib/node-elements/InfoNodeContainer.svelte'
    import {
        Handle,
        Position,
        type NodeProps,
        useSvelteFlow
    } from '@xyflow/svelte'

    type $$Props = NodeProps

    export let id: $$Props['id']
    export let data: $$Props['data']

    let text = ''

    const { updateNodeData } = useSvelteFlow()

    $: updateNodeData(id, { text })
</script>

<InfoNodeContainer title="Note">
    <div class="">
        <textarea
            bind:value={text}
            rows="5"
            class="focus:outline-none"
            placeholder="Write a note..."
        />
    </div>
</InfoNodeContainer>
