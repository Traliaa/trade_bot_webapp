<script lang="ts">
    import { onMount } from 'svelte';
    import TradeCard from './TradeCard.svelte';
    import { tradeStore } from '$lib/stores/trade';
    import { startVisibilityPoller } from '$lib/utils/visibilityPoller';
    import { hapticLight } from '$lib/telegram/haptics';

    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

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
    <Card variant="muted">
        <div class="info-head">
            <div class="icon">⇄</div>
            <div>
                <div class="title">Активные сделки</div>
                <div class="sub">Открытые позиции с быстрыми действиями</div>
            </div>
        </div>
    </Card>

    <Card>
        <SectionHeader
                title="Открытые позиции"
                subtitle={$tradeStore.loading ? 'Загрузка...' : `Сейчас активно ${$tradeStore.positions.length} сделки`}
        >
            <svelte:fragment slot="actions">
                <Button variant="ghost" on:click={refresh} disabled={$tradeStore.loading}>
                    {$tradeStore.loading ? '...' : 'Обновить'}
                </Button>
            </svelte:fragment>
        </SectionHeader>

        {#if $tradeStore.error}
            <div class="inner-block">
                <Card variant="error">
                    <div class="error-text">{$tradeStore.error}</div>
                </Card>
            </div>
        {:else if $tradeStore.loading && $tradeStore.positions.length === 0}
            <div class="inner-block">
                <Card>
                    <div class="empty">Загружаем позиции...</div>
                </Card>
            </div>
        {:else if $tradeStore.positions.length === 0}
            <div class="inner-block">
                <Card>
                    <div class="empty">Нет открытых позиций</div>
                </Card>
            </div>
        {:else}
            <div class="list">
                {#each $tradeStore.positions as position}
                    <TradeCard {position} />
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
        background: rgba(29, 78, 216, 0.2);
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