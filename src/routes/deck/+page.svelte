<script lang="ts">
	function generateHistogram(data: (number | null | undefined)[]): string {
		// Define histogram characters
		const histogramChars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
		const maxBars = 10;

		// Helper function to map frequency to a histogram character
		function getHistogramSymbol(frequency: number, maxFrequency: number): string {
			const index = Math.floor((frequency / maxFrequency) * (histogramChars.length - 1));
			return histogramChars[index];
		}

		// Filter out null and undefined values
		const filteredData = data.filter((value): value is number => value != null);

		if (filteredData.length === 0) {
			return '';
		}

		// Determine the range of the data
		const min = Math.min(...filteredData);
		const max = Math.max(...filteredData);

		// Calculate the range for each bar
		const range = (max - min) / maxBars;

		// Initialize the frequency array
		const frequencies = new Array(maxBars).fill(0);

		// Calculate the frequency for each bar
		for (const value of filteredData) {
			const index = Math.min(Math.floor((value - min) / range), maxBars - 1);
			frequencies[index]++;
		}

		// Find the maximum frequency
		const maxFrequency = Math.max(...frequencies);

		// Generate the histogram string
		const histogramString = frequencies
			.map((frequency) => getHistogramSymbol(frequency, maxFrequency))
			.join('');

		return histogramString;
	}

	function range(data: (number | null | undefined)[]): { min: number; max: number } | null {
		// Filter out null and undefined values
		const filteredData = data.filter((value): value is number => value != null);

		if (filteredData.length === 0) {
			return null;
		}

		// Calculate the minimum and maximum values
		const min = Math.min(...filteredData);
		const max = Math.max(...filteredData);

		return { min, max };
	}

	function missing(data: (number | null | undefined)[]): { percent: number; count: number } {
		// Calculate the number of missing values
		const missingCount = data.filter((value) => value == null).length;

		// Calculate the percentage of missing values
		const percentage = (missingCount / data.length) * 100;

		// Return the percentage and the count
		return { percent: percentage, count: missingCount };
	}

	function generateZeroInflatedNormalDistribution(
		mean: number,
		min: number,
		max: number,
		n: number,
		zeroProbability: number
	): number[] {
		// Helper function to generate a normally distributed random number using Box-Muller transform
		function generateNormalRandom(mean: number, stdDev: number): number {
			let u1 = Math.random();
			let u2 = Math.random();
			let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
			return z0 * stdDev + mean;
		}

		const stdDev = (max - min) / 6; // Approximation to cover the range within 3 std deviations
		let result: number[] = [];

		for (let i = 0; i < n; i++) {
			if (Math.random() < zeroProbability) {
				result.push(0);
			} else {
				let value = Math.round(generateNormalRandom(mean, stdDev));
				// Clamp the value between min and max
				if (value < min) value = min;
				if (value > max) value = max;
				result.push(value);
			}
		}

		return result;
	}

	let data = generateZeroInflatedNormalDistribution(3, 0, 8, 1000, 0.25) as (
		| number
		| null
		| undefined
	)[];
	// randomly drop 3% of values by setting them to null
	for (let i = 0; i < data.length; i++) {
		if (Math.random() < 0.03) {
			data[i] = null;
		}
	}

	const histogramString = generateHistogram(data);
	let rangeNumeric = range(data);
	let rangeString = rangeNumeric ? `${rangeNumeric.min}-${rangeNumeric.max}` : 'N/A';
	let missingStat = missing(data);
	const validCountString = `${data.length - missingStat.count}`;
	const missingString = `${missingStat.count} (${missingStat.percent.toFixed(2)}%)`;
</script>

<main
	class="pattern-grid-lg flex h-screen w-full items-center justify-center space-x-0 overflow-scroll bg-[#f5f0e1] md:flex-row md:space-x-8"
>
	<div class="mt-8 grid w-full max-w-md items-center gap-4">
		<div class="rounded-lg border border-[#5d3a8b] p-4">
			<div class="my-4 space-y-2">
				<div class="flex justify-between">
					<label
						class="inline-flex font-mono text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="column"
					>
						column
					</label>
					<label
						class="font-mono text-sm font-medium leading-none text-[#5d3a8b] opacity-60 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="column"
					>
						1/755
					</label>
				</div>
				<input
					class="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border border-[#5d3a8b] bg-white px-3 py-2 text-sm text-[#5d3a8b] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					id="column"
					placeholder="Enter a column name"
				/>
			</div>

			<div class="my-6 grid gap-y-4">
				<div
					class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					type <span class="font-normal">numeric</span>
				</div>

				<div
					class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					range <span class="font-normal">{rangeString}</span>
				</div>

				<div
					class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					valid <span class="font-normal">{validCountString}</span>
				</div>

				<div
					class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					missing <span class="font-normal">{missingString}</span>
				</div>

				<div
					class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					hist <span class="font-normal">{histogramString}</span>
				</div>
			</div>

			<div class="my-4 space-y-2">
				<div class="flex justify-between">
					<label
						class="inline-flex font-mono text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="notes"
					>
						notes
					</label>
				</div>
				<textarea
					class="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border border-[#5d3a8b] bg-white px-3 py-2 text-sm text-[#5d3a8b] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					rows="2"
					id="notes"
					placeholder="Annotate this variable name"
				/>
			</div>

			<div class="flex justify-between space-x-4">
				<button
					class="ring-offset-background focus-visible:ring-ring mt-4 inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-red-400 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:rotate-[3deg] hover:scale-110 hover:bg-red-200/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				>
					mark for removal
				</button>

				<button
					class="ring-offset-background focus-visible:ring-ring mt-4 inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-[#f7b42c] px-4 py-2 text-sm font-medium text-[#5d3a8b] transition-colors hover:bg-[#f7b42c]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				>
					next
				</button>
			</div>
		</div>
	</div>
	<div class="mt-8 grid w-full max-w-md items-center gap-4">
		<div class="rounded-lg border border-[#5d3a8b] p-4">
			<div class="my-4 space-y-2">
				<div class="flex justify-between">
					<label
						class="inline-flex font-mono text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="column"
					>
						column
					</label>
					<label
						class="font-mono text-sm font-medium leading-none text-[#5d3a8b] opacity-60 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="column"
					>
						1/755
					</label>
				</div>
				<input
					class="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border border-[#5d3a8b] bg-white px-3 py-2 text-sm text-[#5d3a8b] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					id="column"
					placeholder="Enter a column name"
				/>
			</div>

			<div class="my-6 grid gap-y-4">
				<div
					class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					type <span class="font-normal">numeric</span>
				</div>

				<div
					class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					range <span class="font-normal">{rangeString}</span>
				</div>

				<div
					class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					valid <span class="font-normal">{validCountString}</span>
				</div>

				<div
					class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					missing <span class="font-normal">{missingString}</span>
				</div>

				<div
					class="flex justify-between font-mono text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					hist <span class="font-normal">{histogramString}</span>
				</div>
			</div>

			<div class="my-4 space-y-2">
				<div class="flex justify-between">
					<label
						class="inline-flex font-mono text-sm font-medium leading-none text-[#5d3a8b] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
						for="notes"
					>
						notes
					</label>
				</div>
				<textarea
					class="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border border-[#5d3a8b] bg-white px-3 py-2 text-sm text-[#5d3a8b] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					rows="2"
					id="notes"
					placeholder="Annotate this variable name"
				/>
			</div>

			<div class="flex justify-between space-x-4">
				<button
					class="ring-offset-background focus-visible:ring-ring mt-4 inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-red-400 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:rotate-[3deg] hover:scale-110 hover:bg-red-200/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				>
					mark for removal
				</button>

				<button
					class="ring-offset-background focus-visible:ring-ring mt-4 inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-[#f7b42c] px-4 py-2 text-sm font-medium text-[#5d3a8b] transition-colors hover:bg-[#f7b42c]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				>
					next
				</button>
			</div>
		</div>
	</div>
</main>
