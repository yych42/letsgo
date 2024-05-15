<script lang="ts">
	import { writable } from 'svelte/store';
	import { SvelteFlow, Controls, Background, BackgroundVariant, MiniMap } from '@xyflow/svelte';
	import CsvLoaderNode from '$lib/nodes/CSVLoaderNode.svelte';
	import ColumnNamesNode from '$lib/nodes/ColumnNamesNode.svelte';
	import ColumnSelector from '$lib/nodes/ColumnSelector.svelte';
	import RangeFilterNode from '$lib/nodes/RangeFilterNode.svelte';

	// 👇 this is important! You need to import the styles for Svelte Flow to work
	import '@xyflow/svelte/dist/style.css';

	// We are using writables for the nodes and edges to sync them easily. When a user drags a node for example, Svelte Flow updates its position.
	const nodes = writable([
		{
			id: '3',
			// this type needs to match the newly defined node type
			type: 'csv-loader',
			position: { x: 0, y: 0 }
		},
		{
			id: '4',
			type: 'column-names',
			position: { x: 450, y: 0 }
		},
		{
			id: '5',
			type: 'column-selector',
			position: { x: 450, y: 200 }
		},
		{
			id: '6',
			type: 'range-filter-node',
			position: { x: 750, y: 200 }
		},
		{
			id: '7',
			type: 'column-selector',
			position: { x: 1050, y: 200 }
		},
		{
			id: '8',
			type: 'column-selector',
			position: { x: 750, y: 350 }
		}
	]);

	// same for edges
	const edges = writable([]);

	const snapGrid: [number, number] = [15, 15];
</script>

<!--
👇 By default, the Svelte Flow container has a height of 100%.
This means that the parent container needs a height to render the flow.
-->
<div class="h-screen select-none">
	<SvelteFlow
		{nodes}
		{edges}
		{snapGrid}
		nodeTypes={{
			'csv-loader': CsvLoaderNode,
			'column-names': ColumnNamesNode,
			'column-selector': ColumnSelector,
			'range-filter-node': RangeFilterNode
		}}
		fitView
		on:nodeclick={(event) => console.log('on node click', event.detail.node)}
	>
		<Controls />
		<Background variant={BackgroundVariant.Dots} />
		<MiniMap />
	</SvelteFlow>
</div>
