<script lang="ts">
    import { onMount } from 'svelte';
    import { settingsStore } from '$lib/stores/settings';
    import { trade, type TuneMode, type UserSettings } from '$lib/api/tradeApi';
    import BotControlsCard from './BotControlsCard.svelte';
    import TestTradeCard from './TestTradeCard.svelte';
    import { isAdminNow } from "$lib/auth/admin";
    import AdminMenu from "$lib/components/admin/AdminStrategyPage.svelte";
    import { hapticLight, hapticSuccess, hapticError } from '$lib/telegram/haptics';
    import Card from '$lib/components/ui/Card.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
    import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
    import InfoRow from '$lib/components/ui/InfoRow.svelte';
    import Button from '$lib/components/ui/Button.svelte';

    let loading = false;
    let error: string | null = null;
    let saveError: string | null = null;
    let saveSuccess = false;
    let tuneMode: TuneMode = 'off';
    let draftUser: UserSettings | null = null;

    onMount(() => {
        loadPage();
    });

    function cloneUser<T>(value: T): T {
        if (typeof structuredClone !== 'undefined') return structuredClone(value);
        return JSON.parse(JSON.stringify(value));
    }

    $: if ($settingsStore.data && !draftUser) {
        draftUser = cloneUser($settingsStore.data);
    }
    $: isAdmin = isAdminNow();
    $: user = $settingsStore.data;
    $: settings = draftUser?.settings;
    $: trading = settings?.TradingSettings;
    $: features = settings?.FeatureFlags;
    $: premium = Boolean(user?.Premium);

    async function loadPage() {
        loading = true;
        error = null;
        saveError = null;
        saveSuccess = false;

        try {
            await Promise.all([settingsStore.load(), loadTuneMode()]);
            draftUser = null;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось загрузить раздел';
        } finally {
            loading = false;
        }
    }

    async function loadTuneMode() {
        const resp = await trade.tuneMode();
        tuneMode = resp.mode ?? 'off';
    }

    async function saveApiKeys() {
        if (!draftUser) return;

        saveError = null;
        saveSuccess = false;
        hapticLight();

        try {
            await settingsStore.save(draftUser);
            saveSuccess = true;
            hapticSuccess();
            await settingsStore.load();
            draftUser = null;
        } catch (e) {
            saveError = e instanceof Error ? e.message : 'Не удалось сохранить API-ключи';
            hapticError();
        }
    }

    function resetDraft() {
        if ($settingsStore.data) {
            draftUser = cloneUser($settingsStore.data);
            saveError = null;
            saveSuccess = false;
        }
    }

    const quickActions = [
        ['API ключи OKX', 'Подключение биржи и проверка доступа', '🔑'],
        ['Тестовая сделка', 'Проверка логики без реальной позиции', '🧪'],
        ['Справка', 'Термины и подсказки', '📘'],
        ['Премиум', premium ? 'Активен' : 'Не активен', '💎']
    ];
</script>

<div class="stack">
    <section class="info-card">
        <div class="icon">⋯</div>
        <div>
            <div class="title">Ещё</div>
            <div class="sub">Сервисные действия, подключение OKX и диагностика</div>
        </div>
    </section>

    {#if error}
        <section class="error-card">
            <div class="title">Ошибка</div>
            <div class="sub">{error}</div>
            <button class="primary" on:click={loadPage} disabled={loading}>
                Повторить
            </button>
        </section>
    {/if}

    {#if saveError}
        <section class="error-card">
            <div class="title">Ошибка сохранения</div>
            <div class="sub">{saveError}</div>
        </section>
    {/if}

    {#if saveSuccess}
        <section class="success-card">
            <div class="title">Сохранено</div>
            <div class="sub">API-ключи обновлены</div>
        </section>
    {/if}
    {#if isAdmin}
        <AdminMenu />
    {/if}
    <section class="card">
        <div class="section-header">
            <div>
                <div class="title">Быстрые действия</div>
                <div class="sub">Частые разделы и служебные сценарии</div>
            </div>

            <button class="ghost" on:click={loadPage} disabled={loading}>
                {loading ? '...' : 'Обновить'}
            </button>
        </div>

        <div class="grid2">
            {#each quickActions as [title, subtitle, icon]}
                <button class="action-card" type="button">
                    <div class="action-icon">{icon}</div>
                    <div class="action-title">{title}</div>
                    <div class="action-sub">{subtitle}</div>
                </button>
            {/each}
        </div>
    </section>

    <BotControlsCard
            {user}
            {tuneMode}
            onTuneChanged={(mode) => (tuneMode = mode)}
            onReload={loadPage}
    />

    <section class="card">
        <div class="section-header">
            <div>
                <div class="title">Подключение OKX</div>
                <div class="sub">API-ключи и базовые торговые параметры</div>
            </div>

            <div class="inline-actions">
                <button class="ghost" on:click={resetDraft} disabled={!draftUser || $settingsStore.saving}>
                    Сбросить
                </button>
                <button class="primary" on:click={saveApiKeys} disabled={!draftUser || $settingsStore.saving}>
                    {$settingsStore.saving ? 'Сохраняем...' : 'Сохранить'}
                </button>
            </div>
        </div>

        {#if trading}
            <div class="form-grid">
                <label class="field">
                    <span>OKX API key</span>
                    <input type="text" bind:value={trading.okx_api_key} placeholder="Введите API key" />
                </label>

                <label class="field">
                    <span>OKX API secret</span>
                    <input type="password" bind:value={trading.okx_api_secret} placeholder="Введите API secret" />
                </label>

                <label class="field">
                    <span>OKX Passphrase</span>
                    <input type="password" bind:value={trading.okx_passphrase} placeholder="Введите passphrase" />
                </label>

                <div class="rows compact">
                    <div class="row">
                        <span>Плечо</span>
                        <span>{trading.leverage ?? '—'}</span>
                    </div>

                    <div class="row">
                        <span>Макс. позиций</span>
                        <span>{trading.max_open_positions ?? '—'}</span>
                    </div>
                </div>
            </div>
        {:else}
            <div class="empty">Настройки подключения пока не загружены</div>
        {/if}
    </section>

    <TestTradeCard />

    <section class="card">
        <div class="title">Диагностика стратегии</div>
        <div class="sub">Быстрый просмотр сервисных параметров</div>

        <div class="rows">
            <div class="row">
                <span>Симуляция перед входом</span>
                <span>{features?.simulate_before_entry ? 'Вкл' : 'Выкл'}</span>
            </div>

            <div class="row">
                <span>График сделки</span>
                <span>{features?.deal_chart_enabled ? 'Вкл' : 'Выкл'}</span>
            </div>

            <div class="row">
                <span>Авто-рекомендации</span>
                <span>{features?.auto_recommend_enabled ? 'Вкл' : 'Выкл'}</span>
            </div>

            <div class="row">
                <span>PRO режим</span>
                <span>{features?.pro_mode ? 'Вкл' : 'Выкл'}</span>
            </div>
        </div>
    </section>

</div>

<style>
    .stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .card,
    .info-card,
    .error-card,
    .success-card {
        border-radius: 20px;
        padding: 14px;
        background: #111827;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .info-card {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        background: #0e1628;
    }

    .error-card {
        background: rgba(239, 68, 68, 0.08);
        border-color: rgba(239, 68, 68, 0.2);
    }

    .success-card {
        background: rgba(52, 211, 153, 0.08);
        border-color: rgba(52, 211, 153, 0.2);
    }

    .icon,
    .action-icon {
        width: 32px;
        height: 32px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(29, 78, 216, 0.2);
        color: #60a5fa;
        flex-shrink: 0;
    }

    .action-icon {
        width: 40px;
        height: 40px;
        font-size: 18px;
        background: rgba(255, 255, 255, 0.04);
        color: #fff;
    }

    .title {
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.92);
    }

    .sub {
        margin-top: 2px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
    }

    .inline-actions {
        display: flex;
        gap: 8px;
    }

    .grid2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .action-card {
        text-align: left;
        border-radius: 16px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .action-title {
        margin-top: 10px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
    }

    .action-sub {
        margin-top: 4px;
        font-size: 11px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.45);
    }

    .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
    }

    .rows.compact {
        margin-top: 4px;
    }

    .row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        border-radius: 14px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 13px;
        color: rgba(255, 255, 255, 0.82);
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
        margin-top: 12px;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.82);
    }

    .field input[type='text'],
    .field input[type='password'] {
        height: 42px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
        color: #fff;
        padding: 0 12px;
        font-size: 14px;
    }

    .primary,
    .ghost {
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 13px;
        font-weight: 600;
    }

    .primary {
        border: 0;
        background: #1d4ed8;
        color: #fff;
    }

    .ghost {
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.8);
    }

    .primary:disabled,
    .ghost:disabled {
        opacity: 0.6;
    }

    .empty {
        border-radius: 14px;
        padding: 14px;
        font-size: 13px;
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.55);
    }
</style>