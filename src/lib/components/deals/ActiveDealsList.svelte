<script lang="ts">
    import { onMount } from 'svelte';
    import TradeCard from './TradeCard.svelte';
    import { tradeStore } from '$lib/stores/trade';
    import { startPoller } from '$lib/utils/poller';
    import { hapticLight } from '$lib/telegram/haptics';
    import {startVisibilityPoller} from "$lib/utils/visibilityPoller";

    export let userId: number;

    onMount(() => {
        tradeStore.loadPositions();

        const poller = startVisibilityPoller(
            () => tradeStore.loadPositions(),
            5000
        );

        return () => {
            poller.stop();
        };
    });

    async function refresh() {
        hapticLight();
        await tradeStore.loadPositions();
    }
</script>

<div class="stack">
    <section class="info-card">
        <div class="icon">⇄</div>
        <div>
            <div class="title">Активные сделки</div>
            <div class="sub">Открытые позиции с быстрыми действиями</div>
        </div>
    </section>

    <section class="card">
        <div class="header">
            <div>
                <div class="title">Открытые позиции</div>
                <div class="sub">
                    {#if $tradeStore.loading}
                        Загрузка...
                    {:else}
                        Сейчас активно {$tradeStore.positions.length} сделки
                    {/if}
                </div>
            </div>

            <button class="ghost" on:click={refresh} disabled={$tradeStore.loading}>
                {$tradeStore.loading ? '...' : 'Обновить'}
            </button>
        </div>

        {#if $tradeStore.error}
            <div class="error">
                {$tradeStore.error}
            </div>
        {:else if $tradeStore.loading && $tradeStore.positions.length === 0}
            <div class="empty">
                Загружаем позиции...
            </div>
        {:else if $tradeStore.positions.length === 0}
            <div class="empty">
                Нет открытых позиций
            </div>
        {:else}
            <div class="list">
                {#each $tradeStore.positions as position}
                    <TradeCard {position} />
                {/each}
            </div>
        {/if}
    </section>
</div>

<style>
    .stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .card,
    .info-card {
        border-radius: 20px;
        padding: 14px;
        background: #111827;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .info-card {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        background: #0e1628;
    }

    .icon {
        width: 32px;
        height: 32px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(29, 78, 216, 0.2);
        color: #60a5fa;
        flex-shrink: 0;
    }

    .title {
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.92);
    }

    .sub {
        margin-top: 2px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
    }

    .ghost {
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.7);
        border-radius: 12px;
        padding: 8px 12px;
        font-size: 12px;
    }

    .ghost:disabled {
        opacity: 0.6;
    }

    .list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .empty,
    .error {
        border-radius: 14px;
        padding: 14px;
        font-size: 13px;
        background: rgba(255, 255, 255, 0.03);
    }

    .empty {
        color: rgba(255, 255, 255, 0.55);
    }

    .error {
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.2);
    }
</style>