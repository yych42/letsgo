<script lang="ts">
    import { Handle, Position, useSvelteFlow } from '@xyflow/svelte'
    import '@xyflow/svelte/dist/style.css'

    import Papa from 'papaparse'
    import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte'

    import type { CSVLoaderData, NodePropsExt } from '$lib/types'

    export let id: NodePropsExt<CSVLoaderData>['id']

    const { updateNodeData } = useSvelteFlow()

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
                        dataset: results.data
                    })
                },
                error: (err: any) => {
                    console.error(err)
                }
            })
        }
        reader.readAsText(file)
    }
</script>

<OperationalNodeContainer>
    <input
        id="dataset"
        class="mx-2 cursor-pointer file:cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium"
        accept=".csv"
        type="file"
        on:change={(evt) => {
            const file = evt.currentTarget?.files?.[0]
            if (file) {
                loadCSV(file)
            }
        }}
    />
    <Handle
        position={Position.Bottom}
        type="source"
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white "
    />
</OperationalNodeContainer>
