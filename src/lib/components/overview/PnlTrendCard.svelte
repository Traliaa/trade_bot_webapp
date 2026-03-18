<script lang="ts">
    import Card from '$lib/components/ui/Card.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
    import type { UiTrade } from '$lib/types/trade';

    export let trades: UiTrade[] = [];
    export let title = 'P&L по последним сделкам';
    export let subtitle = 'Динамика последних закрытых сделок';

    type PnlPoint = {
        x: number;
        y: number;
        value: number;
    };

    function formatNum(v?: number | null, digits = 2): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';

        return v.toLocaleString('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: digits
        });
    }

    function formatPnl(v?: number | null): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        const sign = v > 0 ? '+' : '';
        return `${sign}${formatNum(v, 2)}`;
    }

    function buildSparklinePath(points: PnlPoint[], width: number, height: number) {
        if (points.length === 0) {
            return { line: '', area: '' };
        }

        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.y);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const dx = maxX - minX || 1;
        const dy = maxY - minY || 1;

        const padX = 6;
        const padY = 8;
        const innerW = width - padX * 2;
        const innerH = height - padY * 2;

        const scaled = points.map((p) => {
            const sx = padX + ((p.x - minX) / dx) * innerW;
            const sy = padY + innerH - ((p.y - minY) / dy) * innerH;
            return { ...p, sx, sy };
        });

        const line = scaled
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.sx.toFixed(2)} ${p.sy.toFixed(2)}`)
            .join(' ');

        const first = scaled[0];
        const last = scaled[scaled.length - 1];

        const area = [
            `M ${first.sx.toFixed(2)} ${height - padY}`,
            ...scaled.map((p) => `L ${p.sx.toFixed(2)} ${p.sy.toFixed(2)}`),
            `L ${last.sx.toFixed(2)} ${height - padY}`,
            'Z'
        ].join(' ');

        return { line, area };
    }

    $: closedTrades = (trades ?? []).filter((t) => t.isClosed).slice(0, 20).reverse();

    $: cumulativeSeries = (() => {
        let acc = 0;
        return closedTrades.map((trade, index) => {
            acc += typeof trade.pnl === 'number' ? trade.pnl : 0;
            return {
                x: index,
                y: acc,
                value: trade.pnl ?? 0
            };
        });
    })();

    $: chartWidth = 320;
    $: chartHeight = 140;
    $: spark = buildSparklinePath(cumulativeSeries, chartWidth, chartHeight);

    $: trendTotal =
        cumulativeSeries.length > 0
            ? cumulativeSeries[cumulativeSeries.length - 1].y
            : 0;

    $: trendText = formatPnl(trendTotal);
    $: trendPositive = trendTotal >= 0;
</script>

<Card>
    <SectionHeader {title} {subtitle}>
        <svelte:fragment slot="actions">
            <span
                    class="trend-value"
                    class:profit={trendTotal > 0}
                    class:loss={trendTotal < 0}
            >
                {trendText}
            </span>
        </svelte:fragment>
    </SectionHeader>

    {#if cumulativeSeries.length < 2}
        <Card className="inner-card">
            <div class="empty">Пока недостаточно данных</div>
        </Card>
    {:else}
        <div class="trend-card" class:trend-positive={trendPositive} class:trend-negative={!trendPositive}>
            <svg
                    class="trend-chart"
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    preserveAspectRatio="none"
                    aria-label="График PnL"
            >
                <defs>
                    <linearGradient id="trendFillGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="rgba(52, 211, 153, 0.30)" />
                        <stop offset="100%" stop-color="rgba(52, 211, 153, 0.04)" />
                    </linearGradient>

                    <linearGradient id="trendFillRed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="rgba(251, 113, 133, 0.30)" />
                        <stop offset="100%" stop-color="rgba(251, 113, 133, 0.04)" />
                    </linearGradient>
                </defs>

                <path
                        d={spark.area}
                        fill={trendPositive ? 'url(#trendFillGreen)' : 'url(#trendFillRed)'}
                />

                <path
                        d={spark.line}
                        class="trend-line"
                        class:trend-line-positive={trendPositive}
                        class:trend-line-negative={!trendPositive}
                />
            </svg>

            <div class="trend-footer">
                <span>Старт</span>
                <span>{closedTrades.length} сделок</span>
                <span>Сейчас</span>
            </div>
        </div>
    {/if}
</Card>

<style>
    .trend-value {
        font-size: 16px;
        font-weight: 700;
    }

    .profit {
        color: var(--success, #34d399);
    }

    .loss {
        color: var(--danger, #fb7185);
    }

    .trend-card {
        margin-top: 12px;
        border-radius: 18px;
        padding: 14px 12px 10px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .trend-positive {
        background: linear-gradient(180deg, rgba(52, 211, 153, 0.08) 0%, rgba(52, 211, 153, 0.02) 100%);
        border-color: rgba(52, 211, 153, 0.14);
    }

    .trend-negative {
        background: linear-gradient(180deg, rgba(251, 113, 133, 0.08) 0%, rgba(251, 113, 133, 0.02) 100%);
        border-color: rgba(251, 113, 133, 0.14);
    }

    .trend-chart {
        width: 100%;
        height: 150px;
        display: block;
    }

    .trend-line {
        fill: none;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .trend-line-positive {
        stroke: #34d399;
    }

    .trend-line-negative {
        stroke: #fb7185;
    }

    .trend-footer {
        margin-top: 6px;
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.4);
    }

    .inner-card {
        margin-top: 12px;
    }

    .empty {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.55);
    }
</style>