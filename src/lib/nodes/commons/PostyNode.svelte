<script lang="ts">
    import InfoNodeContainer from '$lib/node-elements/InfoNodeContainer.svelte'

    import type { PostyNodeData, NodePropsExt } from '$lib/types'

    export let id: NodePropsExt<PostyNodeData>['id']
    export let data: NodePropsExt<PostyNodeData>['data']
</script>

<InfoNodeContainer title="Note">
    <div class="">
        <textarea
            bind:value={data.text}
            rows="5"
            class="focus:outline-none"
            placeholder="Write a note..."
        />
    </div>
</InfoNodeContainer>
