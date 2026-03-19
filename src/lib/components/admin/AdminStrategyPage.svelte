<script lang="ts">
    import { tgUser } from '$lib/stores/telegram';
    import { isAdminUserId } from '$lib/auth/admin';
    import { adminTradeApi } from '$lib/api/adminTradeApi';
    import { hapticLight, hapticSuccess, hapticError } from '$lib/telegram/haptics';

    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import InfoRow from '$lib/components/ui/InfoRow.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
    import StatusBadge from '$lib/components/ui/StatusBadge.svelte';

    let loading = false;
    let error: string | null = null;
    let loadedOnce = false;

    let tuneMode = 'off';
    let runtime: any = null;
    let rejects: any = null;

    let manualTuneLoading = false;
    let manualTuneResult:
        | {
        ok: boolean;
        changed: boolean;
        message: string;
        payload?: any;
    }
        | null = null;


    $: isAdmin = isAdminUserId($tgUser?.id ?? null);

    $: if (isAdmin && !loadedOnce) {
        loadedOnce = true;
        load();
    }

    function prettyTuneMode(mode: string): string {
        switch (mode) {
            case 'off':
                return 'Выключен';
            case 'safe':
                return 'Осторожный';
            case 'aggressive':
                return 'Агрессивный';
            default:
                return mode || '—';
        }
    }

    function formatNum(v: unknown, digits = 2): string {
        if (typeof v !== 'number' || Number.isNaN(v)) return '—';
        return v.toLocaleString('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: digits
        });
    }

    function decisionSummary(payload: any): string {
        if (!payload) return 'Результат не получен';
        if (payload.changed) return 'Изменения применены';
        return 'Тюн выполнен, но изменения не потребовались';
    }

    async function load() {
        if (!isAdmin) return;

        loading = true;
        error = null;

        try {
            const [modeResp, runtimeResp, rejectsResp] = await Promise.all([
                adminTradeApi.tuneMode(),
                adminTradeApi.strategyTuning(),
                adminTradeApi.strategyRejects(false)
            ]);

            tuneMode = modeResp?.mode ?? 'off';
            runtime = runtimeResp?.runtime ?? null;
            rejects = rejectsResp ?? null;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось загрузить admin данные';
            hapticError();
        } finally {
            loading = false;
        }
    }

    async function toggleTune() {
        if (!isAdmin) return;

        try {
            hapticLight();
            const resp = await adminTradeApi.toggleTuneMode();
            tuneMode = resp?.mode ?? tuneMode;
            hapticSuccess();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось переключить тюн';
            hapticError();
        }
    }

    async function resetRejects() {
        if (!isAdmin) return;

        try {
            hapticLight();
            rejects = await adminTradeApi.strategyRejects(true);
            hapticSuccess();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось сбросить статистику reject';
            hapticError();
        }
    }

    async function runManualTune() {
        if (!isAdmin) return;

        manualTuneLoading = true;
        manualTuneResult = null;
        error = null;
        hapticLight();

        try {
            const result = await adminTradeApi.autoTuneNow();

            manualTuneResult = {
                ok: true,
                changed: Boolean(result?.changed),
                message: decisionSummary(result),
                payload: result
            };

            await load();
            hapticSuccess();
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Не удалось выполнить ручной тюн';
            manualTuneResult = {
                ok: false,
                changed: false,
                message: msg
            };
            error = msg;
            hapticError();
        } finally {
            manualTuneLoading = false;
        }
    }

    $: rejectRows = [
        { label: 'Всего', value: rejects?.total ?? '—' },
        { label: 'Окно', value: rejects?.from && rejects?.to ? 'Активно' : '—' }
    ];

    $: runtimeRows = [
        { label: 'Breakout', value: formatNum(runtime?.breakoutPct, 4) },
        { label: 'Channel', value: formatNum(runtime?.minChannelPct, 4) },
        { label: 'Body', value: formatNum(runtime?.minBodyPct, 4) },
        { label: 'Close up', value: formatNum(runtime?.closeUpMin, 2) },
        { label: 'Close down', value: formatNum(runtime?.closeDnMax, 2) }
    ];

    $: rejectReasons =
        rejects?.reasons && typeof rejects.reasons === 'object'
            ? Object.entries(rejects.reasons)
                .sort((a, b) => Number(b[1]) - Number(a[1]))
                .slice(0, 6)
            : [];
</script>

{#if isAdmin}
    <div class="stack">
        <Card variant="muted">
            <div class="info-head">
                <div class="icon">⚙️</div>
                <div>
                    <div class="title">Ручной тюн стратегии</div>
                    <div class="sub">Сначала смотрим статистику, потом запускаем ручной тюн</div>
                </div>
            </div>
        </Card>

        <Card>
            <SectionHeader
                    title="Текущий режим"
                    subtitle="Текущее состояние адаптивного тюна"
            >
                <svelte:fragment slot="actions">
                    <Button variant="ghost" on:click={load} disabled={loading || manualTuneLoading}>
                        {loading ? '...' : 'Обновить'}
                    </Button>
                </svelte:fragment>
            </SectionHeader>

            {#if error}
                <Card variant="error" className="inner-card">
                    <div class="error-text">{error}</div>
                </Card>
            {/if}

            <div class="rows">
                <InfoRow>
                    <span slot="label">Режим</span>
                    <span slot="value">{prettyTuneMode(tuneMode)}</span>
                </InfoRow>
            </div>

            <div class="actions one-line">
                <Button variant="secondary" on:click={toggleTune} disabled={loading || manualTuneLoading}>
                    Переключить тюн
                </Button>
            </div>
        </Card>

        <Card>
            <SectionHeader
                    title="Статистика для тюна"
                    subtitle="Текущие runtime параметры и reject-статистика"
            />

            <div class="stats-grid">
                <div class="mini-card">
                    <div class="mini-title">Runtime tuning</div>
                    <div class="mini-list">
                        {#each runtimeRows as row}
                            <InfoRow compact>
                                <span slot="label">{row.label}</span>
                                <span slot="value">{row.value}</span>
                            </InfoRow>
                        {/each}
                    </div>
                </div>

                <div class="mini-card">
                    <div class="mini-title">Reject snapshot</div>
                    <div class="mini-list">
                        {#each rejectRows as row}
                            <InfoRow compact>
                                <span slot="label">{row.label}</span>
                                <span slot="value">{row.value}</span>
                            </InfoRow>
                        {/each}
                    </div>
                </div>
            </div>

            <div class="reasons-card">
                <div class="mini-title with-action">
                    <span>Топ причин reject</span>
                    <Button variant="ghost" on:click={resetRejects} disabled={loading || manualTuneLoading}>
                        Сбросить
                    </Button>
                </div>

                {#if rejectReasons.length === 0}
                    <div class="empty">Нет данных по reject</div>
                {:else}
                    <div class="reason-list">
                        {#each rejectReasons as [reason, count]}
                            <div class="reason-row">
                                <span>{reason}</span>
                                <span>{count}</span>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </Card>

        <Card>
            <SectionHeader
                    title="Ручной запуск тюна"
                    subtitle="После запуска покажем, были ли внесены изменения"
            />

            <div class="actions one-line">
                <Button variant="primary" on:click={runManualTune} disabled={manualTuneLoading || loading}>
                    {manualTuneLoading ? 'Запускаем...' : 'Запустить ручной тюн'}
                </Button>
            </div>

            <div class="result-wrap">
                {#if manualTuneLoading}
                    <div class="status-card idle">Выполняем ручной тюн...</div>
                {:else if manualTuneResult}
                    <div class:success-box={manualTuneResult.ok} class:error-box={!manualTuneResult.ok} class="status-card">
                        <div class="status-title">
                            {manualTuneResult.ok ? 'Готово' : 'Ошибка'}
                        </div>
                        <div class="status-text">{manualTuneResult.message}</div>
                        {#if manualTuneResult.ok}
                            <div class="status-meta">
                                {manualTuneResult.changed ? 'Изменения применены' : 'Изменений не было'}
                            </div>
                        {/if}
                    </div>
                {:else}
                    <div class="status-card idle">Ручной тюн ещё не запускался</div>
                {/if}
            </div>
        </Card>
    </div>
{/if}

<style>
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
        background: rgba(52, 211, 153, 0.12);
        color: #34d399;
        flex-shrink: 0;
    }

    .title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-main, #fff);
    }

    .sub {
        margin-top: 2px;
        font-size: 12px;
        color: var(--text-muted, #94a3b8);
        line-height: 1.35;
    }

    .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
    }

    .actions {
        margin-top: 12px;
        display: flex;
        gap: 8px;
    }

    .actions.one-line :global(button),
    .actions.one-line :global(.ui-button) {
        width: 100%;
    }

    .stats-grid {
        margin-top: 12px;
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
    }

    .mini-card,
    .reasons-card {
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 12px;
    }

    .mini-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main, #fff);
    }

    .mini-title.with-action {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    .mini-list {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .reason-list {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .reason-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        font-size: 13px;
        color: rgba(255, 255, 255, 0.84);
    }

    .reason-row:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    .result-wrap {
        margin-top: 12px;
    }

    .status-card {
        border-radius: 14px;
        padding: 12px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.03);
    }

    .status-card.idle {
        color: var(--text-muted, #94a3b8);
    }

    .success-box {
        background: rgba(52, 211, 153, 0.08);
        border-color: rgba(52, 211, 153, 0.18);
    }

    .error-box {
        background: rgba(251, 113, 133, 0.08);
        border-color: rgba(251, 113, 133, 0.18);
    }

    .status-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--text-main, #fff);
    }

    .status-text {
        margin-top: 6px;
        font-size: 13px;
        color: rgba(255,255,255,0.84);
    }

    .status-meta {
        margin-top: 8px;
        font-size: 12px;
        color: var(--text-muted, #94a3b8);
    }

    .inner-card {
        margin-top: 12px;
    }

    .error-text {
        font-size: 13px;
        color: #fca5a5;
    }

    .empty {
        margin-top: 10px;
        font-size: 13px;
        color: rgba(255,255,255,0.55);
    }
</style>