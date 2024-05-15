<script lang="ts">
	import {
		Handle,
		Position,
		type NodeProps,
		useHandleConnections,
		useNodesData,
		useSvelteFlow
	} from '@xyflow/svelte';
	import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte';
	import { getColumnData } from '$lib/helpers';

	type $$Props = NodeProps;
	export let id: $$Props['id'];
	export let data: $$Props['data'];

	const { updateNodeData } = useSvelteFlow();
	const connections = useHandleConnections({
		nodeId: id,
		type: 'target'
	});

	$: inflow = useNodesData($connections[0]?.source);

	let min: string = '';
	let max: string = '';

	$: if ($inflow && $inflow.data.columnData.type === 'numeric') {
		filterByRange(Number(min), Number(max));
	}

	function filterByRange(min: number, max: number) {
		// Make sure the min and max are plausible
		if (min > max) {
			// console.log('min is greater than max');
			return;
		}
		if ($inflow?.data.dataset === undefined) {
			return;
		}
		// Set out-of-range values to null
		const filteredData = $inflow?.data.dataset.map((row) => {
			const value = row[$inflow.data.selectedColumn];
			if (value < min || value > max) {
				// console.log(value, 'is out of range of', min, max);
				const updatedRow = { ...row, [$inflow.data.selectedColumn]: null };
				// console.log(updatedRow);
				return updatedRow;
			}
			return row;
		});
		// console.log(filteredData);
		updateNodeData(
			id,
			{
				dataset: filteredData,
				selectedColumn: $inflow.data.selectedColumn,
				columnData: getColumnData(filteredData, $inflow.data.selectedColumn)
			},
			{ replace: false }
		);
	}

	$$restProps;
</script>

<OperationalNodeContainer title="Filter by range">
	<div class="my-2 border-t border-[#5d3a8b]"></div>
	<Handle type="target" position={Position.Left} />
	{#if $inflow && $inflow.data.columnData.type === 'numeric'}
		<div class="flex flex-col space-y-2 px-3 py-1">
			<!-- Min -->
			<input
				type="number"
				class="w-full rounded-md border border-[#5d3a8b] bg-white px-3 py-1 text-sm text-[#5d3a8b]"
				placeholder="min"
				bind:value={min}
			/>
			<!-- Max -->
			<input
				type="number"
				class="w-full rounded-md border border-[#5d3a8b] bg-white px-3 py-1 text-sm text-[#5d3a8b]"
				placeholder="max"
				bind:value={max}
			/>
		</div>
	{:else}
		<p class="px-3 font-sans text-sm">Select a numeric column</p>
	{/if}
	<!-- Divider -->
	<div class="my-2 border-t border-[#5d3a8b]"></div>
	<!-- Checkbox -->
	<div class="flex items-center space-x-2 px-3">
		<input type="checkbox" class="rounded border-[#5d3a8b]" checked disabled />
		<label class="text-sm text-[#5d3a8b]">Set as missing</label>
	</div>

	<Handle type="source" position={Position.Right} />
</OperationalNodeContainer>
