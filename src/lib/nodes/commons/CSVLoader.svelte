<script lang="ts">
    import { Handle, Position, useSvelteFlow } from '@xyflow/svelte'
    import '@xyflow/svelte/dist/style.css'

    import Papa from 'papaparse'
    import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte'

    import type { CSVLoaderData, NodePropsExt } from '$lib/types'
    import { executionResults, triggerNodeExecution } from '$lib/execution-store'

    export let id: NodePropsExt<CSVLoaderData>['id']
    export let data: NodePropsExt<CSVLoaderData>['data']

    const { updateNodeData } = useSvelteFlow()

    let fileInput: HTMLInputElement | null = null
    let loading = false

    async function loadCSV(file: File) {
        loading = true
        const reader = new FileReader()
        reader.onload = async (e) => {
            const localFile = e.target?.result
            Papa.parse(localFile as string, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    try {
                        // Push data to R
                        const { pushDataToR } = await import('$lib/r-engine/r-data-store')
                        const dataRef = await pushDataToR(id, results.data as Record<string, unknown>[])

                        // Store rVarName and metadata in node data
                        updateNodeData(id, {
                            rVarName: dataRef.varName,
                            filename: file.name,
                            nrow: dataRef.nrow,
                            ncol: dataRef.ncol,
                            colNames: dataRef.colNames
                        })

                        // Trigger pipeline execution
                        triggerNodeExecution(id)
                    } catch (err) {
                        console.error('Failed to push data to R:', err)
                    } finally {
                        loading = false
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    loading = false
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

    // Get execution result for this node
    $: result = $executionResults.get(id)
</script>

<OperationalNodeContainer>
    <div class="w-full px-4 text-center">
        {#if loading}
            <div class="text-sm text-[#5d3a8b]">Loading...</div>
        {:else if !data.filename}
            <button
                class="w-full cursor-pointer underline"
                on:click={openFileDialog}
                >Select a CSV file</button
            >
            <input
                bind:this={fileInput}
                style="display: none;"
                accept=".csv"
                type="file"
                on:change={onFileChange}
            />
        {:else}
            <div class="font-medium">{data.filename}</div>
            {#if data.nrow !== undefined}
                <div class="mt-1 text-xs text-[#5d3a8b]/70">{data.nrow} rows, {data.ncol} cols</div>
            {/if}
        {/if}
    </div>
    <Handle
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white "
        position={Position.Bottom}
        type="source"
    />
</OperationalNodeContainer>
