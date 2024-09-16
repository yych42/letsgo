<script lang="ts">
    import pako from 'pako'
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

    const { screenToFlowPosition, toObject } = useSvelteFlow()
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

    // Save toObject as gzip-compressed file
    const saveToFile = (filename: string) => {
        const jsonString = JSON.stringify(toObject())
        const compressedData = pako.gzip(jsonString)
        const blob = new Blob([compressedData], { type: 'application/gzip' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    // Load from gzip-compressed file and set the nodes and edges
    const loadFromFile = (file: File) => {
        const reader = new FileReader()
        reader.onload = (event) => {
            const compressedData = new Uint8Array(
                event.target?.result as ArrayBuffer
            )
            const jsonString = pako.ungzip(compressedData, { to: 'string' })
            const { nodes: loadedNodes, edges: loadedEdges } =
                JSON.parse(jsonString)
            nodes.set(loadedNodes)
            edges.set(loadedEdges)
        }
        reader.readAsArrayBuffer(file)
    }
</script>

<!--
👇 By default, the Svelte Flow container has a height of 100%.
This means that the parent container needs a height to render the flow.
-->
<div class="relative h-screen select-none">
    <TopMenu nodesCount={$nodes.length}>
        <!-- Goofy animation applied because no one is looking yet -->
        <div
            class="pointer-events-auto flex cursor-pointer rounded border bg-white/70 p-1 px-2 shadow-sm backdrop-blur-xl transition-all hover:rotate-12"
            on:click={() => saveToFile('setup.letsgo')}
        >
            <span class="inline-flex items-center font-mono text-sm"
                >export setup</span
            >
        </div>

        <input
            type="file"
            class="hidden"
            accept=".letsgo"
            on:change={(event) => loadFromFile(event.target.files[0])}
        />
        <div
            class="pointer-events-auto flex cursor-pointer rounded border bg-white/70 p-1 px-2 shadow-sm backdrop-blur-xl transition-all hover:rotate-12"
            on:click={() => {
                const input = document.querySelector('input[type="file"]')
                input?.click()
            }}
        >
            <span class="inline-flex items-center font-mono text-sm"
                >import setup</span
            >
        </div>
    </TopMenu>
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
