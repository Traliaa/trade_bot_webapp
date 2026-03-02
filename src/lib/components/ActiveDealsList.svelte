<script lang="ts">
    import TradeCard from "$lib/components/TradeCard.svelte";
    import type {TradeCardVM} from "$lib/types/trade";

    export let deals: TradeCardVM[] = [];
</script>

<div class="list">
    {#if deals.length === 0}
        <div class="empty">Нет активных позиций</div>
    {:else}
        {#each deals as item (item.symbol)}
            <TradeCard {item} />
        {/each}
    {/if}
</div>

<style>
    .list { display: grid; gap: 10px; }
    .empty { color: var(--tg-hint); padding: 8px 2px; }
</style>