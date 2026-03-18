<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    import { settingsStore } from '$lib/stores/settings';
    import { historyStore } from '$lib/stores/history';
    import PnlTrendCard from '$lib/components/overview/PnlTrendCard.svelte';
    import { startVisibilityPoller } from '$lib/utils/visibilityPoller';
    import { hapticLight } from '$lib/telegram/haptics';

    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import InfoRow from '$lib/components/ui/InfoRow.svelte';
    import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
    import CompactTradeCard from '$lib/components/deals/CompactTradeCard.svelte';
    async function loadInitial() {
        await Promise.all([
            settingsStore.load(),
            historyStore.loadAll(10)
        ]);
    }

    async function loadPolling() {
        await Promise.all([
            historyStore.loadAll(10),
            settingsStore.load()
        ]);
    }

    onMount(() => {
        loadInitial();

        const poller = startVisibilityPoller(loadPolling, 7000);

        return () => {
            poller.stop();
        };
    });

    async function refresh() {
        hapticLight();
        await loadInitial();
    }

    function formatMoney(v?: number | null, digits = 2): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        return `${v.toLocaleString('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: digits
        })} USDT`;
    }

    function formatNum(v?: number | null, digits = 2): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        return v.toLocaleString('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: digits
        });
    }

    function formatPct(v?: number | null): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        return `${v.toFixed(1)}%`;
    }

    function formatPnl(v?: number | null): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        const sign = v > 0 ? '+' : '';
        return `${sign}${formatNum(v)}`;
    }

    function weekdayLabel(value?: string | null): string {
        if (!value) return '—';

        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '—';

        const raw = d.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '');
        return raw.charAt(0).toUpperCase() + raw.slice(1, 2);
    }

    function formatTradeTime(value?: string | null): string {
        if (!value) return '';

        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '';

        return d.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function lastSignalText(): string {
        const first = $historyStore.trades?.[0];
        if (!first) return 'Нет данных';

        const time = first.exitAt ?? first.entryAt ?? '';
        const formattedTime = formatTradeTime(time);

        return formattedTime
            ? `${first.symbol} · ${first.sideLabel} · ${formattedTime}`
            : `${first.symbol} · ${first.sideLabel}`;
    }

    $: account = $historyStore.account ?? null;
    $: statsData = $historyStore.stats ?? null;
    $: openTrades = $historyStore.openTrades ?? [];
    $: closedTrades = ($historyStore.trades ?? []).filter((t) => t.isClosed);

    $: balanceValue = account?.totalEquity;
    $: balance = formatMoney(balanceValue);
    let pnlMode: 'realized' | 'unrealized' = 'realized';

    $: unrealizedPnL =
        typeof account?.unrealizedPnL === 'number'
            ? formatPnl(account?.unrealizedPnL)
            : '—';

    $: realizedPnL =
        typeof account?.realizedPnL === 'number'
            ? formatPnl(account?.realizedPnL)
            : '—';

    $: pnlValue = pnlMode === 'realized' ? realizedPnL : unrealizedPnL;

    $: pnlNumber =
        pnlMode === 'realized'
            ? account?.realizedPnL
            : account?.unrealizedPnL;

    $: totalTrades =
        typeof statsData?.totalTrades === 'number'
            ? `${statsData.totalTrades}`
            : '—';

    $: openTradesCount =
        typeof statsData?.openTrades === 'number'
            ? `${statsData.openTrades}`
            : `${openTrades.length}`;

    $: closedTradesCount =
        typeof statsData?.closedTrades === 'number'
            ? `${statsData.closedTrades}`
            : `${closedTrades.length}`;

    $: winrate =
        typeof statsData?.winRate === 'number'
            ? formatPct(statsData.winRate)
            : '—';



    $: avgPnl =
        typeof statsData?.avgPnL === 'number'
            ? formatPnl(statsData.avgPnL)
            : '—';

    $: wins =
        typeof statsData?.wins === 'number'
            ? `${statsData.wins}`
            : '—';

    $: losses =
        typeof statsData?.losses === 'number'
            ? `${statsData.losses}`
            : '—';

    $: serviceError =
        $historyStore.error ||
        $settingsStore.error;


    $: isLoading =
        $historyStore.loading ||
        $settingsStore.loading;



</script>

<div class="stack">
    <div class="grid2">
        <Card>
            <div class="stat-label">Баланс</div>
            <div class="stat-value">{balance}</div>
            <div class="stat-sub">
                {#if balanceValue != null}
                    Баланс по аккаунту
                {:else if $historyStore.loading}
                    Загружаем баланс...
                {:else}
                    Баланс недоступен
                {/if}
            </div>
        </Card>

        <Card>
            <div class="stat-label">P&amp;L</div>

            <div class="pnl-switch">
                <button
                        class:selected={pnlMode === 'realized'}
                        on:click={() => (pnlMode = 'realized')}
                >
                    Закрытые
                </button>

                <button
                        class:selected={pnlMode === 'unrealized'}
                        on:click={() => (pnlMode = 'unrealized')}
                >
                    Открытые
                </button>
            </div>

            <div
                    class="stat-value"
                    class:profit={typeof pnlNumber === 'number' && pnlNumber > 0}
                    class:loss={typeof pnlNumber === 'number' && pnlNumber < 0}
            >
                {pnlValue}
            </div>

            <div class="stat-sub">
                {pnlMode === 'realized'
                    ? 'По закрытым сделкам'
                    : 'По открытым позициям'}
            </div>
        </Card>
    </div>

    <Card>
        <SectionHeader
                title="Статус и сигнал"
                subtitle="Краткое состояние бота прямо на главном экране"
        >
            <svelte:fragment slot="actions">
                <div class="header-actions">
                    <StatusBadge tone={serviceError ? 'danger' : $historyStore.botRunning ? 'success' : 'muted'}>
                        {serviceError ? 'Ошибка' : $historyStore.botRunning ? 'Запущен' : 'Остановлен'}
                    </StatusBadge>

                    <Button variant="ghost" on:click={refresh} disabled={isLoading}>
                        {isLoading ? '...' : 'Обновить'}
                    </Button>
                </div>
            </svelte:fragment>
        </SectionHeader>

        <div class="rows">
            <InfoRow
                    label="Последний сигнал"
                    value={lastSignalText()}
                    valueTone={lastSignalText() === 'Нет данных' ? 'muted' : 'default'}
            />
            <InfoRow
                    label="Состояние сервиса"
                    value={serviceError ? 'Ошибка загрузки' : $historyStore.botRunning ? 'Подключен' : 'Остановлен'}
                    valueTone={serviceError ? 'danger' : $historyStore.botRunning ? 'success' : 'muted'}
            />
            <InfoRow label="Биржа" value="OKX" />
        </div>
    </Card>

    <Card>
        <SectionHeader
                title="Общая статистика"
                subtitle="Показатели по всем сделкам"
        />

        <div class="stats-grid">
            <Card className="mini-card" padded={true}>
                <div class="stat-label">Винрейт</div>
                <div class="mini-value">{winrate}</div>
            </Card>

            <Card className="mini-card" padded={true}>
                <div class="stat-label">Средний P&amp;L</div>
                <div
                        class="mini-value"
                        class:profit={typeof statsData?.avgPnL === 'number' && statsData.avgPnL > 0}
                        class:loss={typeof statsData?.avgPnL === 'number' && statsData.avgPnL < 0}
                >
                    {avgPnl}
                </div>
            </Card>

            <Card className="mini-card" padded={true}>
                <div class="stat-label">Сделок</div>
                <div class="mini-value">{totalTrades}</div>
            </Card>
        </div>

        <div class="rows stats-rows">
            <InfoRow label="Открытых" value={openTradesCount} />
            <InfoRow label="Закрытых" value={closedTradesCount} />
            <InfoRow label="Побед" value={wins} valueTone="success" />
            <InfoRow label="Убытков" value={losses} valueTone="danger" />
        </div>
    </Card>

    <PnlTrendCard trades={$historyStore.trades ?? []} />
    <Card>
        <SectionHeader
                title="Активные сделки"
                subtitle={`Сейчас открыто ${openTrades.length}`}
        >
            <svelte:fragment slot="actions">
                <Button variant="ghost" on:click={() => goto('/deals')}>
                    Все
                </Button>
            </svelte:fragment>
        </SectionHeader>

        {#if $historyStore.loading && openTrades.length === 0}
            <Card className="inner-card">
                <div class="empty">Загружаем сделки...</div>
            </Card>
        {:else if $historyStore.error}
            <Card className="inner-card error-card">
                <div class="error-text">{$historyStore.error}</div>
            </Card>
        {:else if openTrades.length === 0}
            <Card className="inner-card">
                <div class="empty">Нет открытых позиций</div>
            </Card>
        {:else}
            <div class="trade-list">
                {#each openTrades.slice(0, 3) as trade (trade.id)}
<!--                    <CompactTradeCard trade={trade} mode="open" compact />-->
                    <CompactTradeCard trade={trade}/>

                {/each}
            </div>
        {/if}
    </Card>
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

    .grid2 :global(.ui-card) {
        min-height: 104px;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
    }

    .stats-rows {
        margin-top: 10px;
    }

    .stat-label {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.45);
    }

    .stat-value {
        margin-top: 4px;
        font-size: 20px;
        font-weight: 600;
        color: #fff;
        line-height: 1.2;
    }

    .stat-sub {
        margin-top: 4px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
    }

    .mini-value {
        margin-top: 6px;
        font-size: 18px;
        font-weight: 600;
        color: #fff;
        line-height: 1.2;
    }

    .stats-grid {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }


    .profit {
        color: #34d399;
    }

    .loss {
        color: #fb7185;
    }

    /*.bars {*/
    /*    display: flex;*/
    /*    align-items: end;*/
    /*    gap: 8px;*/
    /*    height: 110px;*/
    /*    margin-top: 12px;*/
    /*    padding: 12px;*/
    /*    border-radius: 14px;*/
    /*    background: rgba(255, 255, 255, 0.03);*/
    /*}*/

    /*.bar-col {*/
    /*    flex: 1;*/
    /*    display: flex;*/
    /*    flex-direction: column;*/
    /*    align-items: center;*/
    /*    gap: 8px;*/
    /*}*/

    /*.bar-track {*/
    /*    width: 100%;*/
    /*    height: 88px;*/
    /*    display: flex;*/
    /*    align-items: end;*/
    /*    border-radius: 10px;*/
    /*    background: rgba(255, 255, 255, 0.04);*/
    /*    overflow: hidden;*/
    /*}*/

    /*.bar-fill {*/
    /*    width: 100%;*/
    /*    border-radius: 10px;*/
    /*}*/

    /*.bar-positive {*/
    /*    background: rgba(52, 211, 153, 0.85);*/
    /*}*/

    /*.bar-negative {*/
    /*    background: rgba(251, 113, 133, 0.85);*/
    /*}*/

    /*.bar-label {*/
    /*    font-size: 10px;*/
    /*    color: rgba(255, 255, 255, 0.35);*/
    /*}*/


    .trade-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
    }



    .empty {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.55);
    }



    .error-text {
        font-size: 13px;
        color: #fca5a5;
    }

    .pnl-switch {
        margin-top: 8px;
        display: inline-flex;
        gap: 4px;
        flex-wrap: wrap;
    }

    .pnl-switch button {
        font-size: 10px;
        line-height: 1;
        padding: 5px 8px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.04);
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
    }

    .pnl-switch button.selected {
        background: rgba(37,99,235,0.22);
        border-color: rgba(96,165,250,0.28);
        color: #60a5fa;
    }
    .bars.split-bars {
        display: flex;
        align-items: stretch;
        gap: 8px;
        margin-top: 12px;
        padding: 12px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
        min-height: 132px;
    }

    .bar-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .bar-half {
        width: 100%;
        height: 42px;
        display: flex;
        justify-content: center;
    }

    .bar-top {
        align-items: end;
    }

    .bar-bottom {
        align-items: start;
    }

    .bar-midline {
        width: 100%;
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
        margin: 2px 0 6px 0;
    }

    .bar-fill {
        width: 70%;
        min-height: 10px;
        border-radius: 8px;
    }

    .bar-positive {
        background: rgba(52, 211, 153, 0.9);
    }

    .bar-negative {
        background: rgba(251, 113, 133, 0.9);
    }

    .bar-label {
        margin-top: 8px;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.35);
    }
    .pnl-strip {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 8px;
    }

    .pnl-chip {
        min-height: 72px;
        padding: 10px 8px;
        border-radius: 12px;
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        text-align: center;
    }

    .pnl-chip-positive {
        background: rgba(52, 211, 153, 0.10);
        border-color: rgba(52, 211, 153, 0.22);
    }

    .pnl-chip-negative {
        background: rgba(251, 113, 133, 0.10);
        border-color: rgba(251, 113, 133, 0.22);
    }

    .pnl-chip-value {
        font-size: 13px;
        font-weight: 700;
        line-height: 1.2;
        color: var(--text-main, #e5e7eb);
        word-break: break-word;
    }

    .pnl-chip-label {
        margin-top: 8px;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.45);
    }

    @media (max-width: 420px) {
        .pnl-strip {
            grid-template-columns: repeat(4, minmax(0, 1fr));
        }
    }
</style>