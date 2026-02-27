<script lang="ts">
    // потом заменим на данные с API
    export let deals: Array<{
        symbol: string;
        side: "BUY" | "SELL";
        entry: number;
        pnlPct: number; // +/-
        size: number;
        updatedAt: string;
    }> = [];
</script>

{#if deals.length === 0}
    <div class="rounded-2xl p-4" style="background: rgba(0,0,0,0.04); color: var(--tg-hint);">
        Активных сделок нет
    </div>
{:else}
    <div class="space-y-3">
        {#each deals as d}
            <div class="rounded-2xl border p-4" style="border-color: rgba(0,0,0,0.10);">
                <div class="flex items-center justify-between">
                    <div class="font-semibold">{d.symbol}</div>
                    <div
                            class="text-xs font-semibold px-2 py-1 rounded-full"
                            style="background: rgba(0,0,0,0.06); color: var(--tg-text);"
                    >
                        {d.side}
                    </div>
                </div>

                <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div style="color: var(--tg-hint);">Entry</div>
                    <div class="text-right">{d.entry}</div>

                    <div style="color: var(--tg-hint);">Size</div>
                    <div class="text-right">{d.size}</div>

                    <div style="color: var(--tg-hint);">PnL</div>
                    <div class="text-right font-semibold" style="color: {d.pnlPct >= 0 ? '#16a34a' : '#ef4444'};">
                        {d.pnlPct.toFixed(2)}%
                    </div>
                </div>

                <div class="mt-2 text-xs" style="color: var(--tg-hint);">
                    Обновлено: {d.updatedAt}
                </div>
            </div>
        {/each}
    </div>
{/if}