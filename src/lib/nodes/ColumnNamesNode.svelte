<script lang="ts">
	import {
		Handle,
		Position,
		type NodeProps,
		useHandleConnections,
		useNodesData,
		useSvelteFlow
	} from '@xyflow/svelte';

	type $$Props = NodeProps;
	export let id: $$Props['id'];
	export let data: $$Props['data'];

	const { updateNodeData } = useSvelteFlow();
	const connections = useHandleConnections({
		nodeId: id,
		type: 'target'
	});

	function getColumnNames(data: any[]): string[] {
		if (data.length === 0) {
			return [];
		}

		return Object.keys(data[0]);
	}

	$: nodesData = useNodesData($connections[0]?.source);
	$: updateNodeData(
		id,
		{ columnNames: getColumnNames(($nodesData?.data.dataset as any[]) ?? []) as string[] },
		{ replace: true }
	);
</script>

<div
	class="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-10 cursor-pointer flex-col overflow-hidden border border-[#5d3a8b] bg-white py-2 text-sm text-[#5d3a8b] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
>
	<Handle type="target" position={Position.Left} />
	<p class="px-3 font-semibold">Columns Names</p>
	<div class="my-2 border-t border-[#5d3a8b]"></div>
	<ul class="px-3 font-mono">
		{#if data.columnNames}
			{#each data.columnNames.slice(0, 5) ?? [] as columnName}
				<li>{columnName}</li>
			{/each}
			{#if data.columnNames.length > 5}
				<li>...</li>
			{/if}
		{:else}
			<li>No data</li>
		{/if}
	</ul>
	<!-- Divder -->
	<div class="my-2 border-t border-[#5d3a8b]"></div>
	<p class="px-3 font-sans text-sm">{(data.columnNames ?? []).length} total</p>

	<Handle type="source" position={Position.Right} />
</div>
