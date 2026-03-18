<script lang="ts">


    export let value = '';
    export let items: SegmentedTabItem[] = [];
    export let columns = 0;
    export let size: 'sm' | 'md' = 'md';

    $: gridColumns = columns > 0 ? columns : items.length;
</script>

<div
        class={`tabs ${size}`}
        style={`grid-template-columns: repeat(${gridColumns}, 1fr);`}
>
    {#each items as item}
        <button
                type="button"
                class:active={value === item.key}
                on:click={() => (value = item.key)}
        >
            {item.label}
        </button>
    {/each}
</div>

<style>
    .tabs {
        display: grid;
        gap: 8px;
        padding: 4px;
        border-radius: 16px;
        background: var(--bg-soft, #111827);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    }

    .tabs.sm {
        gap: 6px;
    }

    .tabs button {
        border: 0;
        border-radius: 12px;
        background: transparent;
        color: var(--text-muted, rgba(255, 255, 255, 0.6));
        transition: 0.15s ease;
        font-weight: 500;
    }

    .tabs.md button {
        padding: 10px 12px;
        font-size: 14px;
    }

    .tabs.sm button {
        padding: 10px 6px;
        font-size: 12px;
    }

    .tabs button.active {
        background: var(--accent, #2563eb);
        color: #fff;
    }
</style>