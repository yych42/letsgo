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

	type $$Props = NodeProps;
	export let id: $$Props['id'];
	export let data: $$Props['data'];

	const { updateNodeData } = useSvelteFlow();
	const connections = useHandleConnections({
		nodeId: id,
		type: 'target'
	});

	function centralTendency(data: []): { mean: number; sd: number; n: number } | null {
		if (data.length === 0) return null;
		const validN = data.filter((n) => n !== null).length;
		const mean = data.reduce((a, b) => a + b, 0) / validN;
		const sd = Math.sqrt(data.reduce((a, b) => a + (b - mean) ** 2, 0) / validN);
		return { mean, sd, n: validN };
	}

	$: inflow = useNodesData($connections[0]?.source);
	$: if ($inflow?.data.columnData) {
		updateNodeData(
			id,
			{
				centralTendency: centralTendency($inflow.data.columnData.values)
			},
			{ replace: false }
		);
	}
</script>

<InfoNodeContainer title="Mean">
	<Handle type="target" position={Position.Left} />
	<div class="my-2 border-t border-[#5d3a8b]"></div>
	<ul class="px-3 font-mono">
		{#if data && data.centralTendency}
			<li>Mean: {data.centralTendency.mean.toFixed(2)}</li>
			<li>SD: {data.centralTendency.sd.toFixed(2)}</li>
		{/if}
	</ul>
	<!-- Divder -->
	<div class="my-2 border-t border-[#5d3a8b]"></div>
	{#if data && data.centralTendency}
		<p class="px-3 font-sans text-sm">{data.centralTendency.n} valid values</p>
	{:else}
		<p class="px-3 font-sans text-sm">Select a column</p>
	{/if}

	<Handle type="source" position={Position.Right} />
</InfoNodeContainer>
