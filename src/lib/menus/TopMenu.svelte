<script lang="ts">
    export let nodesCount: number | undefined
</script>

<div class="pointer-events-none absolute left-0 top-0 z-10 flex w-full">
    <div class="m-2 flex w-full justify-between">
        <div class="flex space-x-2">
            <!-- Goofy animation applied because no one is looking yet -->
            <div
                class="pointer-events-auto flex cursor-pointer rounded border bg-white/70 p-1 px-2 shadow-sm backdrop-blur-xl transition-all hover:rotate-12"
            >
                <span class="inline-flex items-center font-mono text-sm"
                    >export setup</span
                >
            </div>

            <!-- Goofy animation applied because no one is looking yet -->
            <div
                class="pointer-events-auto flex cursor-pointer rounded border bg-white/70 p-1 px-2 shadow-sm backdrop-blur-xl transition-all hover:rotate-12"
            >
                <span class="inline-flex items-center font-mono text-sm"
                    >load setup</span
                >
            </div>

            <div
                class="pointer-events-auto flex border bg-white/70 p-1 px-2 backdrop-blur-xl"
            >
                <span class="inline-flex items-center font-mono text-sm">
                    {nodesCount} nodes on canvas</span
                >
            </div>
        </div>

        <div class="flex space-x-2">
            <!-- Goofy animation applied because no one is looking yet -->
            <div
                class="pointer-events-auto flex cursor-pointer rounded border bg-white/70 p-1 px-2 shadow-sm backdrop-blur-xl transition-all hover:-rotate-12"
            >
                <span class="inline-flex items-center font-mono text-sm"
                    >library</span
                >
            </div>
        </div>
    </div>
</div>
