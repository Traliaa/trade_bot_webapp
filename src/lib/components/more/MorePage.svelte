<script lang="ts">
    import { onMount } from 'svelte';
    import { settingsStore } from '$lib/stores/settings';
    import { trade, type TuneMode, type UserSettings } from '$lib/api/tradeApi';
    import { hapticLight, hapticSuccess, hapticError } from '$lib/telegram/haptics';
    import { isAdminNow } from '$lib/auth/admin';

    import BotControlsCard from './BotControlsCard.svelte';
    import TestTradeCard from './TestTradeCard.svelte';
    import AdminMenu from '$lib/components/admin/AdminMenu.svelte';

    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import InfoRow from '$lib/components/ui/InfoRow.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

    let loading = false;
    let error: string | null = null;
    let saveError: string | null = null;
    let saveSuccess = false;
    let tuneMode: TuneMode = 'off';
    let draftUser: UserSettings | null = null;

    $: isAdmin = isAdminNow();

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
            hapticError();
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
            hapticLight();
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
    <Card variant="muted">
        <div class="info-head">
            <div class="icon">⋯</div>
            <div>
                <div class="title">Ещё</div>
                <div class="sub">Сервисные действия, подключение OKX и диагностика</div>
            </div>
        </div>
    </Card>

    {#if error}
        <Card variant="error">
            <div class="title">Ошибка</div>
            <div class="sub">{error}</div>
            <div class="top-gap">
                <Button variant="primary" on:click={loadPage} disabled={loading}>
                    Повторить
                </Button>
            </div>
        </Card>
    {/if}

    {#if saveError}
        <Card variant="error">
            <div class="title">Ошибка сохранения</div>
            <div class="sub">{saveError}</div>
        </Card>
    {/if}

    {#if saveSuccess}
        <Card variant="success">
            <div class="title">Сохранено</div>
            <div class="sub">API-ключи обновлены</div>
        </Card>
    {/if}

    <Card>
        <SectionHeader
                title="Быстрые действия"
                subtitle="Частые разделы и служебные сценарии"
        >
            <svelte:fragment slot="actions">
                <Button variant="ghost" on:click={loadPage} disabled={loading}>
                    {loading ? '...' : 'Обновить'}
                </Button>
            </svelte:fragment>
        </SectionHeader>

        <div class="grid2">
            {#each quickActions as [title, subtitle, icon]}
                <button class="action-card" type="button">
                    <div class="action-icon">{icon}</div>
                    <div class="action-title">{title}</div>
                    <div class="action-sub">{subtitle}</div>
                </button>
            {/each}
        </div>
    </Card>

    <BotControlsCard
            {user}
            {tuneMode}
            onTuneChanged={(mode) => (tuneMode = mode)}
            onReload={loadPage}
    />

    <Card>
        <SectionHeader
                title="Подключение OKX"
                subtitle="API-ключи и базовые торговые параметры"
        >
            <svelte:fragment slot="actions">
                <div class="inline-actions">
                    <Button variant="ghost" on:click={resetDraft} disabled={!draftUser || $settingsStore.saving}>
                        Сбросить
                    </Button>
                    <Button variant="primary" on:click={saveApiKeys} disabled={!draftUser || $settingsStore.saving}>
                        {$settingsStore.saving ? 'Сохраняем...' : 'Сохранить'}
                    </Button>
                </div>
            </svelte:fragment>
        </SectionHeader>

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
                    <InfoRow compact>
                        <span slot="label">Плечо</span>
                        <span slot="value">{trading.leverage ?? '—'}</span>
                    </InfoRow>

                    <InfoRow compact>
                        <span slot="label">Макс. позиций</span>
                        <span slot="value">{trading.max_open_positions ?? '—'}</span>
                    </InfoRow>
                </div>
            </div>
        {:else}
            <Card className="inner-card">
                <div class="empty">Настройки подключения пока не загружены</div>
            </Card>
        {/if}
    </Card>

    <TestTradeCard />

    <Card>
        <SectionHeader
                title="Диагностика стратегии"
                subtitle="Быстрый просмотр сервисных параметров"
        />

        <div class="rows">
            <InfoRow>
                <span slot="label">Симуляция перед входом</span>
                <span slot="value">{features?.simulate_before_entry ? 'Вкл' : 'Выкл'}</span>
            </InfoRow>

            <InfoRow>
                <span slot="label">График сделки</span>
                <span slot="value">{features?.deal_chart_enabled ? 'Вкл' : 'Выкл'}</span>
            </InfoRow>

            <InfoRow>
                <span slot="label">Авто-рекомендации</span>
                <span slot="value">{features?.auto_recommend_enabled ? 'Вкл' : 'Выкл'}</span>
            </InfoRow>

            <InfoRow>
                <span slot="label">PRO режим</span>
                <span slot="value">{features?.pro_mode ? 'Вкл' : 'Выкл'}</span>
            </InfoRow>
        </div>
    </Card>

    {#if isAdmin}
        <AdminMenu />
    {/if}
</div>

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

    .top-gap {
        margin-top: 12px;
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

    .inner-card {
        margin-top: 12px;
    }

    .empty {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.55);
    }
</style>