<script lang="ts">
    import { writable } from 'svelte/store'
    import {
        Background,
        BackgroundVariant,
        Controls,
        type Edge,
        MiniMap,
        SvelteFlow
    } from '@xyflow/svelte'

    import '@xyflow/svelte/dist/style.css'

    import type { NodeExt } from '$lib/types'
    import { nodeTypes } from '$lib/nodes'
    import TopMenu from '$lib/menus/TopMenu.svelte'

    const nodes = writable<NodeExt[]>([
        {
            id: '1',
            type: 'CsvLoader',
            data: {},
            position: { x: 0, y: 0 }
        },
        {
            id: '2',
            type: 'ColumnNames',
            data: {},
            position: { x: 450, y: 0 }
        },
        {
            id: '3',
            type: 'ColumnSelector',
            data: {},
            position: { x: 450, y: 200 }
        },
        {
            id: '4',
            type: 'RangeFilter',
            data: {},
            position: { x: 750, y: 200 }
        },
        {
            id: '5',
            type: 'ColumnSelector',
            data: {},
            position: { x: 1050, y: 200 }
        },
        {
            id: '6',
            type: 'ColumnSelector',
            data: {},
            position: { x: 750, y: 350 }
        },
        {
            id: '7',
            type: 'Mean',
            data: {},
            position: { x: 1350, y: 200 }
        },
        {
            id: '8',
            type: 'Inspector',
            data: {},
            position: { x: 600, y: 0 }
        },
        {
            id: 's1',
            type: 'Variable',
            data: { type: 'string' },
            position: { x: 0, y: 400 }
        },
        {
            id: 's2',
            type: 'Transform',
            data: {},
            position: { x: 300, y: 600 }
        },
        {
            id: 's3',
            type: 'Inspector',
            data: {},
            position: { x: 600, y: 600 }
        },
        {
            id: 's4',
            type: 'Inspector',
            data: {},
            position: { x: 300, y: 400 }
        }
    ])

    // same for edges
    const edges = writable<Edge[]>([
        {
            id: 's1-s2',
            source: 's1',
            target: 's2'
        },
        {
            id: 's2-s3',
            source: 's2',
            target: 's3'
        },
        {
            id: 's1-s4',
            source: 's1',
            target: 's4'
        }
    ])

    const snapGrid: [number, number] = [20, 20]
</script>

<!--
👇 By default, the Svelte Flow container has a height of 100%.
This means that the parent container needs a height to render the flow.
-->
<div class="relative h-screen select-none">
    <TopMenu nodesCount={$nodes.length}></TopMenu>
    <SvelteFlow {edges} fitView {nodeTypes} {nodes} {snapGrid}>
        <Controls />
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
    </SvelteFlow>
</div>
