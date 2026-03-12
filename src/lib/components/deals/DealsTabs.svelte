<script lang="ts">
    export let tab: 'active' | 'history' = 'active';
</script>

<div class="tabs">
    <button
            class:active={tab === 'active'}
            on:click={() => (tab = 'active')}
    >
        Активные
    </button>

    <button
            class:active={tab === 'history'}
            on:click={() => (tab = 'history')}
    >
        История
    </button>
</div>

<style>
    .tabs {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        padding: 4px;
        border-radius: 16px;
        background: #111827;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    button {
        border: 0;
        border-radius: 12px;
        padding: 10px 12px;
        background: transparent;
        color: rgba(255, 255, 255, 0.6);
    }

    button.active {
        background: #1d4ed8;
        color: white;
    }
</style>