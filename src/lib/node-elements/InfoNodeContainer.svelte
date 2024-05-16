<script lang="ts">
    import Divider from './Divider.svelte'

    export let title: string = ''
</script>

<div
    class="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-10 max-w-xl cursor-pointer flex-col overflow-hidden border border-[#5d3a8b] bg-white py-2 text-sm text-[#5d3a8b] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
>
    {#if title}
        <p class="mx-3 font-semibold">{title}</p>
        <Divider />
    {/if}
    <ul class="px-3 font-mono">
        <slot />
    </ul>
</div>
