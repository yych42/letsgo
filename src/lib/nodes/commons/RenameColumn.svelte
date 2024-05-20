<script lang="ts">
    import {
        Handle,
        Position,
        useHandleConnections,
        useNodesData,
        useSvelteFlow
    } from '@xyflow/svelte'
    import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte'

    import {
        generateHistogram,
        getColumnData,
        getColumnNames,
        missing,
        range
    } from '$lib/helpers'
    import type {
        ColumnSelectorData,
        GenericRow,
        NodePropsExt
    } from '$lib/types'
    import { emojiHash } from '$lib/utils/emoji-hash'
    import Divider from '$lib/node-elements/Divider.svelte'

    export let id: NodePropsExt<ColumnSelectorData>['id']
    export let data: NodePropsExt<ColumnSelectorData>['data']

    const { updateNodeData } = useSvelteFlow()
    const connections = useHandleConnections({
        nodeId: id,
        type: 'target'
    })

    let selectedColumn: string = ''
    let datasetHash: string = ''

    $: inflow = useNodesData($connections[0]?.source)
    $: dataset = $inflow?.data.dataset as GenericRow[]
    $: if (selectedColumn === '' && $inflow?.data.selectedColumn)
        selectedColumn = $inflow?.data.selectedColumn as string

    function renameColumn(
        columnName: string,
        newColumnName: string,
        replace: boolean = true
    ) {
        const newDataset = dataset.map((row) => {
            const newRow = { ...row }
            newRow[newColumnName] = newRow[columnName]
            if (replace && newColumnName !== columnName) {
                delete newRow[columnName]
            }
            return newRow
        })
        updateNodeData(id, { dataset: newDataset }, { replace: false })
    }

    $: emojiHash(dataset).then((hash) => {
        datasetHash = hash
    })
</script>

<OperationalNodeContainer title="Rename Column">
    <Handle
        position={Position.Top}
        type="target"
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white"
    />
    <!-- New Name Input -->
    <div class="px-3">
        <input
            type="text"
            class="w-full rounded-md border border-[#5d3a8b] bg-transparent px-2 py-1 font-mono text-sm font-medium leading-none text-[#5d3a8b]"
            placeholder="New Column Name"
            on:input={(e) => {
                renameColumn(selectedColumn, e.target.value)
            }}
        />
    </div>

    <Handle id="selected-values" position={Position.Right} type="source" />
    <Handle
        id="dataset-provider"
        position={Position.Bottom}
        type="source"
        class="h-2 w-2 rounded-b-full rounded-t-none border-none ring-2 ring-white "
    />
</OperationalNodeContainer>
