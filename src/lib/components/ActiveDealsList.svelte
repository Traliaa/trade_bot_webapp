<script lang="ts">
    export let deals: Array<{
        symbol: string;
        side: "BUY" | "SELL";
        entry: number;
        pnlPct: number;
        size: number;
        updatedAt: string;
    }> = [];

    const fmt = new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 6
    });

    function pct(n: number) {
        const sign = n > 0 ? "+" : n < 0 ? "−" : "";
        return `${sign}${Math.abs(n).toFixed(2)}%`;
    }
</script>

{#if deals.length === 0}
    <div class="empty">
        Активных сделок нет
    </div>
{:else}
    <div class="list">
        {#each deals as d}
            <article class="card">
                <div class="row">
                    <div>
                        <div class="symbol">{d.symbol}</div>
                        <span class="badge">
              {d.side}
            </span>
                    </div>

                    <div
                            class="pnl"
                            class:pos={d.pnlPct >= 0}
                            class:neg={d.pnlPct < 0}
                    >
                        {pct(d.pnlPct)}
                    </div>
                </div>

                <div class="meta">
                    <div class="metaItem">
                        <span class="k">Entry</span>
                        <span class="v">{fmt.format(d.entry)}</span>
                    </div>

                    <div class="metaItem">
                        <span class="k">Size</span>
                        <span class="v">{fmt.format(d.size)}</span>
                    </div>
                </div>

                <div class="updated">
                    Обновлено: {d.updatedAt}
                </div>
            </article>
        {/each}
    </div>
{/if}

<style>
    .list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .empty {
        background: var(--tg-bg);
        border-radius: 18px;
        padding: 14px;
        color: var(--tg-hint);
        border: 1px solid var(--tg-hint);
    }

    .card {
        background: var(--tg-bg);
        border-radius: 18px;
        padding: 14px;
        border: 1px solid var(--tg-hint);
    }

    .row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
    }

    .symbol {
        font-weight: 800;
        font-size: 14px;
        color: var(--tg-text);
    }

    .badge {
        display: inline-block;
        margin-top: 6px;
        font-size: 11px;
        padding: 6px 8px;
        border-radius: 999px;

        background: var(--tg-secondary-bg);
        color: var(--tg-hint);
        border: 1px solid var(--tg-hint);
    }

    .pnl {
        font-weight: 900;
        font-size: 22px;
        letter-spacing: -0.3px;
    }

    /* строго Telegram цвета */
    .pnl.pos {
        color: var(--tg-button);
    }

    .pnl.neg {
        color: var(--tg-hint);
    }

    .meta {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px 12px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--tg-hint);
    }

    .metaItem {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
    }

    .k {
        color: var(--tg-hint);
    }

    .v {
        color: var(--tg-text);
        font-weight: 600;
    }

    .updated {
        margin-top: 10px;
        font-size: 11px;
        color: var(--tg-hint);
    }
</style>