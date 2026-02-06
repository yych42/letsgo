<script lang="ts">
    import InfoNodeContainer from '$lib/node-elements/InfoNodeContainer.svelte'

    import type { NodePropsExt, PostyNodeData } from '$lib/types'

    export let id: NodePropsExt<PostyNodeData>['id']
    export let data: NodePropsExt<PostyNodeData>['data']
</script>

<InfoNodeContainer title="Note">
    <div class="">
        <textarea
            class="focus:outline-none"
            placeholder="Write a note..."
            rows="5"
            bind:value={data.text}
        />
    </div>
</InfoNodeContainer>
