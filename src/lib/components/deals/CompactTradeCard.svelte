<script lang="ts">
    import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
    import Card from '$lib/components/ui/Card.svelte';
    import type { UiTrade } from '$lib/types/trade';

    export let trade: UiTrade;

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
        if (typeof v !== 'number' || Number.isNaN(v) || v === 0) return '—';

        const sign = v > 0 ? '+' : '';
        return `${sign}${v.toFixed(digits)}%`;
    }

    function formatShortTime(value?: string | null): string {
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

    $: pnlPctText = formatPct(trade.exchangeUplRatio);
    $: pnlText = trade.pnl !== 0 ? formatMoney(trade.pnl) : '—';

    $: isProfit = typeof trade.pnl === 'number' && trade.pnl > 0;
    $: isLoss = typeof trade.pnl === 'number' && trade.pnl < 0;

    $: metaTime = trade.isOpen ? trade.updatedAt : trade.exitAt ?? trade.updatedAt;
</script>

<Card padded={true}>
    <div class="row-top">
        <div class="left">
            <div class="symbol">{trade.symbol}</div>

            <div class="meta">
                <StatusBadge tone={trade.sideTone}>
                    {trade.sideLabel}
                </StatusBadge>

                <span class="tf">{trade.timeframe}</span>
            </div>
        </div>

        <div class="right">
            <div class="pnl-pct" class:profit={isProfit} class:loss={isLoss}>
                {pnlPctText}
            </div>
            <div class="pnl-value">{pnlText}</div>
        </div>
    </div>

    <div class="levels">
        <div class="level">
            <span class="label">Вход</span>
            <span class="value">{formatNum(trade.entryPrice, 4)}</span>
        </div>

        <div class="level">
            <span class="label">SL</span>
            <span class="value">{formatNum(trade.stopLoss, 4)}</span>
        </div>

        <div class="level">
            <span class="label">TP</span>
            <span class="value">{formatNum(trade.takeProfit, 4)}</span>
        </div>
    </div>

    <div class="bottom">
        <span class="updated">
            {trade.isOpen ? 'Обновлено' : 'Закрыта'}: {formatShortTime(metaTime)}
        </span>

        <span class="size">Размер: {formatNum(trade.entrySize, 4)}</span>
    </div>
</Card>

<style>
    .row-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
    }

    .left {
        min-width: 0;
        flex: 1;
    }

    .symbol {
        font-size: 15px;
        font-weight: 700;
        line-height: 1.2;
        color: var(--text-main, #e5e7eb);
        word-break: break-word;
    }

    .meta {
        margin-top: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
    }

    .tf {
        padding: 3px 7px;
        border-radius: 999px;
        font-size: 10px;
        color: var(--text-muted, #94a3b8);
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        line-height: 1;
    }

    .right {
        text-align: right;
        flex-shrink: 0;
    }

    .pnl-pct {
        font-size: 15px;
        font-weight: 700;
        line-height: 1.1;
        color: var(--text-main, #e5e7eb);
    }

    .pnl-value {
        margin-top: 2px;
        font-size: 11px;
        color: var(--text-muted, #94a3b8);
    }

    .profit {
        color: var(--success, #34d399);
    }

    .loss {
        color: var(--danger, #fb7185);
    }

    .levels {
        margin-top: 10px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }

    .level {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    }

    .label {
        font-size: 10px;
        color: var(--text-muted, #6b7280);
    }

    .value {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-main, #e5e7eb);
        line-height: 1.2;
    }

    .bottom {
        margin-top: 10px;
        display: flex;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
    }

    .updated,
    .size {
        font-size: 11px;
        color: var(--text-muted, #94a3b8);
    }
</style>