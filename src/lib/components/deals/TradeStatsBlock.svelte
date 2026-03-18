<script lang="ts">
    import Card from '$lib/components/ui/Card.svelte';
    import type { UiTradeStats } from '$lib/types/tradeStats';

    export let stats: UiTradeStats | null = null;

    function formatNum(v?: number | null, digits = 2): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        return v.toLocaleString('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: digits
        });
    }

    function formatPct(v?: number | null, digits = 1): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        return `${v.toFixed(digits)}%`;
    }

    function formatPnl(v?: number | null, digits = 2): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        const sign = v > 0 ? '+' : '';
        return `${sign}${formatNum(v, digits)}`;
    }

    $: topMetrics = [
        {
            label: 'PnL',
            value: formatPnl(stats?.totalPnL),
            tone:
                stats?.totalPnL != null && stats.totalPnL > 0
                    ? 'profit'
                    : stats?.totalPnL != null && stats.totalPnL < 0
                        ? 'loss'
                        : ''
        },
        {
            label: 'Win rate',
            value: formatPct(stats?.winRate),
            tone: ''
        },
        {
            label: 'Сделок',
            value: formatNum(stats?.totalTrades, 0),
            tone: ''
        },
        {
            label: 'Побед',
            value: formatNum(stats?.wins, 0),
            tone: 'profit'
        },
        {
            label: 'Убытков',
            value: formatNum(stats?.losses, 0),
            tone: 'loss'
        },
        {
            label: 'Avg PnL',
            value: formatPnl(stats?.avgPnL),
            tone:
                stats?.avgPnL != null && stats.avgPnL > 0
                    ? 'profit'
                    : stats?.avgPnL != null && stats.avgPnL < 0
                        ? 'loss'
                        : ''
        }
    ];

    $: extraMetrics = [
        {
            label: 'Закрыто',
            value: formatNum(stats?.closedTrades, 0)
        },
        {
            label: 'Открыто',
            value: formatNum(stats?.openTrades, 0)
        },
        {
            label: 'Avg R',
            value:
                stats?.avgR != null
                    ? `${stats.avgR > 0 ? '+' : ''}${stats.avgR.toFixed(2)}R`
                    : '—'
        },
        {
            label: 'PF',
            value: formatNum(stats?.profitFactor, 2)
        }
    ];

    $: compactReasons = [
        { label: 'TP', value: stats?.tpCount ?? 0 },
        { label: 'SL', value: stats?.slCount ?? 0 },
        { label: 'Time stale', value: stats?.timeStopStaleCount ?? 0 },
        { label: 'Unknown', value: stats?.unknownCloseCount ?? 0 }
    ];
</script>

<Card>
    <div class="head">
        <div class="title">Статистика</div>
        <div class="sub">Ключевые метрики по сделкам</div>
    </div>

    <div class="metrics-grid">
        {#each topMetrics as item}
            <div class="metric">
                <div class="label">{item.label}</div>
                <div
                        class="value"
                        class:profit={item.tone === 'profit'}
                        class:loss={item.tone === 'loss'}
                >
                    {item.value}
                </div>
            </div>
        {/each}
    </div>

    <div class="metrics-grid compact">
        {#each extraMetrics as item}
            <div class="metric compact-metric">
                <div class="label">{item.label}</div>
                <div class="value small">{item.value}</div>
            </div>
        {/each}
    </div>

    <div class="reasons">
        <div class="reasons-title">Причины закрытия</div>

        <div class="reason-row">
            {#each compactReasons as item}
                <div class="reason-pill">
                    <span class="reason-label">{item.label}</span>
                    <span class="reason-value">{item.value}</span>
                </div>
            {/each}
        </div>
    </div>
</Card>

<style>
    .head {
        margin-bottom: 10px;
    }

    .title {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-main, #fff);
    }

    .sub {
        margin-top: 4px;
        font-size: 12px;
        color: var(--text-muted, #6b7280);
    }

    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }

    .metrics-grid.compact {
        margin-top: 8px;
        grid-template-columns: repeat(2, 1fr);
    }

    .metric {
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border, rgba(255,255,255,0.08));
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 64px;
    }

    .compact-metric {
        min-height: 58px;
    }

    .label {
        font-size: 11px;
        color: var(--text-muted, #6b7280);
        line-height: 1.1;
    }

    .value {
        margin-top: 6px;
        font-size: 18px;
        font-weight: 700;
        line-height: 1.15;
        color: var(--text-main, #fff);
        word-break: break-word;
    }

    .value.small {
        font-size: 16px;
    }

    .profit {
        color: var(--success, #34d399);
    }

    .loss {
        color: var(--danger, #fb7185);
    }

    .reasons {
        margin-top: 10px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border, rgba(255,255,255,0.08));
        padding: 12px;
    }

    .reasons-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main, #fff);
    }

    .reason-row {
        margin-top: 10px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .reason-pill {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 12px;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
    }

    .reason-label {
        font-size: 12px;
        color: var(--text-soft, rgba(255,255,255,0.78));
    }

    .reason-value {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-main, #fff);
    }
</style>