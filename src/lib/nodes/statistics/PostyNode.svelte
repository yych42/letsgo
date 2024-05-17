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

    const { updateNodeData } = useSvelteFlow()
</script>

<InfoNodeContainer title="Note">
    <div class="">
        <textarea
            value={data.text}
            class="focus:outline-none"
            on:input={(evt) =>
                updateNodeData(id, { text: evt.currentTarget.value })}
            placeholder="Write a note..."
        />
    </div>
</InfoNodeContainer>
