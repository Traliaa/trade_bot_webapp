<script lang="ts">
    import { onMount } from 'svelte';
    import TradeCard from './TradeCard.svelte';
    import { historyStore } from '$lib/stores/history';
    import { startVisibilityPoller } from '$lib/utils/visibilityPoller';
    import { hapticLight } from '$lib/telegram/haptics';

    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

    onMount(() => {
        historyStore.loadAll(20);

        const poller = startVisibilityPoller(
            () => historyStore.loadAll(20),
            5000
        );

        return () => {
            poller.stop();
        };
    });

    async function refresh() {
        hapticLight();
        await historyStore.loadAll(20);
    }

    $: state = $historyStore;
    $: uiTrades = state.openTrades ?? [];
</script>

<div class="stack">
    <Card variant="muted">
        <div class="info-head">
            <div class="icon">⇄</div>
            <div>
                <div class="title">Активные сделки</div>
                <div class="sub">Открытые позиции с быстрым обзором</div>
            </div>
        </div>
    </Card>

    <Card>
        <SectionHeader
                title="Открытые позиции"
                subtitle={$historyStore.loading ? 'Загрузка...' : `Сейчас открыто ${uiTrades.length}`}
        >
            <svelte:fragment slot="actions">
                <Button variant="ghost" on:click={refresh} disabled={$historyStore.loading}>
                    {$historyStore.loading ? '...' : 'Обновить'}
                </Button>
            </svelte:fragment>
        </SectionHeader>

        {#if $historyStore.error}
            <div class="inner-block">
                <Card variant="error">
                    <div class="error-text">{$historyStore.error}</div>
                </Card>
            </div>
        {:else if $historyStore.loading && uiTrades.length === 0}
            <div class="inner-block">
                <Card>
                    <div class="empty">Загружаем позиции...</div>
                </Card>
            </div>
        {:else if uiTrades.length === 0}
            <div class="inner-block">
                <Card>
                    <div class="empty">Нет открытых позиций</div>
                </Card>
            </div>
        {:else}
            <div class="list">
                {#each uiTrades as trade}
                    <TradeCard {trade} />
                {/each}
            </div>
        {/if}
    </Card>
</div>

<style>
    .stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .info-head {
        display: flex;
        gap: 12px;
        align-items: flex-start;
    }

    .icon {
        width: 32px;
        height: 32px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(37, 99, 235, 0.18);
        color: #60a5fa;
        flex-shrink: 0;
    }

    .title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-main, #e5e7eb);
    }

    .sub {
        margin-top: 2px;
        font-size: 12px;
        color: var(--text-muted, #6b7280);
    }

    .list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 12px;
    }

    .inner-block {
        margin-top: 12px;
    }

    .empty {
        font-size: 13px;
        color: var(--text-muted, #6b7280);
    }

    .error-text {
        font-size: 13px;
        color: var(--danger, #fb7185);
    }
</style>