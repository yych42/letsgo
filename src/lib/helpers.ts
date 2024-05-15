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

export { generateHistogram, range, missing };

function getColumnNames(data: any[]): string[] {
	if (data.length === 0) {
		return [];
	}

	return Object.keys(data[0]);
}

function determineColumnType(columnData: any[]): 'numeric' | 'string' | 'mixed' {
	if (columnData.every((d) => typeof d === 'number' || d === undefined || d === null)) {
		return 'numeric';
	} else if (columnData.every((d) => typeof d === 'string' || d === undefined || d === null)) {
		return 'string';
	} else {
		return 'mixed';
	}
}

function getColumnData(
	data: any[],
	columnName: string
): { values: any[]; type: 'numeric' | 'string' | 'mixed' | undefined } {
	if (data === undefined || data.length === 0) {
		return { values: [], type: undefined };
	}
	const values = data.map((row) => row[columnName]);
	const type = determineColumnType(values);
	return { values: values, type };
}

export { getColumnNames, getColumnData };
