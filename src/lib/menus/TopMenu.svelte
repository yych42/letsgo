<script lang="ts">
    export let nodesCount: number | undefined
</script>

<div class="pointer-events-none absolute left-0 top-0 z-10 flex h-12 w-full">
    <div class="m-2 flex w-full justify-between">
        <div class="flex space-x-2">
            <slot></slot>
        </div>

        <div class="flex space-x-2">
            <!-- TODO: A button to toggle the nodes library -->
            <div
                class="pointer-events-auto flex border bg-white/70 p-1 px-2 backdrop-blur-xl"
            >
                <span class="inline-flex items-center font-mono text-sm">
                    {nodesCount}
                    {#if nodesCount === 1}node{:else}nodes{/if} on canvas</span
                >
            </div>
        </div>
    </div>
</div>
