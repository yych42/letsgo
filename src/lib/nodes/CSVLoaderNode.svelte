<script lang="ts">
	import { Handle, Position, type NodeProps, useSvelteFlow } from '@xyflow/svelte';
	import Papa from 'papaparse';

	type $$Props = NodeProps;

	export let id: $$Props['id'];
	export let data: $$Props['data'];

	const { updateNodeData } = useSvelteFlow();
</script>

<div class="colorpicker">
	<input
		class="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full cursor-pointer rounded-md border border-[#5d3a8b] bg-white px-3 py-2 text-sm text-[#5d3a8b] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
		id="dataset"
		accept=".csv"
		type="file"
		on:change={(evt) => {
			const file = evt.target.files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					const text = e.target?.result;
					Papa.parse(text, {
						header: true,
						dynamicTyping: true,
						complete: (results) => {
							console.log(results.data);
							updateNodeData(id, { dataset: results.data });
						},
						error: (err) => {
							console.error(err);
						}
					});
				};
				reader.readAsText(file);
			}
		}}
	/>
	<Handle type="source" position={Position.Right} />
</div>
