<script lang="ts">
	import { Handle, Position, type NodeProps, useSvelteFlow } from '@xyflow/svelte';
	import OperationalNodeContainer from '$lib/node-elements/OperationalNodeContainer.svelte';
	import Papa from 'papaparse';

	type $$Props = NodeProps;

	export let id: $$Props['id'];
	export let data: $$Props['data'];

	const { updateNodeData } = useSvelteFlow();

	function loadCSV(file: File) {
		const reader = new FileReader();
		reader.onload = (e) => {
			const localFile = e.target?.result;
			Papa.parse(localFile as string, {
				header: true,
				dynamicTyping: true,
				complete: (results) => {
					console.log(results.data);
					updateNodeData(id, { dataset: results.data });
				},
				error: (err: any) => {
					console.error(err);
				}
			});
		};
		reader.readAsText(file);
	}
</script>

<OperationalNodeContainer>
	<input
		id="dataset"
		class="mx-2 file:border-0 file:bg-transparent file:text-sm file:font-medium"
		accept=".csv"
		type="file"
		on:change={(evt) => {
			const file = evt.currentTarget?.files?.[0];
			if (file) {
				loadCSV(file);
			}
		}}
	/>
	<Handle type="source" position={Position.Right} />
</OperationalNodeContainer>
