<script lang="ts">
    import { nodeTypes } from '$lib/nodes'

    const onDragStart = (event: DragEvent, nodeType: string) => {
        if (!event.dataTransfer) {
            return null
        }

        event.dataTransfer.setData('application/svelteflow', nodeType)
        event.dataTransfer.effectAllowed = 'move'
    }
</script>

<div class="pointer-events-none absolute right-0 top-10 z-10 flex w-full">
    <div class="m-2 flex w-full justify-end">
        <div class="flex space-x-2 text-sm">
            <div
                class="pointer-events-auto flex w-48 flex-col rounded border bg-white/70 shadow-sm backdrop-blur-xl"
            >
                <!-- Unstylized input -->
                <input
                    type="text"
                    class="my-1 w-full px-4 py-2 focus:outline-none"
                    placeholder="Search..."
                />
                <!-- Divider -->
                <div class="border-b"></div>
                {#each Object.keys(nodeTypes) as type}
                    <div class="px-2 pt-2 last:pb-2">
                        <div
                            class="cursor-default rounded-sm p-2 transition-colors hover:bg-slate-100"
                            on:dragstart={(event) => onDragStart(event, type)}
                            draggable={true}
                        >
                            {type}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
