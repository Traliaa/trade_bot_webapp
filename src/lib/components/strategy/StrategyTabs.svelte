<script lang="ts">
    export let tab: 'trading' | 'limits' | 'trailing' | 'features' = 'trading';

    const items = [
        { key: 'trading', label: 'Торговля' },
        { key: 'trailing', label: 'Сопровождение' },
        { key: 'limits', label: 'Лимиты' },
        { key: 'features', label: 'Доп. функции' }
    ] as const;
</script>

<div class="tabs">
    {#each items as item}
        <button
                class:active={tab === item.key}
                on:click={() => (tab = item.key)}
        >
            {item.label}
        </button>
    {/each}
</div>

<style>
    .tabs {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
        padding: 4px;
        border-radius: 16px;
        background: #111827;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    button {
        border: 0;
        border-radius: 12px;
        padding: 10px 6px;
        background: transparent;
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
    }

    button.active {
        background: #1d4ed8;
        color: #fff;
    }
</style>