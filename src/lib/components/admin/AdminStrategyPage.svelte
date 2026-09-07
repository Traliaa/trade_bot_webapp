<script lang="ts">
    import { adminAccess } from '$lib/auth/admin';
    import { adminTradeApi, type RuntimeTuning, type RejectSnapshot } from '$lib/api/adminTradeApi';
    import { tuneDecisionMessage } from '$lib/api/adminPayload';
    import { botStatsStore } from '$lib/stores/stats';
    import type { BotTradeStats } from '$lib/types/botStats';
    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import InfoRow from '$lib/components/ui/InfoRow.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

    let initialized = false;
    let loading = false;
    let action: 'toggle' | 'tune' | 'reset' | null = null;
    let error: string | null = null;
    let result: string | null = null;
    let mode = 'unknown';
    let runtime: RuntimeTuning | null = null;
    let rejects: RejectSnapshot | null = null;
    let lastSignalAt = '';
    let lastTuneAt = '';
    let confirmReset = false;
    $: busy = loading || action !== null;
    $: if ($adminAccess && !initialized) {
        initialized = true;
        load();
    }

    const modeLabels: Record<string, string> = {
        off: 'Выключен', safe: 'Осторожный', auto: 'Автоматический', manual: 'Ручной', unknown: 'Не загружен'
    };
    const runtimeFields: [keyof RuntimeTuning, string][] = [
        ['v3MinConfirmScore', 'Минимальный балл V3'],
        ['v3RetestTolerancePct', 'Допуск ретеста V3'],
        ['v3ImpulseBodyMinPct', 'Тело импульса V3'],
        ['v3CompressionThresholdPct', 'Сжатие канала V3'],
        ['v3StrongCloseMin', 'Закрытие long V3'],
        ['v3StrongCloseMax', 'Закрытие short V3'],
        ['v3VolumeMinRatio', 'Минимальный объём V3']
    ];
    const baseFields: [keyof RuntimeTuning, string][] = [
        ['breakoutPct', 'Пробой'], ['minChannelPct', 'Ширина канала'],
        ['minBodyPct', 'Тело свечи'], ['closeUpMin', 'Закрытие long'], ['closeDnMax', 'Закрытие short']
    ];
    const statFields: [keyof BotTradeStats, string][] = [
        ['totalTrades', 'Всего сделок'], ['openTrades', 'Открытых'], ['closedTrades', 'Закрытых'],
        ['wins', 'Побед'], ['losses', 'Убытков'], ['breakevenTrades', 'Безубыток'],
        ['winRate', 'Винрейт, %'], ['totalPnL', 'PnL, USDT'], ['openPnL', 'Открытый PnL'],
        ['avgPnL', 'Средний PnL'], ['profitFactor', 'Profit factor'],
        ['totalR', 'Всего R'], ['avgR', 'Средний R'], ['medianR', 'Медиана R'],
        ['bestTradeR', 'Лучший R'], ['worstTradeR', 'Худший R'],
        ['avgMfeR', 'Средний MFE, R'], ['avgMaeR', 'Средний MAE, R'],
        ['partialTrades', 'С частичным выходом'], ['avgDurationSec', 'Длительность, сек.'],
        ['tpCount', 'Тейк-профит'], ['slCount', 'Стоп-лосс'], ['breakEvenCount', 'Выход в безубыток'],
        ['lockProfitCount', 'Фиксация прибыли'], ['partialExitCount', 'Частичные выходы'],
        ['timeStopEarlyCount', 'Ранний выход'], ['timeStopStaleCount', 'Выход по времени'],
        ['manualCloseCount', 'Ручное закрытие'], ['recoveryCloseCount', 'Recovery'],
        ['forceCloseCount', 'Принудительное закрытие'], ['unknownCloseCount', 'Причина неизвестна']
    ];
    function number(value: unknown, digits = 4) {
        return typeof value === 'number' && Number.isFinite(value)
            ? value.toLocaleString('ru-RU', { maximumFractionDigits: digits }) : '—';
    }
    function date(value?: string) {
        if (!value || value.startsWith('0001-')) return 'Ещё не было';
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString('ru-RU');
    }
    $: reasons = Object.entries(rejects?.reasons ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
    $: hasV3 = runtimeFields.some(([key]) => runtime?.[key] != null);

    async function loadData() {
        // A failed endpoint must not hide successfully loaded mode/runtime/reject data.
        const responses = await Promise.allSettled([
            adminTradeApi.tuneMode().then((r) => { mode = r.mode; }),
            adminTradeApi.strategyTuning().then((r) => {
                runtime = r.runtime; lastSignalAt = r.from; lastTuneAt = r.to;
            }),
            adminTradeApi.strategyRejects().then((r) => { rejects = r; })
        ]);
        const failures = responses.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
        if (failures.length) throw new Error([...new Set(failures.map((r) => r.reason instanceof Error ? r.reason.message : 'Ошибка API'))].join('; '));
    }
    async function load() {
        if (!$adminAccess || busy) return;
        loading = true;
        error = null;
        try {
            await Promise.all([loadData(), botStatsStore.load()]);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось загрузить тюн';
        } finally { loading = false; }
    }
    async function perform(next: 'toggle' | 'tune' | 'reset') {
        if (!$adminAccess || busy) return;
        action = next;
        error = null;
        result = null;
        try {
            if (next === 'toggle') {
                mode = (await adminTradeApi.toggleTuneMode()).mode;
                result = 'Режим: ' + (modeLabels[mode] ?? mode);
            } else if (next === 'reset') {
                await adminTradeApi.strategyRejects(true);
                // Reset API returns the snapshot BEFORE clearing; read the new snapshot.
                rejects = await adminTradeApi.strategyRejects(false);
                confirmReset = false;
                result = 'Статистика отказов сброшена';
            } else {
                const response = await adminTradeApi.autoTuneNow();
                runtime = response.runtime;
                mode = response.mode;
                result = tuneDecisionMessage(response);
                await loadData();
            }
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось выполнить действие';
        } finally { action = null; }
    }
</script>

{#if $adminAccess}
<div class="admin-stack" aria-busy={busy}>
    <Card>
        <SectionHeader title="Тюн стратегии" subtitle="Режим, параметры и причины отказов">
            <svelte:fragment slot="actions">
                <Button variant="ghost" on:click={load} disabled={busy}>{loading ? 'Загрузка…' : 'Обновить'}</Button>
            </svelte:fragment>
        </SectionHeader>
        <div class="mode-line">
            <span>Текущий режим</span>
            <strong class:enabled={mode !== 'off' && mode !== 'unknown'}>{modeLabels[mode] ?? mode}</strong>
        </div>
        <div class="controls">
            <Button on:click={() => perform('toggle')} disabled={busy || mode === 'unknown'}>
                {action === 'toggle' ? 'Переключаем…' : 'Сменить режим'}
            </Button>
            <Button variant="primary" on:click={() => perform('tune')} disabled={busy || mode === 'unknown'}>
                {action === 'tune' ? 'Выполняем…' : 'Запустить тюн'}
            </Button>
        </div>
        <p class="hint">Смена режима: выключен → осторожный → автоматический. Ручной запуск соблюдает ограничения стратегии.</p>
        {#if error}<div class="notice error" role="alert">{error}</div>{/if}
        {#if result}<div class="notice" role="status">{result}</div>{/if}
    </Card>

    <Card>
        <SectionHeader title="Параметры стратегии" subtitle="Текущие значения из работающего бота" />
        {#if !runtime}
            <p class="hint">{loading ? 'Загружаем параметры…' : 'Параметры недоступны. Нажмите «Обновить».'}</p>
        {:else}
            <div class="data-list">
                {#each (hasV3 ? runtimeFields : baseFields) as [key, label] (key)}
                    <InfoRow compact {label} value={number(runtime[key])} />
                {/each}
            </div>
            {#if hasV3}
                <details>
                    <summary>Базовые параметры</summary>
                    <div class="data-list">
                        {#each baseFields as [key, label] (key)}
                            <InfoRow compact {label} value={number(runtime[key])} />
                        {/each}
                    </div>
                </details>
            {/if}
            <p class="hint">Последний сигнал: {date(lastSignalAt)}<br />Последний тюн: {date(lastTuneAt)}</p>
        {/if}
    </Card>

    <Card>
        <SectionHeader title="Причины отказов" subtitle={rejects ? 'Всего: ' + number(rejects.total, 0) : 'Снимок ещё не загружен'}>
            <svelte:fragment slot="actions">
                <Button variant="ghost" on:click={() => confirmReset = !confirmReset} disabled={busy || !rejects}>Сбросить</Button>
            </svelte:fragment>
        </SectionHeader>
        {#if confirmReset}
            <div class="notice">
                Сбросить накопленные отказы? Тюну потребуется новая статистика.
                <div class="controls">
                    <Button on:click={() => confirmReset = false} disabled={busy}>Отмена</Button>
                    <Button on:click={() => perform('reset')} disabled={busy}>Подтвердить сброс</Button>
                </div>
            </div>
        {/if}
        {#if !rejects}
            <p class="hint">{loading ? 'Загрузка…' : 'Не удалось получить статистику отказов.'}</p>
        {:else if reasons.length === 0}
            <p class="hint">За этот период отказов нет.</p>
        {:else}
            <div class="data-list">
                {#each reasons as [reason, count] (reason)}
                    <InfoRow compact label={reason} value={number(count, 0)} />
                {/each}
            </div>
            <p class="hint">{date(rejects.from)} — {date(rejects.to)}</p>
        {/if}
    </Card>

    <Card>
        <details>
            <summary>Статистика и качество сделок</summary>
            {#if $botStatsStore.error}
                <p class="error" role="alert">{$botStatsStore.error}</p>
            {:else}
                <div class="data-list">
                    {#each statFields as [key, label] (key)}
                        <InfoRow compact {label} value={number($botStatsStore.data?.[key], 2)} />
                    {/each}
                </div>
            {/if}
        </details>
    </Card>
</div>
{/if}

<style>
    .admin-stack { display: grid; gap: 12px; min-width: 0; }
    .mode-line { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 13px; padding: 6px 0 12px; }
    .mode-line strong { color: var(--text-muted); }
    .mode-line strong.enabled { color: #34d399; }
    .controls { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 8px; }
    .controls :global(button) { min-height: 44px; padding: 8px; }
    .hint { font-size: 12px; color: var(--text-muted, #94a3b8); line-height: 1.5; margin: 10px 0 0; overflow-wrap: anywhere; }
    .data-list { margin-top: 8px; }
    .data-list :global(.row) { border: 0; border-bottom: 1px solid var(--border); border-radius: 0; background: transparent; padding: 9px 0; gap: 8px; }
    .data-list :global(.left) { overflow-wrap: anywhere; }
    .notice { padding: 10px; border-radius: 10px; background: rgba(96,165,250,.1); color: #bfdbfe; font-size: 13px; line-height: 1.5; margin-top: 12px; overflow-wrap: anywhere; }
    .error { color: #fca5a5; }
    .notice.error { background: rgba(248,113,113,.1); }
    summary { cursor: pointer; font-size: 14px; font-weight: 600; padding: 4px 0; min-height: 32px; align-content: center; }
    details { margin-top: 8px; }
</style>
