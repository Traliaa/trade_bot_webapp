<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { tradeStore } from '$lib/stores/trade';
    import { historyStore } from '$lib/stores/history';
    import { startVisibilityPoller } from '$lib/utils/visibilityPoller';
    import { hapticLight } from '$lib/telegram/haptics';

    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import InfoRow from '$lib/components/ui/InfoRow.svelte';
    import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

    onMount(() => {
        const load = async () => {
            await Promise.all([
                tradeStore.loadPositions(),
                historyStore.loadAll(10)
            ]);
        };

        load();

        const poller = startVisibilityPoller(load, 7000);

        return () => {
            poller.stop();
        };
    });

    async function refresh() {
        hapticLight();
        await Promise.all([
            tradeStore.loadPositions(),
            historyStore.loadAll(10)
        ]);
    }

    function isLong(side?: string): boolean {
        const s = (side ?? '').toLowerCase();
        return !(s.includes('short') || s.includes('sell') || s.includes('шорт'));
    }

    function isProfit(value?: number): boolean {
        return (value ?? 0) >= 0;
    }

    function formatPct(v?: number): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        const sign = v > 0 ? '+' : '';
        return `${sign}${v.toFixed(2)}%`;
    }

    function formatNum(v?: number, digits = 2): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        return v.toLocaleString('ru-RU', { maximumFractionDigits: digits });
    }

    function lastSignal(): string {
        const first = $historyStore.trades?.[0];
        if (!first) return '—';

        const symbol = first.symbol ?? '—';
        const side = isLong(first.side) ? 'Лонг' : 'Шорт';
        const dt = first.closed_at ?? first.opened_at ?? '';
        if (!dt) return `${symbol} · ${side}`;

        const d = new Date(dt);
        if (Number.isNaN(d.getTime())) return `${symbol} · ${side}`;

        const time = d.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `${symbol} · ${side} · ${time}`;
    }

    $: positions = $tradeStore.positions ?? [];
    $: stats = $historyStore.stats;

    $: balance = '—';
    $: dayPnl = typeof stats?.pnl_day === 'number' ? formatNum(stats.pnl_day) : '—';
    $: dayPct = typeof stats?.pnl_day_pct === 'number' ? formatPct(stats.pnl_day_pct) : '—';
    $: winrate = typeof stats?.winrate === 'number' ? `${stats.winrate.toFixed(1)}%` : '—';
    $: avgR = typeof stats?.avg_rr === 'number' ? `${stats.avg_rr.toFixed(2)}R` : '—';
    $: totalTrades = typeof stats?.total_trades === 'number' ? `${stats.total_trades}` : '—';

    $: weeklyBars = ($historyStore.trades ?? []).slice(0, 7).reverse().map((t, i) => {
        const raw = Math.abs(t.pnl_pct ?? 0);
        const height = Math.max(14, Math.min(88, raw * 20));
        const positive = isProfit(t.pnl_pct);
        const label = ['Чт', 'Пт', 'Сб', 'Вс', 'Пн', 'Вт', 'Ср'][i] ?? `${i + 1}`;
        return { height, positive, label };
    });
</script>

<div class="stack">
    <div class="grid2">
        <Card>
            <div class="stat-label">Баланс</div>
            <div class="stat-value">{balance}</div>
            <div class="stat-sub">Позже подключим из отдельной ручки</div>
        </Card>

        <Card>
            <div class="stat-label">P&amp;L за день</div>
            <div class:profit={dayPnl !== '—' && !dayPnl.startsWith('-')} class:loss={dayPnl.startsWith('-')} class="stat-value">
                {dayPnl}
            </div>
            <div class:profit-soft={dayPct !== '—' && !dayPct.startsWith('-')} class:loss-soft={dayPct.startsWith('-')} class="stat-sub">
                {dayPct}
            </div>
        </Card>
    </div>

    <Card>
        <SectionHeader
                title="Статус и сигнал"
                subtitle="Краткое состояние бота прямо на главном экране"
        >
            <svelte:fragment slot="actions">
                <div class="header-actions">
                    <StatusBadge tone={$tradeStore.error ? 'danger' : 'success'}>
                        {$tradeStore.error ? 'Ошибка' : 'Активен'}
                    </StatusBadge>
                    <Button variant="ghost" on:click={refresh} disabled={$tradeStore.loading || $historyStore.loading}>
                        {$tradeStore.loading || $historyStore.loading ? '...' : 'Обновить'}
                    </Button>
                </div>
            </svelte:fragment>
        </SectionHeader>

        <div class="rows">
            <InfoRow>
                <span slot="label">Последний сигнал</span>
                <span slot="value">{lastSignal()}</span>
            </InfoRow>

            <InfoRow>
                <span slot="label">WebSocket</span>
                <span slot="value" class:profit={!$tradeStore.error} class:loss={$tradeStore.error != null}>
          {$tradeStore.error ? 'Проблема' : 'Подключен'}
        </span>
            </InfoRow>

            <InfoRow>
                <span slot="label">Биржа</span>
                <span slot="value">OKX</span>
            </InfoRow>
        </div>
    </Card>

    <Card>
        <SectionHeader
                title="Статистика за 7 дней"
                subtitle="Основные показатели стратегии"
        />

        <div class="stats-grid">
            <Card padded={true} className="mini-card">
                <div class="stat-label">Винрейт</div>
                <div class="mini-value">{winrate}</div>
            </Card>

            <Card padded={true} className="mini-card">
                <div class="stat-label">Средний R</div>
                <div class="mini-value">{avgR}</div>
            </Card>

            <Card padded={true} className="mini-card">
                <div class="stat-label">Сделок</div>
                <div class="mini-value">{totalTrades}</div>
            </Card>
        </div>
    </Card>

    <Card>
        <SectionHeader
                title="P&amp;L за последние сделки"
                subtitle="Временный мини-график на основе истории"
        >
            <svelte:fragment slot="actions">
                <span class="link-text">{dayPct}</span>
            </svelte:fragment>
        </SectionHeader>

        {#if weeklyBars.length === 0}
            <Card className="inner-card">
                <div class="empty">Пока недостаточно данных для графика</div>
            </Card>
        {:else}
            <div class="bars">
                {#each weeklyBars as bar}
                    <div class="bar-col">
                        <div class="bar-track">
                            <div
                                    class:bar-positive={bar.positive}
                                    class:bar-negative={!bar.positive}
                                    class="bar-fill"
                                    style={`height:${bar.height}px`}
                            ></div>
                        </div>
                        <span class="bar-label">{bar.label}</span>
                    </div>
                {/each}
            </div>
        {/if}
    </Card>

    <Card>
        <SectionHeader
                title="Активные сделки"
                subtitle={`Сейчас открыто ${positions.length}`}
        >
            <svelte:fragment slot="actions">
                <Button variant="ghost" on:click={() => goto('/deals')}>
                    Все
                </Button>
            </svelte:fragment>
        </SectionHeader>

        {#if $tradeStore.loading && positions.length === 0}
            <Card className="inner-card">
                <div class="empty">Загружаем позиции...</div>
            </Card>
        {:else if $tradeStore.error}
            <Card variant="error" className="inner-card">
                <div class="error-text">{$tradeStore.error}</div>
            </Card>
        {:else if positions.length === 0}
            <Card className="inner-card">
                <div class="empty">Нет открытых позиций</div>
            </Card>
        {:else}
            <div class="rows">
                {#each positions.slice(0, 3) as position}
                    <div class="trade-row">
                        <div>
                            <div class="trade-top">
                                <span class="pair">{position.pair}</span>
                                <span class:long={position.side === 'Лонг'} class:short={position.side === 'Шорт'} class="side">
                  {position.side}
                </span>
                            </div>
                            <div class="trade-sub">Вход {position.entry}</div>
                        </div>

                        <div class:profit={position.pnlPct.startsWith('+')} class:loss={position.pnlPct.startsWith('-')} class="pnl">
                            {position.pnlPct}
                        </div>
                    </div>
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

    .grid2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .stat-label {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.45);
    }

    .stat-value {
        margin-top: 4px;
        font-size: 20px;
        font-weight: 600;
        color: #fff;
    }

    .stat-sub {
        margin-top: 2px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
    }

    .mini-value {
        margin-top: 6px;
        font-size: 18px;
        font-weight: 600;
        color: #fff;
    }

    .profit {
        color: #34d399;
    }

    .profit-soft {
        color: rgba(52, 211, 153, 0.7);
    }

    .loss {
        color: #fb7185;
    }

    .loss-soft {
        color: rgba(251, 113, 133, 0.7);
    }

    .stats-grid {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }

    .mini-card {
        background: rgba(255, 255, 255, 0.03);
    }

    .bars {
        display: flex;
        align-items: end;
        gap: 8px;
        height: 110px;
        margin-top: 12px;
        padding: 12px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
    }

    .bar-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    .bar-track {
        width: 100%;
        height: 88px;
        display: flex;
        align-items: end;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.04);
        overflow: hidden;
    }

    .bar-fill {
        width: 100%;
        border-radius: 10px;
    }

    .bar-positive {
        background: rgba(52, 211, 153, 0.85);
    }

    .bar-negative {
        background: rgba(251, 113, 133, 0.85);
    }

    .bar-label {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.35);
    }

    .link-text {
        color: var(--tg-link, #60a5fa);
        font-size: 12px;
    }

    .trade-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .trade-top {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .pair {
        font-size: 14px;
        font-weight: 600;
        color: #fff;
    }

    .side {
        display: inline-flex;
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 10px;
        font-weight: 600;
    }

    .side.long {
        color: #34d399;
        background: rgba(52, 211, 153, 0.12);
        border: 1px solid rgba(52, 211, 153, 0.18);
    }

    .side.short {
        color: #fb7185;
        background: rgba(251, 113, 133, 0.12);
        border: 1px solid rgba(251, 113, 133, 0.18);
    }

    .trade-sub {
        margin-top: 2px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
    }

    .pnl {
        font-size: 14px;
        font-weight: 600;
    }

    .inner-card {
        margin-top: 12px;
    }

    .empty {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.55);
    }

    .error-text {
        font-size: 13px;
        color: #fca5a5;
    }
</style>