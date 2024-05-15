<script lang="ts">
	import {
		Handle,
		Position,
		type NodeProps,
		useHandleConnections,
		useNodesData,
		useSvelteFlow
	} from '@xyflow/svelte';
	import InfoNodeContainer from '$lib/node-elements/InfoNodeContainer.svelte';
	import { getColumnNames } from '$lib/helpers';

	type $$Props = NodeProps;
	export let id: $$Props['id'];
	export let data: $$Props['data'];

	const { updateNodeData } = useSvelteFlow();
	const connections = useHandleConnections({
		nodeId: id,
		type: 'target'
	});

	$: inflow = useNodesData($connections[0]?.source);
	$: updateNodeData(
		id,
		{ columnNames: getColumnNames(($inflow?.data.dataset as any[]) ?? []) as string[] },
		{ replace: true }
	);
</script>

<InfoNodeContainer>
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
</InfoNodeContainer>
