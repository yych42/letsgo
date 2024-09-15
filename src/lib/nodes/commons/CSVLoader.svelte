<script lang="ts">
    import { Handle, Position, useSvelteFlow } from '@xyflow/svelte'
    import '@xyflow/svelte/dist/style.css'

    import Papa from 'papaparse'
    import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte'

    import type { CSVLoaderData, NodePropsExt } from '$lib/types'

    export let id: NodePropsExt<CSVLoaderData>['id']
    export let data: NodePropsExt<CSVLoaderData>['data']

    const { updateNodeData } = useSvelteFlow()

    let fileInput: HTMLInputElement | null = null

    function loadCSV(file: File) {
        const reader = new FileReader()
        reader.onload = (e) => {
            const localFile = e.target?.result
            Papa.parse(localFile as string, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    updateNodeData(id, {
                        dataset: results.data,
                        filename: file.name
                    })
                },
                error: (err: any) => {
                    console.error(err)
                }
            })
        }
        reader.readAsText(file)
    }

    function onFileChange(evt: Event) {
        const file = (evt.target as HTMLInputElement)?.files?.[0]
        if (file) {
            loadCSV(file)
        }
    }

    function openFileDialog() {
        if (fileInput) {
            fileInput.click()
        }
    }
</script>

<OperationalNodeContainer>
    <div class="px-4">
        {#if !data.filename}
            <button on:click={openFileDialog}>Select File</button>
            <input
                type="file"
                accept=".csv"
                on:change={onFileChange}
                bind:this={fileInput}
                style="display: none;"
            />
        {:else}
            <div>{data.filename}</div>
        {/if}
    </div>
    <Handle
        position={Position.Bottom}
        type="source"
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white "
    />
</OperationalNodeContainer>
