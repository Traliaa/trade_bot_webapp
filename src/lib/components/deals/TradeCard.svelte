<script lang="ts">
    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
    import type { UiTrade } from '$lib/types/trade';

    export let trade: UiTrade;
    export let compact = false;
    export let mode: 'open' | 'history' | 'auto' = 'auto';

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

    function displayStatusTime(): string {
        if (trade.isOpen) {
            return `Обновлено: ${formatDateTime(trade.updatedAt)}`;
        }

        return `Закрыта: ${formatDateTime(trade.exitAt)}`;
    }

    function currentMode(): 'open' | 'history' {
        if (mode !== 'auto') return mode;
        return trade.isOpen ? 'open' : 'history';
    }

    $: resolvedMode = currentMode();
    $: sideTone = trade.sideTone;

    $: hasRealPct = typeof trade.pnlPct === 'number' && !Number.isNaN(trade.pnlPct) && trade.pnlPct !== 0;
    $: hasRealPnl = typeof trade.pnl === 'number' && !Number.isNaN(trade.pnl) && trade.pnl !== 0;

    $: pnlPctText = hasRealPct ? formatPct(trade.pnlPct) : '—';
    $: pnlValueText = hasRealPnl ? formatMoney(trade.pnl) : '—';

    $: isProfit = hasRealPnl && trade.pnl > 0;
    $: isLoss = hasRealPnl && trade.pnl < 0;

    $: entryText = formatNum(trade.entryPrice, 4);
    $: exitText = trade.exitPrice != null ? formatNum(trade.exitPrice, 4) : '—';
    $: slText = formatNum(trade.stopLoss, 4);
    $: tpText = formatNum(trade.takeProfit, 4);
    $: sizeText = formatNum(trade.entrySize, 4);
</script>

<Card>
    <div class="top">
        <div class="left">
            <div class="pair">{trade.symbol}</div>

            <div class="meta-inline">
                <StatusBadge tone={sideTone}>
                    {trade.sideLabel}
                </StatusBadge>

                <span class="tag">{trade.timeframe}</span>

                {#if trade.strategy}
                    <span class="tag strategy">{trade.strategy}</span>
                {/if}
            </div>

            <div class="opened">
                {displayStatusTime()}
            </div>
        </div>

        <div class="pnl-block">
            <div class="pnl-pct" class:profit={isProfit} class:loss={isLoss}>
                {pnlPctText}
            </div>
            <div class="pnl-value">{pnlValueText}</div>
        </div>
    </div>

    <div class="grid compact-grid">
        <div class="mini-box">
            <div class="mini-label">Вход</div>
            <div class="mini-value">{entryText}</div>
        </div>

        <div class="mini-box">
            <div class="mini-label">Выход</div>
            <div class="mini-value">{exitText}</div>
        </div>

        <div class="mini-box">
            <div class="mini-label">SL</div>
            <div class="mini-value">{slText}</div>
        </div>

        <div class="mini-box">
            <div class="mini-label">TP</div>
            <div class="mini-value">{tpText}</div>
        </div>
    </div>

    <div class="footer-row">
        <span class="footer-label">Размер позиции</span>
        <span class="footer-value">{sizeText}</span>
    </div>

    {#if !compact && trade.isOpen}
        <div class="flags">
            {#if trade.movedToBE}
                <span class="flag">BE</span>
            {/if}

            {#if trade.lockedProfit}
                <span class="flag">Lock</span>
            {/if}

            {#if trade.tookPartial}
                <span class="flag">Partial {trade.partialCount > 0 ? trade.partialCount : ''}</span>
            {/if}

            {#if trade.timeStopTriggered}
                <span class="flag danger">Time stop</span>
            {/if}
        </div>
    {/if}

    {#if resolvedMode === 'open'}
        <div class="actions">
            <Button variant="secondary" disabled>Частично</Button>
            <Button variant="primary" disabled>Закрыть</Button>
        </div>
    {/if}
</Card>

<style>
    .top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
    }

    .left {
        min-width: 0;
        flex: 1;
    }

    .pair {
        font-size: 15px;
        font-weight: 700;
        color: var(--text-main, #e5e7eb);
        line-height: 1.2;
    }

    .meta-inline {
        margin-top: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
    }

    .tag {
        padding: 3px 7px;
        border-radius: 999px;
        font-size: 10px;
        color: var(--text-muted, #94a3b8);
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        line-height: 1;
    }

    .strategy {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .opened {
        margin-top: 7px;
        font-size: 11px;
        color: var(--text-muted, #6b7280);
    }

    .pnl-block {
        text-align: right;
        flex-shrink: 0;
    }

    .pnl-pct {
        font-size: 16px;
        font-weight: 700;
        white-space: nowrap;
        color: var(--text-main, #e5e7eb);
        line-height: 1.1;
    }

    .pnl-value {
        margin-top: 2px;
        font-size: 12px;
        color: var(--text-muted, #6b7280);
    }

    .profit {
        color: var(--success, #34d399);
    }

    .loss {
        color: var(--danger, #fb7185);
    }

    .compact-grid {
        margin-top: 10px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .mini-box {
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.04);
        padding: 8px 10px;
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        min-height: 56px;
    }

    .mini-label {
        font-size: 10px;
        color: var(--text-muted, #6b7280);
        line-height: 1.1;
    }

    .mini-value {
        margin-top: 4px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main, #e5e7eb);
        line-height: 1.2;
    }

    .footer-row {
        margin-top: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        padding: 9px 12px;
    }

    .footer-label {
        font-size: 12px;
        color: var(--text-muted, #6b7280);
    }

    .footer-value {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main, #e5e7eb);
    }

    .flags {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .flag {
        padding: 5px 8px;
        border-radius: 999px;
        font-size: 11px;
        color: var(--text-main, #e5e7eb);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    }

    .flag.danger {
        color: var(--danger, #fb7185);
        border-color: rgba(251, 113, 133, 0.22);
        background: rgba(251, 113, 133, 0.08);
    }

    .actions {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }
</style>