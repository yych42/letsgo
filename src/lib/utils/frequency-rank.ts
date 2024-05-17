/**
 * A type representing the frequency result of a value.
 */
type FrequencyResult<T> = {
    value: T
    frequency: number
    percentage: number
}

/**
 * Computes the frequency of each unique value in the array, ranks them by frequency,
 * and calculates the percentage of each value relative to the total count.
 * If topN is specified, only the top-N results by frequency are included in the output,
 * but the total number of unique values is still returned.
 *
 * @param arr - The input array of any type.
 * @param topN - Optional. The number of top frequency results to include in the output.
 * @returns An object containing the total number of unique values and an array of objects with the top-N unique values, their frequencies, and percentages.
 *
 * @example
 * const data = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple'];
 * const result = getFrequencyRankedSet(data, 2);
 * console.log(result);
 * // Output:
 * // {
 * //   totalUniqueValues: 3,
 * //   topValues: [
 * //     { value: 'apple', frequency: 3, percentage: 50 },
 * //     { value: 'banana', frequency: 2, percentage: 33.33 }
 * //   ]
 * // }
 */
function getFrequencyRankedSet<T>(
    arr: T[],
    topN?: number
): { totalUniqueValues: number; topValues: FrequencyResult<T>[] } {
    const frequencyMap = new Map<T, number>()

    // Calculate the frequency of each unique value
    for (const item of arr) {
        if (frequencyMap.has(item)) {
            frequencyMap.set(item, frequencyMap.get(item)! + 1)
        } else {
            frequencyMap.set(item, 1)
        }
    }

    const totalCount = arr.length

    // Create an array of frequency results
    const frequencyResults: FrequencyResult<T>[] = Array.from(
        frequencyMap,
        ([value, frequency]) => ({
            value,
            frequency,
            percentage: (frequency / totalCount) * 100
        })
    )

    const totalUniqueValues = frequencyResults.length

    if (topN === undefined) {
        // If topN is not specified, sort the results by frequency in descending order
        frequencyResults.sort((a, b) => b.frequency - a.frequency)
        return { totalUniqueValues, topValues: frequencyResults }
    } else {
        // If topN is specified, use a min-heap to get the top-N results efficiently
        const minHeap = new MinHeap<FrequencyResult<T>>(
            (a, b) => a.frequency - b.frequency
        )

        for (const result of frequencyResults) {
            minHeap.insert(result)
            if (minHeap.size() > topN) {
                minHeap.extractMin()
            }
        }

        const topResults = minHeap.toArray()
        // Sort the top results by frequency in descending order before returning
        topResults.sort((a, b) => b.frequency - a.frequency)

        console.log(topResults)
        return { totalUniqueValues, topValues: topResults }
    }
}

export { getFrequencyRankedSet }

class MinHeap<T> {
    private heap: T[] = []
    private compare: (a: T, b: T) => number

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare
    }

    insert(value: T): void {
        this.heap.push(value)
        this.bubbleUp(this.heap.length - 1)
    }

    extractMin(): T | undefined {
        if (this.heap.length === 0) {
            return undefined
        }
        const min = this.heap[0]
        const end = this.heap.pop()
        if (this.heap.length > 0 && end !== undefined) {
            this.heap[0] = end
            this.sinkDown(0)
        }
        return min
    }

    size(): number {
        return this.heap.length
    }

    toArray(): T[] {
        return this.heap.slice()
    }

    private bubbleUp(index: number): void {
        const element = this.heap[index]
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2)
            const parent = this.heap[parentIndex]
            if (this.compare(element, parent) >= 0) break
            this.heap[index] = parent
            index = parentIndex
        }
        this.heap[index] = element
    }

    private sinkDown(index: number): void {
        const length = this.heap.length
        const element = this.heap[index]

        while (true) {
            let leftChildIndex = 2 * index + 1
            let rightChildIndex = 2 * index + 2
            let leftChild: T | undefined
            let rightChild: T | undefined
            let swap = null

            if (leftChildIndex < length) {
                leftChild = this.heap[leftChildIndex]
                if (this.compare(leftChild, element) < 0) {
                    swap = leftChildIndex
                }
            }

            if (rightChildIndex < length) {
                rightChild = this.heap[rightChildIndex]
                if (
                    (swap === null && this.compare(rightChild, element) < 0) ||
                    (swap !== null && this.compare(rightChild, leftChild!) < 0)
                ) {
                    swap = rightChildIndex
                }
            }

            if (swap === null) break

            this.heap[index] = this.heap[swap]
            index = swap
        }
        this.heap[index] = element
    }
}
