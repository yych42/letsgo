<script lang="ts">
	import {
		Handle,
		Position,
		type NodeProps,
		useHandleConnections,
		useNodesData,
		useSvelteFlow
	} from '@xyflow/svelte';

	import { range, missing, generateHistogram } from '$lib/stats';

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

	function getColumnData(data: any[], columnName: string): any[] {
		return data.map((row) => row[columnName]);
	}

	$: nodesData = useNodesData($connections[0]?.source);
	$: updateNodeData(
		id,
		{
			columnNames: getColumnNames(($nodesData?.data.dataset as any[]) ?? []) as string[],
			selectedColumn,
			columnData: getColumnData(($nodesData?.data.dataset as any[]) ?? [], selectedColumn)
		},
		{ replace: false }
	);

	let selectedColumn = '';
</script>

<div
	class="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-10 w-60 cursor-pointer flex-col overflow-hidden rounded-md border border-[#5d3a8b] bg-white py-2 text-sm text-[#5d3a8b] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
>
	<Handle type="target" position={Position.Left} />
	<p class="px-3 font-semibold">Select Column</p>
	<!-- Selector -->
	<select
		class="mx-3 my-1 rounded-md border border-[#5d3a8b] bg-white text-sm text-[#5d3a8b]"
		bind:value={selectedColumn}
	>
		{#each data.columnNames as columnName}
			<option>{columnName}</option>
		{/each}
	</select>
	<!-- Divder -->
	<div class="my-2 border-t border-[#5d3a8b]"></div>
	<div class="flex flex-col space-y-2 px-3 py-1">
		<!-- Check if selectedColumn is numeric with or without missing values -->
		{#if selectedColumn !== '' && data.columnData.every((d) => typeof d === 'number' || d === undefined || d === null)}
			<!-- Type -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				type <span class="font-normal">numeric</span>
			</div>
			<!-- Range -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				range <span class="font-normal"
					>{range(data.columnData)?.min ?? 'NA'} - {range(data.columnData)?.max ?? 'NA'}</span
				>
			</div>
			<!-- Valid -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				valid <span class="font-normal"
					>{data.columnData.length - missing(data.columnData).count}</span
				>
			</div>
			<!-- Missing -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				missing <span class="font-normal"
					>{missing(data.columnData).count} ({missing(data.columnData).percent.toFixed(2)}%)</span
				>
			</div>
			<!-- Ascii Histogram -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				Distribution {generateHistogram(data.columnData)}
			</div>
			<!-- Check if is nullable string -->
		{:else if selectedColumn !== '' && data.columnData.every((d) => typeof d === 'string' || d === undefined || d === null)}
			<!-- Type -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				type <span class="font-normal">string</span>
			</div>
			<!-- Unique -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				unique <span class="font-normal">{[...new Set(data.columnData)].length}</span>
			</div>
			<!-- Valid -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				valid <span class="font-normal"
					>{data.columnData.length - missing(data.columnData).count}</span
				>
			</div>
			<!-- Missing -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				missing <span class="font-normal"
					>{missing(data.columnData).count} ({missing(data.columnData).percent.toFixed(2)}%)</span
				>
			</div>
			<!-- Check if is numeric-string mixed -->
		{:else if selectedColumn !== '' && data.columnData.some((d) => typeof d === 'number' || d === undefined || d === null)}
			<!-- Type -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				type <span class="font-normal">mixed</span>
			</div>
			<!-- Percent numeric -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				numeric <span class="font-normal"
					>{(
						(data.columnData.filter((d) => typeof d === 'number').length / data.columnData.length) *
						100
					).toFixed(2)}%</span
				>
			</div>
			<!-- Percent string -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				string <span class="font-normal"
					>{(
						(data.columnData.filter((d) => typeof d === 'string').length / data.columnData.length) *
						100
					).toFixed(2)}%</span
				>
			</div>
			<!-- Valid -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				valid <span class="font-normal"
					>{data.columnData.length - missing(data.columnData).count}</span
				>
			</div>
			<!-- Missing -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				missing <span class="font-normal"
					>{missing(data.columnData).count} ({missing(data.columnData).percent.toFixed(2)}%)</span
				>
			</div>
		{:else}
			<!-- Unselected -->
			<div class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b]">
				<span class="font-normal">Select a column</span>
			</div>
		{/if}
	</div>
	<Handle type="source" position={Position.Right} />
</div>
