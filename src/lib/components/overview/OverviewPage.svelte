<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { tradeStore } from '$lib/stores/trade';
    import { historyStore } from '$lib/stores/history';

    onMount(() => {
        tradeStore.loadPositions();
        historyStore.loadAll(10);
    });

    async function refresh() {
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

    // Фейковый график пока из последних pnl_pct, позже можно заменить на реальный timeseries
    $: weeklyBars = ($historyStore.trades ?? []).slice(0, 7).reverse().map((t, i) => {
        const raw = Math.abs(t.pnl_pct ?? 0);
        const height = Math.max(14, Math.min(88, raw * 20));
        const positive = isProfit(t.pnl_pct);
        const label = ['Чт', 'Пт', 'Сб', 'Вс', 'Пн', 'Вт', 'Ср'][i] ?? `${i + 1}`;
        return { height, positive, label };
    });
</script>

<div class="stack">
    <section class="grid2">
        <div class="card">
            <div class="label">Баланс</div>
            <div class="value">{balance}</div>
            <div class="sub">Позже подключим из отдельной ручки</div>
        </div>

        <div class="card">
            <div class="label">P&amp;L за день</div>
            <div class:profit={dayPnl !== '—' && !dayPnl.startsWith('-')} class:loss={dayPnl.startsWith('-')} class="value">
                {dayPnl}
            </div>
            <div class:profit-soft={dayPct !== '—' && !dayPct.startsWith('-')} class:loss-soft={dayPct.startsWith('-')} class="sub">
                {dayPct}
            </div>
        </div>
    </section>

    <section class="card">
        <div class="section-header">
            <div>
                <div class="title">Статус и сигнал</div>
                <div class="sub">Краткое состояние бота прямо на главном экране</div>
            </div>

            <div class="header-actions">
        <span class:success-badge={!$tradeStore.error} class:danger-badge={$tradeStore.error != null} class="badge">
          {$tradeStore.error ? 'Ошибка' : 'Активен'}
        </span>
                <button class="ghost" on:click={refresh} disabled={$tradeStore.loading || $historyStore.loading}>
                    {$tradeStore.loading || $historyStore.loading ? '...' : 'Обновить'}
                </button>
            </div>
        </div>

        <div class="rows">
            <div class="row">
                <span>Последний сигнал</span>
                <span>{lastSignal()}</span>
            </div>
            <div class="row">
                <span>WebSocket</span>
                <span class:profit={!$tradeStore.error} class:loss={$tradeStore.error != null}>
          {$tradeStore.error ? 'Проблема' : 'Подключен'}
        </span>
            </div>
            <div class="row">
                <span>Биржа</span>
                <span>OKX</span>
            </div>
        </div>
    </section>

    <section class="card">
        <div class="title">Статистика за 7 дней</div>
        <div class="sub">Основные показатели стратегии</div>

        <div class="stats-grid">
            <div class="mini-card">
                <div class="label">Винрейт</div>
                <div class="mini-value">{winrate}</div>
            </div>

            <div class="mini-card">
                <div class="label">Средний R</div>
                <div class="mini-value">{avgR}</div>
            </div>

            <div class="mini-card">
                <div class="label">Сделок</div>
                <div class="mini-value">{totalTrades}</div>
            </div>
        </div>
    </section>

    <section class="card">
        <div class="section-header">
            <div>
                <div class="title">P&amp;L за последние сделки</div>
                <div class="sub">Временный мини-график на основе истории</div>
            </div>

            <span class="link">{dayPct}</span>
        </div>

        {#if weeklyBars.length === 0}
            <div class="empty">
                Пока недостаточно данных для графика
            </div>
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
    </section>

    <section class="card">
        <div class="section-header">
            <div>
                <div class="title">Активные сделки</div>
                <div class="sub">Сейчас открыто {positions.length}</div>
            </div>

            <button class="link-btn" on:click={() => goto('/deals')}>
                Все
            </button>
        </div>

        {#if $tradeStore.loading && positions.length === 0}
            <div class="empty">Загружаем позиции...</div>
        {:else if $tradeStore.error}
            <div class="error">{$tradeStore.error}</div>
        {:else if positions.length === 0}
            <div class="empty">Нет открытых позиций</div>
        {:else}
            <div class="list">
                {#each positions.slice(0, 3) as position}
                    <div class="trade-row">
                        <div>
                            <div class="trade-top">
                                <span class="pair">{position.pair}</span>
                                <span class:long={position.side === 'Лонг'} class:short={position.side === 'Шорт'} class="side">
                  {position.side}
                </span>
                            </div>
                            <div class="sub">Вход {position.entry}</div>
                        </div>

                        <div class:profit={position.pnlPct.startsWith('+')} class:loss={position.pnlPct.startsWith('-')} class="pnl">
                            {position.pnlPct}
                        </div>
                    </div>
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

    .grid2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .card,
    .mini-card {
        border-radius: 20px;
        background: #111827;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .card {
        padding: 14px;
    }

    .mini-card {
        padding: 12px;
    }

    .label {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.45);
    }

    .value {
        margin-top: 4px;
        font-size: 20px;
        font-weight: 600;
        color: #fff;
    }

    .mini-value {
        margin-top: 6px;
        font-size: 18px;
        font-weight: 600;
        color: #fff;
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

    .section-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 5px 10px;
        font-size: 11px;
    }

    .success-badge {
        color: #34d399;
        background: rgba(52, 211, 153, 0.1);
        border: 1px solid rgba(52, 211, 153, 0.18);
    }

    .danger-badge {
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.18);
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

    .rows,
    .list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .row,
    .trade-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
    }

    .stats-grid {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
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

    .pnl {
        font-size: 14px;
        font-weight: 600;
    }

    .link {
        color: #60a5fa;
        font-size: 12px;
    }

    .link-btn {
        border: 0;
        background: transparent;
        color: #60a5fa;
        font-size: 12px;
        padding: 0;
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