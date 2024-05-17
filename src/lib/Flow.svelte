<script lang="ts">
    import { writable } from 'svelte/store'
    import {
        Background,
        BackgroundVariant,
        Controls,
        type Edge,
        MiniMap,
        SvelteFlow,
        useSvelteFlow
    } from '@xyflow/svelte'

    import '@xyflow/svelte/dist/style.css'

    import type { NodeExt } from '$lib/types'
    import { nodeTypes } from '$lib/nodes'
    import TopMenu from '$lib/menus/TopMenu.svelte'
    import LibraryMenu from '$lib/menus/LibraryMenu.svelte'

    const nodes = writable<NodeExt[]>([
        {
            id: '1',
            type: 'CsvLoader',
            data: {},
            position: { x: 0, y: 0 }
        }
    ])

    // same for edges
    const edges = writable<Edge[]>([])

    const snapGrid: [number, number] = [20, 20]

    const { screenToFlowPosition } = useSvelteFlow()
    const onDragOver = (event: DragEvent) => {
        event.preventDefault()

        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move'
        }
    }

    const onDrop = (event: DragEvent) => {
        event.preventDefault()

        if (!event.dataTransfer) {
            return null
        }

        const type = event.dataTransfer.getData('application/svelteflow')

        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
        })

        const newNode = {
            id: `${Math.random()}`,
            type,
            position,
            data: { label: `${type} node` },
            origin: [0.5, 0.0]
        } satisfies Node

        $nodes.push(newNode)
        $nodes = $nodes
    }
</script>

<!--
👇 By default, the Svelte Flow container has a height of 100%.
This means that the parent container needs a height to render the flow.
-->
<div class="relative h-screen select-none">
    <TopMenu nodesCount={$nodes.length}></TopMenu>
    <LibraryMenu></LibraryMenu>
    <SvelteFlow
        {edges}
        fitView
        {nodeTypes}
        {nodes}
        {snapGrid}
        on:dragover={onDragOver}
        on:drop={onDrop}
        on:nodeclick={(event) =>
            console.log('on node click', event.detail.node)}
    >
        <Controls />
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
    </SvelteFlow>
</div>
