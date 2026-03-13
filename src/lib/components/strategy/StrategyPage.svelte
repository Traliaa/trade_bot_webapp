<script lang="ts">
    import { onMount } from 'svelte';
    import { settingsStore } from '$lib/stores/settings';
    import type { UserSettings } from '$lib/api/tradeApi';
    import { hapticLight, hapticSuccess, hapticError, hapticSelection } from '$lib/telegram/haptics';

    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

    let tab: 'trading' | 'limits' | 'trailing' | 'features' = 'trading';
    let draftUser: UserSettings | null = null;
    let saveError: string | null = null;
    let saveSuccess = false;

    onMount(() => {
        settingsStore.load();
    });

    function cloneUser<T>(value: T): T {
        if (typeof structuredClone !== 'undefined') {
            return structuredClone(value);
        }
        return JSON.parse(JSON.stringify(value));
    }

    $: if ($settingsStore.data && !draftUser) {
        draftUser = cloneUser($settingsStore.data);
    }

    $: settings = draftUser?.settings;
    $: trading = settings?.TradingSettings;
    $: trailing = settings?.TrailingConfig;
    $: features = settings?.FeatureFlags;

    function setTab(next: typeof tab) {
        tab = next;
        hapticSelection();
    }

    function resetDraft() {
        if ($settingsStore.data) {
            draftUser = cloneUser($settingsStore.data);
            saveError = null;
            saveSuccess = false;
            hapticLight();
        }
    }

    async function reload() {
        draftUser = null;
        saveError = null;
        saveSuccess = false;
        await settingsStore.load();
    }

    async function save() {
        if (!draftUser) return;

        saveError = null;
        saveSuccess = false;
        hapticLight();

        try {
            await settingsStore.save(draftUser);
            draftUser = cloneUser(draftUser);
            saveSuccess = true;
            hapticSuccess();
        } catch (e) {
            saveError = e instanceof Error ? e.message : 'Не удалось сохранить настройки';
            hapticError();
        }
    }

    function toPercent(v: number | undefined): number {
        if (typeof v !== 'number' || Number.isNaN(v)) return 0;
        return Math.round(v * 100);
    }

    function fromPercent(v: number): number {
        if (!Number.isFinite(v)) return 0;
        return v / 100;
    }
</script>

<div class="stack">
    <div class="topbar">
        <div>
            <div class="page-title">Стратегия</div>
            <div class="page-sub">Настройки торговли и сопровождения</div>
        </div>

        <div class="top-actions">
            <Button variant="ghost" on:click={resetDraft} disabled={$settingsStore.loading || $settingsStore.saving || !draftUser}>
                Сбросить
            </Button>
            <Button variant="primary" on:click={save} disabled={$settingsStore.loading || $settingsStore.saving || !draftUser}>
                {$settingsStore.saving ? 'Сохраняем...' : 'Сохранить'}
            </Button>
        </div>
    </div>

    <div class="tabs">
        <button class:active={tab === 'trading'} on:click={() => setTab('trading')}>Торговля</button>
        <button class:active={tab === 'limits'} on:click={() => setTab('limits')}>Лимиты</button>
        <button class:active={tab === 'trailing'} on:click={() => setTab('trailing')}>Сопровождение</button>
        <button class:active={tab === 'features'} on:click={() => setTab('features')}>Доп. функции</button>
    </div>

    {#if saveError}
        <Card variant="error">
            <div class="title">Ошибка сохранения</div>
            <div class="sub">{saveError}</div>
        </Card>
    {/if}

    {#if saveSuccess}
        <Card variant="success">
            <div class="title">Сохранено</div>
            <div class="sub">Настройки успешно обновлены</div>
        </Card>
    {/if}

    {#if $settingsStore.error}
        <Card variant="error">
            <div class="title">Ошибка загрузки</div>
            <div class="sub">{$settingsStore.error}</div>
            <div class="top-gap">
                <Button variant="primary" on:click={reload}>Повторить</Button>
            </div>
        </Card>
    {:else if $settingsStore.loading && !draftUser}
        <Card>
            <div class="title">Загрузка настроек...</div>
            <div class="sub">Получаем актуальные параметры с сервера</div>
        </Card>
    {:else if !draftUser || !trading || !trailing || !features}
        <Card>
            <div class="title">Настройки не найдены</div>
            <div class="sub">Сервер не вернул данные пользователя</div>
        </Card>
    {:else if tab === 'trading'}
        <Card>
            <SectionHeader
                    title="Базовые параметры торговли"
                    subtitle="Размер позиции, риск, стоп, тейк и плечо"
            />

            <div class="form-grid">
                <label class="field">
                    <span>Размер позиции, %</span>
                    <input type="number" step="0.01" bind:value={trading.position_pct} />
                </label>

                <label class="field">
                    <span>Риск на сделку, %</span>
                    <input type="number" step="0.01" bind:value={trading.risk_pct} />
                </label>

                <label class="field">
                    <span>Стоп-лосс, %</span>
                    <input type="number" step="0.01" bind:value={trading.stop_pct} />
                </label>

                <label class="field">
                    <span>Тейк-профит, R</span>
                    <input type="number" step="0.01" bind:value={trading.take_profit_rr} />
                </label>

                <label class="field">
                    <span>Плечо</span>
                    <input type="number" step="1" bind:value={trading.leverage} />
                </label>
            </div>
        </Card>
    {:else if tab === 'limits'}
        <Card>
            <SectionHeader
                    title="Лимиты и защита"
                    subtitle="Ограничения по позициям и сигналам"
            />

            <div class="form-grid">
                <label class="field">
                    <span>Макс. позиций</span>
                    <input type="number" step="1" bind:value={trading.max_open_positions} />
                </label>

                <label class="field">
                    <span>Макс. лонгов</span>
                    <input type="number" step="1" bind:value={trading.max_long_positions} />
                </label>

                <label class="field">
                    <span>Макс. шортов</span>
                    <input type="number" step="1" bind:value={trading.max_short_positions} />
                </label>

                <label class="field">
                    <span>Таймаут подтверждения</span>
                    <input type="text" bind:value={trading.confirm_timeout} placeholder="30s / 10m / 1h" />
                </label>

                <label class="field">
                    <span>Пауза по инструменту</span>
                    <input type="text" bind:value={trading.cooldown_per_symbol} placeholder="30s / 10m / 1h" />
                </label>
            </div>
        </Card>
    {:else if tab === 'trailing'}
        <Card>
            <SectionHeader
                    title="Сопровождение позиции"
                    subtitle="BE, Lock, time stop, early exit, partial"
            />

            <div class="group">
                <div class="group-title">Безубыток (BE)</div>
                <div class="form-grid">
                    <label class="field">
                        <span>BE trigger, R</span>
                        <input type="number" step="0.01" bind:value={trailing.be_trigger_r} />
                    </label>

                    <label class="field">
                        <span>BE offset, R</span>
                        <input type="number" step="0.01" bind:value={trailing.be_offset_r} />
                    </label>
                </div>
            </div>

            <div class="group">
                <div class="group-title">Фиксация прибыли (Lock)</div>
                <div class="form-grid">
                    <label class="field">
                        <span>Lock trigger, R</span>
                        <input type="number" step="0.01" bind:value={trailing.lock_trigger_r} />
                    </label>

                    <label class="field">
                        <span>Lock offset, R</span>
                        <input type="number" step="0.01" bind:value={trailing.lock_offset_r} />
                    </label>
                </div>
            </div>

            <div class="group">
                <div class="group-title">Выход по времени</div>
                <div class="form-grid">
                    <label class="field">
                        <span>Свечей ожидания</span>
                        <input type="number" step="1" bind:value={trailing.time_stop_bars} />
                    </label>

                    <label class="field">
                        <span>Мин. прогресс, R</span>
                        <input type="number" step="0.01" bind:value={trailing.time_stop_min_current_r} />
                    </label>
                </div>
            </div>

            <div class="group">
                <div class="group-title">Ранний выход</div>
                <div class="form-grid">
                    <label class="field">
                        <span>Ранних свечей</span>
                        <input type="number" step="1" bind:value={trailing.early_time_stop_bars} />
                    </label>

                    <label class="field">
                        <span>Мин. MFE, R</span>
                        <input type="number" step="0.01" bind:value={trailing.early_time_stop_min_mfe_r} />
                    </label>
                </div>
            </div>

            <div class="group">
                <div class="group-title">Частичная фиксация</div>
                <div class="form-grid">
                    <label class="field checkbox">
                        <span>Включено</span>
                        <input type="checkbox" bind:checked={trailing.partial_enabled} />
                    </label>

                    <label class="field">
                        <span>Триггер, R</span>
                        <input type="number" step="0.01" bind:value={trailing.partial_trigger_r} />
                    </label>

                    <label class="field">
                        <span>Доля закрытия, %</span>
                        <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={toPercent(trailing.partial_close_frac)}
                                on:input={(e) => {
                const target = e.currentTarget as HTMLInputElement;
                trailing.partial_close_frac = fromPercent(Number(target.value));
              }}
                        />
                    </label>
                </div>
            </div>
        </Card>
    {:else}
        <Card>
            <SectionHeader
                    title="Дополнительные функции"
                    subtitle="Флаги поведения интерфейса и логики"
            />

            <div class="toggle-list">
                <label class="toggle-row">
                    <span>Защита возле тейка</span>
                    <input type="checkbox" bind:checked={features.near_tp_protect_enabled} />
                </label>

                <label class="toggle-row">
                    <span>Симуляция перед входом</span>
                    <input type="checkbox" bind:checked={features.simulate_before_entry} />
                </label>

                <label class="toggle-row">
                    <span>График сделки</span>
                    <input type="checkbox" bind:checked={features.deal_chart_enabled} />
                </label>

                <label class="toggle-row">
                    <span>Авто-рекомендации</span>
                    <input type="checkbox" bind:checked={features.auto_recommend_enabled} />
                </label>

                <label class="toggle-row">
                    <span>PRO режим</span>
                    <input type="checkbox" bind:checked={features.pro_mode} />
                </label>
            </div>
        </Card>
    {/if}
</div>

<style>
    .stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .topbar {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
    }

    .page-title {
        font-size: 18px;
        font-weight: 700;
        color: #fff;
    }

    .page-sub {
        margin-top: 2px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
    }

    .top-actions {
        display: flex;
        gap: 8px;
    }

    .tabs {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
        padding: 4px;
        border-radius: 16px;
        background: #111827;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .tabs button {
        border: 0;
        border-radius: 12px;
        padding: 10px 6px;
        background: transparent;
        color: rgba(255, 255, 255, 0.6);
        font-size: 12px;
    }

    .tabs button.active {
        background: #1d4ed8;
        color: #fff;
    }

    .top-gap {
        margin-top: 12px;
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
    .field input[type='number'] {
        height: 42px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
        color: #fff;
        padding: 0 12px;
        font-size: 14px;
    }

    .checkbox {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        border-radius: 14px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .group {
        margin-top: 14px;
        border-radius: 16px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .group-title {
        font-size: 14px;
        font-weight: 600;
        color: #fff;
    }

    .toggle-list {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .toggle-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        border-radius: 14px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 14px;
        color: rgba(255, 255, 255, 0.85);
    }
</style>