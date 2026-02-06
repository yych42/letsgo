<script lang="ts">
    import pako from 'pako'
    import { writable } from 'svelte/store'
    import { onMount } from 'svelte'
    import {
        Background,
        BackgroundVariant,
        Controls,
        type Edge,
        MiniMap,
        SvelteFlow,
        useSvelteFlow
    } from '@xyflow/svelte'
    import { browser } from '$app/environment'

    import '@xyflow/svelte/dist/style.css'

    import type { NodeExt } from '$lib/types'
    import { nodeTypes } from '$lib/nodes'
    import TopMenu from '$lib/menus/TopMenu.svelte'
    import LibraryMenu from '$lib/menus/LibraryMenu.svelte'

    // Import execution infrastructure
    import { webRStatus } from '$lib/r-engine/webr-service'
    import {
        pipelineEdges,
pipelineNodes,
        runFullPipeline
    } from '$lib/execution-store'
    import { generators } from '$lib/nodes/r-ops'
    import { registerNode } from '$lib/engine/node-registry'

    const nodes = writable<NodeExt[]>([
        {
            id: '1',
            type: 'CsvLoader',
            data: {},
            position: { x: 0, y: 0 }
        }
    ])

    const edges = writable<Edge[]>([])

    const snapGrid: [number, number] = [20, 20]

    const { screenToFlowPosition, toObject } = useSvelteFlow()

    // Keep pipeline stores in sync with Svelte Flow state
    $: pipelineNodes.set($nodes)
    $: pipelineEdges.set($edges)

    // Initialize WebR on mount
    let webRReady = false
    onMount(async () => {
        if (!browser) return

        // Register all node R code generators
        for (const [type, gen] of Object.entries(generators)) {
            registerNode(type, gen)
        }

        // Initialize WebR (lazy - starts loading in background)
        try {
            const { getWebR } = await import('$lib/r-engine/webr-service')
            await getWebR()
            webRReady = true
        } catch (err) {
            console.error('WebR initialization failed:', err)
        }
    })

    // When edges change, trigger full pipeline re-execution
    let prevEdgesJson = ''
    $: {
        const edgesJson = JSON.stringify($edges.map(e => ({ s: e.source, t: e.target, sh: e.sourceHandle, th: e.targetHandle })))
        if (edgesJson !== prevEdgesJson && prevEdgesJson !== '' && webRReady) {
            prevEdgesJson = edgesJson
            runFullPipeline()
        } else {
            prevEdgesJson = edgesJson
        }
    }

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

        const newNode: NodeExt = {
            id: `${Math.random()}`,
            type,
            position,
            data: { label: `${type} node` },
            origin: [0.5, 0.0] as [number, number]
        }

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

    function openFileChooser() {
        const input = document.querySelector<HTMLInputElement>('input[type="file"]')
        input?.click()
    }

    function onFileInputChange(event: Event) {
        const target = event.target as HTMLInputElement
        const file = target?.files?.[0]
        if (file) loadFromFile(file)
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

            // Re-execute the full pipeline after loading
            if (webRReady) {
                runFullPipeline()
            }
        }
        reader.readAsArrayBuffer(file)
    }
</script>

<!--
By default, the Svelte Flow container has a height of 100%.
This means that the parent container needs a height to render the flow.
-->
<div class="relative h-screen select-none">
    {#if $webRStatus !== 'ready'}
        <div class="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div class="text-center">
                <div class="text-lg font-medium text-[#5d3a8b]">
                    {#if $webRStatus === 'initializing'}
                        Initializing R runtime...
                    {:else if $webRStatus === 'loading-packages'}
                        Loading R packages...
                    {:else if $webRStatus === 'error'}
                        Failed to initialize R runtime
                    {:else}
                        Starting up...
                    {/if}
                </div>
                {#if $webRStatus !== 'error'}
                    <div class="mt-2 text-sm text-gray-500">This may take a moment on first load</div>
                {/if}
            </div>
        </div>
    {/if}

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
            class="hidden"
            accept=".letsgo"
            type="file"
            on:change={onFileInputChange}
        />
        <div
            class="pointer-events-auto flex cursor-pointer rounded border bg-white/70 p-1 px-2 shadow-sm backdrop-blur-xl transition-all hover:rotate-12"
            on:click={openFileChooser}
        >
            <span class="inline-flex items-center font-mono text-sm"
                >import setup</span
            >
        </div>
    </TopMenu>
    <LibraryMenu />
    <SvelteFlow
        {edges}
        fitView
        {nodeTypes}
        {nodes}
        {snapGrid}
        on:dragover={onDragOver}
        on:drop={onDrop}
        on:nodeclick={() => {}}
    >
        <Controls />
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
    </SvelteFlow>
</div>
