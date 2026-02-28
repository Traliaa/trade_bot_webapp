<script lang="ts">
    export type Side = "BUY" | "SELL";

    export type TradeCardVM = {
        symbol: string;
        side: Side;
        pnlPct?: number;   // +1.24 = 1.24%
        pnlAbs?: number;   // в валюте, если есть
        entry?: number;
        mark?: number;
        size?: number;
        lev?: number;
        updatedAt?: string; // ISO
        status?: "OPEN" | "PENDING" | "CLOSED";
    };

    export let item: TradeCardVM;

    const fmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 });
    const fmt2 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

    function sign(n?: number) {
        if (n == null) return "";
        return n > 0 ? "+" : n < 0 ? "−" : "";
    }

    function pct(n?: number) {
        if (n == null) return "—";
        const s = sign(n);
        return `${s}${fmt2.format(Math.abs(n))}%`;
    }

    function num(n?: number) {
        if (n == null) return "—";
        return fmt.format(n);
    }

    $: isBuy = item.side === "BUY";
    $: pnlIsPos = (item.pnlPct ?? 0) >= 0;
</script>

<article class="card">
    <div class="row">
        <div class="left">
            <div class="symbol">{item.symbol}</div>

            <div class="badges">
        <span class="badge side" class:buy={isBuy} class:sell={!isBuy}>
          {item.side}
        </span>

                {#if item.status}
                    <span class="badge status">{item.status}</span>
                {/if}
            </div>
        </div>

        <div class="right">
            <div class="pnl" class:pos={pnlIsPos} class:neg={!pnlIsPos}>
                {pct(item.pnlPct)}
            </div>
            {#if item.pnlAbs != null}
                <div class="pnlSub" style="color: var(--tg-hint);">
                    {sign(item.pnlAbs)}{fmt2.format(Math.abs(item.pnlAbs))}
                </div>
            {/if}
        </div>
    </div>

    <div class="meta">
        <div class="metaItem"><span class="k">Entry</span><span class="v">{num(item.entry)}</span></div>
        <div class="metaItem"><span class="k">Mark</span><span class="v">{num(item.mark)}</span></div>
        <div class="metaItem"><span class="k">Size</span><span class="v">{num(item.size)}</span></div>
        {#if item.lev != null}
            <div class="metaItem"><span class="k">Lev</span><span class="v">{item.lev}x</span></div>
        {/if}
    </div>

    <div class="actions">
        <button class="btn ghost" type="button">Details</button>
        <button class="btn" type="button">Partial</button>
    </div>
</article>

<style>
    .card {
        background: var(--tg-bg);
        border-radius: 18px;
        padding: 14px;
        border: 1px solid var(--tg-hint);
    }

    .row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
    }

    .symbol {
        font-weight: 800;
        font-size: 14px;
        color: var(--tg-text);
    }

    .badges {
        display: flex;
        gap: 6px;
        margin-top: 6px;
        flex-wrap: wrap;
    }

    .badge {
        font-size: 11px;
        line-height: 1;
        padding: 6px 8px;
        border-radius: 999px;
        background: var(--tg-secondary-bg);
        color: var(--tg-hint);
        border: 1px solid var(--tg-hint);
    }

    /* BUY/SELL: только через Telegram button_color (под твоё требование) */
    .badge.side.buy {
        background: var(--tg-button);
        color: var(--tg-button-text);
        border-color: var(--tg-button);
    }

    .badge.side.sell {
        background: var(--tg-button);
        color: var(--tg-button-text);
        border-color: var(--tg-button);
        opacity: .85; /* чуть отличаем SELL без “красного” */
    }

    .right {
        text-align: right;
        min-width: 92px;
    }

    .pnl {
        font-weight: 900;
        font-size: 22px;
        letter-spacing: -0.2px;
    }

    /* PnL тоже только телеграм-цветами: pos = button, neg = hint */
    .pnl.pos { color: var(--tg-button); }
    .pnl.neg { color: var(--tg-hint); }

    .pnlSub {
        margin-top: 4px;
        font-size: 12px;
    }

    .meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px 12px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--tg-hint);
    }

    .metaItem {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        font-size: 12px;
    }

    .k { color: var(--tg-hint); }
    .v { color: var(--tg-text); font-weight: 600; }

    .actions {
        display: flex;
        gap: 10px;
        margin-top: 12px;
    }

    .btn {
        flex: 1;
        padding: 10px 12px;
        border-radius: 14px;
        font-size: 13px;
        font-weight: 700;
        background: var(--tg-button);
        color: var(--tg-button-text);
        border: 1px solid var(--tg-button);
    }

    .btn.ghost {
        background: transparent;
        color: var(--tg-text);
        border-color: var(--tg-hint);
    }
</style>