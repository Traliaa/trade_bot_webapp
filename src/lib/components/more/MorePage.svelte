<script lang="ts">
    import { onMount } from 'svelte';
    import { settingsStore } from '$lib/stores/settings';
    import { tgUser } from '$lib/stores/telegram';
    import { isAdminUserId } from '$lib/auth/admin';
    import { hapticLight, hapticSuccess, hapticError } from '$lib/telegram/haptics';

    import AdminStrategyPage from '$lib/components/admin/AdminStrategyPage.svelte';
    import BotControlsCard from './BotControlsCard.svelte';
    import TestTradeCard from './TestTradeCard.svelte';

    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import InfoRow from '$lib/components/ui/InfoRow.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

    import { adminTradeApi, type TuneMode } from '$lib/api/adminTradeApi';
    import type { UserSettings } from '$lib/api/tradeApi';

    let loading = false;
    let error: string | null = null;
    let saveError: string | null = null;
    let saveSuccess = false;

    let tuneMode: TuneMode = 'off';
    let draftUser: UserSettings | null = null;

    $: isAdmin = isAdminUserId($tgUser?.id ?? null);

    function cloneUser<T>(value: T): T {
        if (typeof structuredClone !== 'undefined') return structuredClone(value);
        return JSON.parse(JSON.stringify(value));
    }

    onMount(() => {
        loadPage();
    });

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
            await settingsStore.load();

            if (isAdmin) {
                await loadTuneMode();
            }

            draftUser = null;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось загрузить раздел';
            hapticError();
        } finally {
            loading = false;
        }
    }

    async function loadTuneMode() {
        if (!isAdmin) return;
        const resp = await adminTradeApi.tuneMode();
        tuneMode = resp.mode ?? 'off';
    }

    async function saveApiKeys() {
        if (!draftUser) return;

        saveError = null;
        saveSuccess = false;
        hapticLight();

        try {
            await settingsStore.save(draftUser);
            await settingsStore.load();

            saveSuccess = true;
            draftUser = null;
            hapticSuccess();
        } catch (e) {
            saveError = e instanceof Error ? e.message : 'Не удалось сохранить API-ключи';
            hapticError();
        }
    }

    function resetDraft() {
        if (!$settingsStore.data) return;

        draftUser = cloneUser($settingsStore.data);
        saveError = null;
        saveSuccess = false;
        hapticLight();
    }

    // const quickActions = [
    //     ['API ключи OKX', 'Подключение биржи и проверка доступа', '🔑'],
    //     ['Тестовая сделка', 'Проверка логики без реальной позиции', '🧪'],
    //     ['Справка', 'Термины и подсказки', '📘'],
    //     ['Премиум', premium ? 'Активен' : 'Не активен', '💎']
    // ];
</script>
<Card variant="muted">
    <div class="admin-head">
        <div class="admin-badge">ADMIN</div>
        <div>
            <div class="title">Администрирование</div>
            <div class="sub">Управление ботом и ручной тюн стратегии</div>
        </div>
    </div>
</Card>



<AdminStrategyPage />
<div class="stack">
    <Card variant="muted">
        <div class="info-head">
            <div class="icon">⋯</div>
            <div>
                <div class="title">Ещё</div>
                <div class="sub">Подключение OKX, сервисные действия и диагностика</div>
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

<!--    <Card>-->
<!--        <SectionHeader-->
<!--                title="Быстрые действия"-->
<!--                subtitle="Частые разделы и служебные сценарии"-->
<!--        >-->
<!--            <svelte:fragment slot="actions">-->
<!--                <Button variant="ghost" on:click={loadPage} disabled={loading}>-->
<!--                    {loading ? '...' : 'Обновить'}-->
<!--                </Button>-->
<!--            </svelte:fragment>-->
<!--        </SectionHeader>-->

<!--        <div class="grid2">-->
<!--            {#each quickActions as [actionTitle, actionSubtitle, actionIcon]}-->
<!--                <button class="action-card" type="button">-->
<!--                    <div class="action-icon">{actionIcon}</div>-->
<!--                    <div class="action-title">{actionTitle}</div>-->
<!--                    <div class="action-sub">{actionSubtitle}</div>-->
<!--                </button>-->
<!--            {/each}-->
<!--        </div>-->
<!--    </Card>-->
    <BotControlsCard
            {user}
            onReload={loadPage}
    />

    {#if isAdmin}
    <Card variant="muted">
        <div class="admin-head">
            <div class="admin-badge">ADMIN</div>
            <div>
                <div class="title">Администрирование</div>
                <div class="sub">Управление ботом и ручной тюн стратегии</div>
            </div>
        </div>
    </Card>



    <AdminStrategyPage />
    {/if}
    <Card>
        <SectionHeader
                title="Подключение OKX"
                subtitle="API-ключи и базовые торговые параметры"
        >
            <svelte:fragment slot="actions">
                <div class="inline-actions">
                    <Button
                            variant="ghost"
                            on:click={resetDraft}
                            disabled={!draftUser || $settingsStore.saving}
                    >
                        Сбросить
                    </Button>

                    <Button
                            variant="primary"
                            on:click={saveApiKeys}
                            disabled={!draftUser || $settingsStore.saving}
                    >
                        {$settingsStore.saving ? 'Сохраняем...' : 'Сохранить'}
                    </Button>
                </div>
            </svelte:fragment>
        </SectionHeader>

        {#if trading}
            <div class="form-grid">
                <label class="field">
                    <span>OKX API key</span>
                    <input
                            type="text"
                            bind:value={trading.okx_api_key}
                            placeholder="Введите API key"
                    />
                </label>

                <label class="field">
                    <span>OKX API secret</span>
                    <input
                            type="password"
                            bind:value={trading.okx_api_secret}
                            placeholder="Введите API secret"
                    />
                </label>

                <label class="field">
                    <span>OKX Passphrase</span>
                    <input
                            type="password"
                            bind:value={trading.okx_passphrase}
                            placeholder="Введите passphrase"
                    />
                </label>
            </div>
        {:else}
            <Card className="inner-card">
                <div class="empty">Настройки подключения пока не загружены</div>
            </Card>
        {/if}
    </Card>
        <TestTradeCard />

</div>

<style>
    .stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .info-head,
    .admin-head {
        display: flex;
        gap: 12px;
        align-items: flex-start;
    }

    .icon,
    .action-icon,
    .admin-badge {
        width: 32px;
        height: 32px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .icon {
        background: rgba(29, 78, 216, 0.2);
        color: #60a5fa;
    }

    .admin-badge {
        width: auto;
        min-width: 48px;
        padding: 0 10px;
        background: rgba(52, 211, 153, 0.12);
        color: #34d399;
        border: 1px solid rgba(52, 211, 153, 0.22);
        font-size: 11px;
        font-weight: 700;
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
        line-height: 1.35;
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

    .field input::placeholder {
        color: rgba(255, 255, 255, 0.28);
    }

    .inner-card {
        margin-top: 12px;
    }

    .empty {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.55);
    }
</style>