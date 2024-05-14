<main
	class="pattern-grid-lg flex h-screen w-full flex-col items-center justify-center bg-[#f5f0e1]"
>
	<div class="space-y-4 text-center">
		<h1
			class="cursor-default select-none text-4xl font-bold text-[#5d3a8b]"
			title="Lightweight Editing Tool for Streamlined General Organization"
		>
			LETSGO
		</h1>
		<p class="mx-auto max-w-md text-lg text-[#5d3a8b]">
			Explore the depths of the strange and unknown by loading a dataset. Who knows what mysteries
			and insights await within the data?
		</p>
		<div class="mx-auto grid w-full max-w-sm items-center gap-1.5">
			<label
				class="text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				for="dataset"
			>
				Select a CSV file
			</label>
			<input
				class="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full cursor-pointer rounded-md border border-[#5d3a8b] bg-white px-3 py-2 text-sm text-[#5d3a8b] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				id="dataset"
				accept=".csv"
				type="file"
			/>
		</div>
		<a
			class="inline-flex rotate-[-15deg] transform items-center justify-center rounded-full bg-[#f7b42c] px-8 py-3 text-sm font-medium text-[#5d3a8b] shadow-lg transition-all hover:rotate-[-3deg] hover:scale-110 active:rotate-0 active:scale-95"
			href="#"
		>
			Load Dataset
		</a>
	</div>
</main>
