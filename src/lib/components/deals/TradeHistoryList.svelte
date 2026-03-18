<script lang="ts">
    import { onMount } from 'svelte';
    import { historyStore } from '$lib/stores/history';
    import { startVisibilityPoller } from '$lib/utils/visibilityPoller';
    import { hapticLight, hapticSelection } from '$lib/telegram/haptics';

    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
    import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
    import TradeStatsBlock from './TradeStatsBlock.svelte';
    import type { UiTrade } from '$lib/types/trade';

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

    function formatNum(v?: number | null, digits = 4): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';

        return v.toLocaleString('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: digits
        });
    }

    function formatMoney(v?: number | null, digits = 2): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';

        return `${v.toLocaleString('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: digits
        })} USDT`;
    }

    function formatPct(v?: number | null, digits = 2): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        const sign = v > 0 ? '+' : '';
        return `${sign}${v.toFixed(digits)}%`;
    }

    function formatDateTime(value?: string | null): string {
        if (!value) return '—';

        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '—';

        return d.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function tradeSideTone(trade: UiTrade): 'success' | 'danger' {
        return trade.sideTone;
    }

    function selectTrade(index: number) {
        selectedTradeIndex = index;
        hapticSelection();
    }

    function isProfit(value?: number | null): boolean {
        return typeof value === 'number' && value > 0;
    }

    function isLoss(value?: number | null): boolean {
        return typeof value === 'number' && value < 0;
    }

    function resultTone(value?: number | null): 'success' | 'danger' | 'default' {
        if (isProfit(value)) return 'success';
        if (isLoss(value)) return 'danger';
        return 'default';
    }

    $: allTrades = $historyStore.trades ?? [];
    $: trades = allTrades.filter((t) => t.isClosed);
    $: stats = $historyStore.stats;

    $: safeIndex = Math.min(selectedTradeIndex, Math.max(trades.length - 1, 0));
    $: selectedTrade = trades[safeIndex] ?? null;
</script>

<div class="stack">
    <Card variant="muted">
        <div class="info-head">
            <div class="icon">🕘</div>
            <div>
                <div class="title">История сделок</div>
                <div class="sub">Закрытые сделки, результат и причина выхода</div>
            </div>
        </div>
    </Card>

    <TradeStatsBlock {stats} />

    <Card>
        <SectionHeader
                title="Последние сделки"
                subtitle={$historyStore.loading ? 'Загрузка...' : `Загружено ${trades.length} закрытых сделок`}
        >
            <svelte:fragment slot="actions">
                <Button variant="ghost" on:click={refresh} disabled={$historyStore.loading}>
                    {$historyStore.loading ? '...' : 'Обновить'}
                </Button>
            </svelte:fragment>
        </SectionHeader>

        {#if $historyStore.error}
            <div class="inner-card">
                <Card variant="error">
                    <div class="error-text">{$historyStore.error}</div>
                </Card>
            </div>
        {:else if $historyStore.loading && trades.length === 0}
            <div class="inner-card">
                <Card>
                    <div class="empty">Загружаем историю...</div>
                </Card>
            </div>
        {:else if trades.length === 0}
            <div class="inner-card">
                <Card>
                    <div class="empty">История сделок пуста</div>
                </Card>
            </div>
        {:else}
            <div class="history-list">
                {#each trades as item, index (item.id)}
                    <button
                            type="button"
                            class:selected={safeIndex === index}
                            class="history-row"
                            on:click={() => selectTrade(index)}
                    >
                        <div class="left">
                            <div class="top-row">
                                <span class="pair">{item.symbol}</span>

                                <StatusBadge tone={tradeSideTone(item)}>
                                    {item.sideLabel}
                                </StatusBadge>

                                <span class="tf-tag">{item.timeframe}</span>
                            </div>

                            <div class="sub-text">{formatDateTime(item.exitAt ?? item.updatedAt ?? item.entryAt)}</div>
                            <div class="status">{item.closeReason || item.status}</div>
                        </div>

                        <div class="right">
                            <div
                                    class="result"
                                    class:profit={isProfit(item.pnlPct)}
                                    class:loss={isLoss(item.pnlPct)}
                            >
                                {formatPct(item.pnlPct)}
                            </div>

                            <div class="sub-text">
                                {item.rMultiple != null
                                    ? `${item.rMultiple > 0 ? '+' : ''}${item.rMultiple.toFixed(2)}R`
                                    : formatMoney(item.pnl)}
                            </div>
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </Card>

    {#if selectedTrade}
        <Card>
            <SectionHeader
                    title="Детали сделки"
                    subtitle={`${selectedTrade.symbol} · ${formatDateTime(selectedTrade.exitAt ?? selectedTrade.updatedAt ?? selectedTrade.entryAt)}`}
            >
                <svelte:fragment slot="actions">
                    <StatusBadge tone={tradeSideTone(selectedTrade)}>
                        {selectedTrade.sideLabel}
                    </StatusBadge>
                </svelte:fragment>
            </SectionHeader>

            <div class="details-result">
                <div
                        class="result big"
                        class:profit={isProfit(selectedTrade.pnlPct)}
                        class:loss={isLoss(selectedTrade.pnlPct)}
                >
                    {formatPct(selectedTrade.pnlPct)}
                </div>

                <div class="sub-text">
                    {formatMoney(selectedTrade.pnl)} ·
                    {selectedTrade.rMultiple != null
                        ? ` ${selectedTrade.rMultiple > 0 ? '+' : ''}${selectedTrade.rMultiple.toFixed(2)}R`
                        : ' —'}
                </div>
            </div>

            <div class="grid2">
                <div class="mini-card">
                    <Card padded={true}>
                        <div class="mini-label">Вход</div>
                        <div class="mini-value">{formatNum(selectedTrade.entryPrice, 4)}</div>
                    </Card>
                </div>

                <div class="mini-card">
                    <Card padded={true}>
                        <div class="mini-label">Выход</div>
                        <div class="mini-value">{formatNum(selectedTrade.exitPrice, 4)}</div>
                    </Card>
                </div>

                <div class="mini-card">
                    <Card padded={true}>
                        <div class="mini-label">Размер</div>
                        <div class="mini-value">{formatNum(selectedTrade.entrySize, 4)}</div>
                    </Card>
                </div>

                <div class="mini-card">
                    <Card padded={true}>
                        <div class="mini-label">Статус</div>
                        <div class="mini-value">{selectedTrade.status}</div>
                    </Card>
                </div>

                <div class="mini-card">
                    <Card padded={true}>
                        <div class="mini-label">SL</div>
                        <div class="mini-value">{formatNum(selectedTrade.stopLoss, 4)}</div>
                    </Card>
                </div>

                <div class="mini-card">
                    <Card padded={true}>
                        <div class="mini-label">TP</div>
                        <div class="mini-value">{formatNum(selectedTrade.takeProfit, 4)}</div>
                    </Card>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-head">
                    <span>Сводка сделки</span>
                    <span>{selectedTrade.closeReason || selectedTrade.status}</span>
                </div>

                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Вход</span>
                        <span class="summary-value">{formatDateTime(selectedTrade.entryAt)}</span>
                    </div>

                    <div class="summary-item">
                        <span class="summary-label">Выход</span>
                        <span class="summary-value">{formatDateTime(selectedTrade.exitAt)}</span>
                    </div>

                    <div class="summary-item">
                        <span class="summary-label">PnL</span>
                        <span
                                class="summary-value"
                                class:profit={isProfit(selectedTrade.pnl)}
                                class:loss={isLoss(selectedTrade.pnl)}
                        >
                {formatMoney(selectedTrade.pnl)}
            </span>
                    </div>

                    <div class="summary-item">
                        <span class="summary-label">R-множитель</span>
                        <span class="summary-value">
                {selectedTrade.rMultiple != null
                    ? `${selectedTrade.rMultiple > 0 ? '+' : ''}${selectedTrade.rMultiple.toFixed(2)}R`
                    : '—'}
            </span>
                    </div>
                </div>
            </div>

            <div class="inner-card mini-block">
                <Card>
                    <div class="mini-label">Причина выхода</div>
                    <div class="reason-text">{selectedTrade.closeReason || '—'}</div>
                </Card>
            </div>

            <div class="inner-card mini-block">
                <Card>
                    <div class="mini-label">Флаги сопровождения</div>

                    <div class="partials-list">
                        {#if selectedTrade.movedToBE}
                            <div class="partial-item">Перевод в безубыток</div>
                        {/if}

                        {#if selectedTrade.lockedProfit}
                            <div class="partial-item">Фиксация прибыли</div>
                        {/if}

                        {#if selectedTrade.tookPartial}
                            <div class="partial-item">
                                Частичные закрытия{selectedTrade.partialCount > 0 ? `: ${selectedTrade.partialCount}` : ''}
                            </div>
                        {/if}

                        {#if selectedTrade.timeStopTriggered}
                            <div class="partial-item">Сработал time stop</div>
                        {/if}

                        {#if !selectedTrade.movedToBE && !selectedTrade.lockedProfit && !selectedTrade.tookPartial && !selectedTrade.timeStopTriggered}
                            <div class="partial-empty">Дополнительных событий сопровождения не было</div>
                        {/if}
                    </div>
                </Card>
            </div>
        </Card>
    {/if}
</div>

<style>
    .summary-card {
        margin-top: 12px;
        border-radius: 14px;
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        background: var(--bg-card, #0b1220);
        padding: 12px;
    }

    .summary-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-faint, rgba(255, 255, 255, 0.4));
    }

    .summary-grid {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .summary-item {
        border-radius: 12px;
        background: rgba(255,255,255,0.03);
        border: 1px solid var(--border, rgba(255,255,255,0.08));
        padding: 10px 12px;
    }

    .summary-label {
        display: block;
        font-size: 11px;
        color: var(--text-muted, #6b7280);
    }

    .summary-value {
        display: block;
        margin-top: 4px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main, #fff);
    }
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

    .left {
        min-width: 0;
        flex: 1;
    }

    .sub-text {
        margin-top: 2px;
        font-size: 12px;
        color: var(--text-muted, #6b7280);
    }

    .status {
        margin-top: 4px;
        font-size: 11px;
        color: var(--text-soft, rgba(255, 255, 255, 0.55));
    }

    .history-list,
    .partials-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
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
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
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
        color: var(--text-main, #fff);
    }

    .tf-tag {
        padding: 3px 7px;
        border-radius: 999px;
        font-size: 10px;
        color: var(--text-muted, #94a3b8);
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        line-height: 1;
    }

    .right,
    .details-result {
        text-align: right;
        flex-shrink: 0;
    }

    .result {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-main, #e5e7eb);
    }

    .result.big {
        font-size: 18px;
    }

    .profit {
        color: var(--success, #34d399);
    }

    .loss {
        color: var(--danger, #fb7185);
    }

    .grid2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-top: 12px;
    }

    .mini-card {
        background: transparent;
    }

    .mini-label {
        font-size: 11px;
        color: var(--text-muted, #6b7280);
    }

    .mini-value {
        margin-top: 4px;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-main, #fff);
    }

    .scheme-card {
        margin-top: 12px;
        border-radius: 14px;
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        background: var(--bg-card, #0b1220);
        padding: 12px;
    }

    .scheme-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-faint, rgba(255, 255, 255, 0.4));
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
        background: #94a3b8;
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
        color: var(--text-muted, rgba(255, 255, 255, 0.45));
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

    .inner-card {
        margin-top: 12px;
    }

    .mini-block {
        background: transparent;
    }

    .reason-text {
        margin-top: 6px;
        font-size: 13px;
        line-height: 1.45;
        color: var(--text-soft, rgba(255, 255, 255, 0.86));
    }

    .partial-item,
    .partial-empty {
        border-radius: 12px;
        padding: 10px 12px;
        background: var(--bg-card, #0b1220);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        font-size: 13px;
    }

    .partial-item {
        color: var(--text-soft, rgba(255, 255, 255, 0.82));
    }

    .partial-empty {
        color: var(--text-muted, rgba(255, 255, 255, 0.5));
    }

    .empty {
        font-size: 13px;
        color: var(--text-muted, rgba(255, 255, 255, 0.55));
    }

    .error-text {
        font-size: 13px;
        color: #fca5a5;
    }
</style>