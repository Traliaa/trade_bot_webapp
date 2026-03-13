<script lang="ts">
    import { onMount } from 'svelte';
    import { historyStore } from '$lib/stores/history';
    import type { TradeRecord } from '$lib/api/tradeApi';
    import { startVisibilityPoller } from '$lib/utils/visibilityPoller';
    import { hapticLight } from '$lib/telegram/haptics';

    let selectedTradeIndex = 0;


    onMount(() => {
        historyStore.loadAll(20);

        const poller = startVisibilityPoller(
            () => historyStore.loadAll(20),
            15000
        );

        return () => {
            poller.stop();
        };
    });

    async function refresh() {
        hapticLight();
        await historyStore.loadAll(20);
    }

    function isLong(side?: string): boolean {
        const s = (side ?? '').toLowerCase();
        return !(s.includes('short') || s.includes('sell') || s.includes('шорт'));
    }

    function isProfit(value?: number): boolean {
        return (value ?? 0) >= 0;
    }

    function formatPrice(v?: number): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        return v.toLocaleString('ru-RU', { maximumFractionDigits: 6 });
    }

    function formatPct(v?: number): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        const sign = v > 0 ? '+' : '';
        return `${sign}${v.toFixed(2)}%`;
    }

    function formatRR(v?: number): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        return `${v.toFixed(2)}R`;
    }

    function formatDate(v?: string): string {
        if (!v) return '—';
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return v;

        return d.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function tradePair(trade: TradeRecord): string {
        return trade.symbol ?? '—';
    }

    function tradeSide(trade: TradeRecord): 'Лонг' | 'Шорт' {
        return isLong(trade.side) ? 'Лонг' : 'Шорт';
    }

    function tradeStatus(trade: TradeRecord): string {
        return trade.status ?? '—';
    }

    function tradeReason(trade: TradeRecord): string {
        return trade.reason ?? 'Причина не указана';
    }

    $: trades = $historyStore.trades ?? [];
    $: stats = $historyStore.stats;
    $: safeIndex = Math.min(selectedTradeIndex, Math.max(trades.length - 1, 0));
    $: selectedTrade = trades[safeIndex] ?? null;
</script>

<div class="stack">
    <section class="info-card">
        <div class="icon">🕘</div>
        <div>
            <div class="title">История сделок</div>
            <div class="sub">Закрытые сделки, результат и причина выхода</div>
        </div>
    </section>

    {#if stats}
        <section class="card">
            <div class="title">Сводка</div>
            <div class="sub">Краткая статистика по последним сделкам</div>

            <div class="stats-grid">
                <div class="mini-card">
                    <div class="mini-label">Сделок</div>
                    <div class="mini-value">{stats.total_trades ?? '—'}</div>
                </div>

                <div class="mini-card">
                    <div class="mini-label">Винрейт</div>
                    <div class="mini-value">
                        {typeof stats.winrate === 'number' ? `${stats.winrate.toFixed(1)}%` : '—'}
                    </div>
                </div>

                <div class="mini-card">
                    <div class="mini-label">Средний R</div>
                    <div class="mini-value">
                        {typeof stats.avg_rr === 'number' ? `${stats.avg_rr.toFixed(2)}R` : '—'}
                    </div>
                </div>
            </div>
        </section>
    {/if}

    <section class="card">
        <div class="header">
            <div>
                <div class="title">Последние сделки</div>
                <div class="sub">
                    {#if $historyStore.loading}
                        Загрузка...
                    {:else}
                        Загружено {trades.length} сделок
                    {/if}
                </div>
            </div>

            <button class="ghost" type="button" on:click={refresh} disabled={$historyStore.loading}>
                {$historyStore.loading ? '...' : 'Обновить'}
            </button>
        </div>

        {#if $historyStore.error}
            <div class="error">{$historyStore.error}</div>
        {:else if $historyStore.loading && trades.length === 0}
            <div class="empty">Загружаем историю...</div>
        {:else if trades.length === 0}
            <div class="empty">История сделок пуста</div>
        {:else}
            <div class="history-list">
                {#each trades as item, index}
                    <button
                            type="button"
                            class:selected={safeIndex === index}
                            class="history-row"
                            on:click={() => (selectedTradeIndex = index)}
                    >
                        <div>
                            <div class="top-row">
                                <span class="pair">{tradePair(item)}</span>

                                <span
                                        class:long={tradeSide(item) === 'Лонг'}
                                        class:short={tradeSide(item) === 'Шорт'}
                                        class="side"
                                >
                  {tradeSide(item)}
                </span>
                            </div>

                            <div class="sub">{formatDate(item.closed_at ?? item.opened_at)}</div>
                            <div class="status">{tradeStatus(item)}</div>
                        </div>

                        <div class="right">
                            <div
                                    class:profit={isProfit(item.pnl_pct)}
                                    class:loss={!isProfit(item.pnl_pct)}
                                    class="result"
                            >
                                {formatPct(item.pnl_pct)}
                            </div>

                            <div class="sub">{formatRR(item.rr)}</div>
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </section>

    {#if selectedTrade}
        <section class="card">
            <div class="details-header">
                <div>
                    <div class="top-row">
                        <div class="title">Детали сделки</div>

                        <span
                                class:long={tradeSide(selectedTrade) === 'Лонг'}
                                class:short={tradeSide(selectedTrade) === 'Шорт'}
                                class="side"
                        >
              {tradeSide(selectedTrade)}
            </span>
                    </div>

                    <div class="sub">
                        {tradePair(selectedTrade)} · {formatDate(selectedTrade.closed_at ?? selectedTrade.opened_at)}
                    </div>
                </div>

                <div class="details-result">
                    <div
                            class:profit={isProfit(selectedTrade.pnl_pct)}
                            class:loss={!isProfit(selectedTrade.pnl_pct)}
                            class="result"
                    >
                        {formatPct(selectedTrade.pnl_pct)}
                    </div>

                    <div class="sub">{formatRR(selectedTrade.rr)}</div>
                </div>
            </div>

            <div class="grid2">
                <div class="mini-card">
                    <div class="mini-label">Вход</div>
                    <div class="mini-value">{formatPrice(selectedTrade.entry_price)}</div>
                </div>

                <div class="mini-card">
                    <div class="mini-label">Выход</div>
                    <div class="mini-value">{formatPrice(selectedTrade.exit_price)}</div>
                </div>

                <div class="mini-card">
                    <div class="mini-label">Размер</div>
                    <div class="mini-value">{formatPrice(selectedTrade.qty)}</div>
                </div>

                <div class="mini-card">
                    <div class="mini-label">Статус</div>
                    <div class="mini-value">{tradeStatus(selectedTrade)}</div>
                </div>
            </div>

            <div class="scheme-card">
                <div class="scheme-head">
                    <span>Схема сделки</span>
                    <span>{tradeStatus(selectedTrade)}</span>
                </div>

                <div class="scheme-line">
                    <div class="line"></div>
                    <div class="dot entry"></div>
                    <div class="dot middle"></div>
                    <div
                            class:profit-dot={isProfit(selectedTrade.pnl_pct)}
                            class:loss-dot={!isProfit(selectedTrade.pnl_pct)}
                            class="dot exit"
                    ></div>

                    <span class="label-entry">Вход</span>
                    <span class="label-middle">Сопровождение</span>
                    <span class="label-exit">Выход</span>
                </div>
            </div>

            <div class="reason-card">
                <div class="mini-label">Причина выхода</div>
                <div class="reason-text">{tradeReason(selectedTrade)}</div>
            </div>

            <div class="partials-card">
                <div class="mini-label">Частичные фиксации</div>

                <div class="partials-list">
                    {#if Array.isArray(selectedTrade.partials) && selectedTrade.partials.length > 0}
                        {#each selectedTrade.partials as partial}
                            <div class="partial-item">{partial}</div>
                        {/each}
                    {:else}
                        <div class="partial-empty">Частичных закрытий не было</div>
                    {/if}
                </div>
            </div>
        </section>
    {/if}
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

    .status {
        margin-top: 4px;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.55);
    }

    .header,
    .details-header {
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

    .history-list,
    .partials-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .history-row {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        text-align: left;
    }

    .history-row.selected {
        background: rgba(29, 78, 216, 0.14);
        border-color: rgba(59, 130, 246, 0.35);
    }

    .top-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
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

    .right,
    .details-result {
        text-align: right;
    }

    .result {
        font-size: 14px;
        font-weight: 700;
    }

    .profit {
        color: #34d399;
    }

    .loss {
        color: #fb7185;
    }

    .stats-grid,
    .grid2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
        margin-top: 12px;
    }

    .mini-card,
    .reason-card,
    .partials-card {
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
        padding: 12px;
        margin-top: 12px;
    }

    .mini-label {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.45);
    }

    .mini-value {
        margin-top: 4px;
        font-size: 14px;
        font-weight: 600;
        color: #fff;
    }

    .scheme-card {
        margin-top: 12px;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: #0b1220;
        padding: 12px;
    }

    .scheme-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(255, 255, 255, 0.4);
    }

    .scheme-line {
        position: relative;
        height: 56px;
        margin-top: 10px;
    }

    .line {
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 2px;
        transform: translateY(-50%);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
    }

    .dot {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        border-radius: 999px;
    }

    .dot.entry {
        left: 10%;
        width: 12px;
        height: 12px;
        background: #60a5fa;
    }

    .dot.middle {
        left: 48%;
        width: 14px;
        height: 14px;
        border: 2px solid white;
        background: #111827;
    }

    .dot.exit {
        right: 10%;
        width: 12px;
        height: 12px;
    }

    .dot.exit.profit-dot {
        background: #34d399;
    }

    .dot.exit.loss-dot {
        background: #fb7185;
    }

    .label-entry,
    .label-middle,
    .label-exit {
        position: absolute;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.45);
    }

    .label-entry {
        left: 8%;
        top: 2px;
    }

    .label-middle {
        left: 38%;
        bottom: 2px;
    }

    .label-exit {
        right: 6%;
        top: 2px;
    }

    .reason-text {
        margin-top: 6px;
        font-size: 13px;
        line-height: 1.45;
        color: rgba(255, 255, 255, 0.86);
    }

    .partial-item,
    .partial-empty {
        border-radius: 12px;
        padding: 10px 12px;
        background: #0b1220;
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 13px;
    }

    .partial-item {
        color: rgba(255, 255, 255, 0.82);
    }

    .partial-empty {
        color: rgba(255, 255, 255, 0.5);
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