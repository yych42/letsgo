<script lang="ts">
    import { Handle, Position, useSvelteFlow } from '@xyflow/svelte'
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
                complete: (results) => {
                    updateNodeData(id, {
                        dataset: results.data,
                        globals: [{ id, object: 'dataset' }]
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
    <Handle position={Position.Right} type="source" />
</OperationalNodeContainer>
