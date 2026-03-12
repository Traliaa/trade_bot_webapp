<script lang="ts">
    import { onMount } from 'svelte';
    import { settingsStore } from '$lib/stores/settings';

    let tab: 'trading' | 'limits' | 'trailing' | 'features' = 'features';

    onMount(() => {
        settingsStore.load();
    });

    async function reload() {
        await settingsStore.load();
    }

    $: settings = $settingsStore.data?.settings;
    $: trading = settings?.TradingSettings;
    $: trailing = settings?.TrailingConfig;
    $: features = settings?.FeatureFlags;

    $: tradingFields = trading
        ? [
            ['Размер позиции', `${trading.position_pct}%`, 'Какая доля баланса используется на вход в сделку.'],
            ['Риск на сделку', `${trading.risk_pct}%`, 'Сколько допускается потерять по стоп-лоссу в одной сделке.'],
            ['Стоп-лосс', `${trading.stop_pct}%`, 'Расстояние до защитного стопа от цены входа.'],
            ['Тейк-профит', `${trading.take_profit_rr}R`, 'Цель по прибыли в единицах риска.'],
            ['Плечо', `x${trading.leverage}`, 'Кредитное плечо биржи.']
        ]
        : [];

    $: limitsFields = trading
        ? [
            ['Лимит позиций', `${trading.max_open_positions}`, 'Максимум одновременно открытых позиций.'],
            ['Лимит лонгов', `${trading.max_long_positions ?? 0}`, 'Ограничение на количество long-позиций.'],
            ['Лимит шортов', `${trading.max_short_positions ?? 0}`, 'Ограничение на количество short-позиций.'],
            ['Таймаут подтверждения', trading.confirm_timeout || '—', 'Сколько ждать подтверждения входа.'],
            ['Пауза по инструменту', trading.cooldown_per_symbol || '—', 'Защита от повторного входа.']
        ]
        : [];

    $: trailingSections = trailing
        ? [
            {
                title: 'Безубыток (BE)',
                items: [
                    ['Триггер', `${trailing.be_trigger_r}R`],
                    ['Сдвиг стопа', `${trailing.be_offset_r}R`]
                ],
                description: 'Перенос стопа в безубыток или небольшой плюс.'
            },
            {
                title: 'Фиксация прибыли (Lock)',
                items: [
                    ['Триггер', `${trailing.lock_trigger_r}R`],
                    ['Сдвиг', `${trailing.lock_offset_r}R`]
                ],
                description: 'Подтягивает стоп и защищает накопленную прибыль.'
            },
            {
                title: 'Выход по времени',
                items: [
                    ['Свечей ожидания', `${trailing.time_stop_bars}`],
                    ['Мин. прогресс', `${trailing.time_stop_min_current_r}R`]
                ],
                description: 'Закрытие позиции, если движение слишком долго не развивается.'
            },
            {
                title: 'Ранний выход',
                items: [
                    ['Ранних свечей', `${trailing.early_time_stop_bars}`],
                    ['Мин. MFE', `${trailing.early_time_stop_min_mfe_r}R`]
                ],
                description: 'Раннее закрытие слабой позиции.'
            },
            {
                title: 'Частичная фиксация',
                items: [
                    ['Включено', trailing.partial_enabled ? 'Да' : 'Нет'],
                    ['Триггер', `${trailing.partial_trigger_r}R`],
                    ['Доля закрытия', `${Math.round((trailing.partial_close_frac ?? 0) * 100)}%`]
                ],
                description: 'Частичное закрытие позиции до полного тейка.'
            }
        ]
        : [];

    $: featureRows = features
        ? [
            ['Защита возле тейка', features.near_tp_protect_enabled],
            ['Симуляция перед входом', features.simulate_before_entry],
            ['График сделки', features.deal_chart_enabled],
            ['Авто-рекомендации', features.auto_recommend_enabled],
            ['PRO режим', features.pro_mode]
        ]
        : [];
</script>

<div class="stack">
    <div class="tabs">
        <button class:active={tab === 'trading'} on:click={() => (tab = 'trading')}>
            Торговля
        </button>
        <button class:active={tab === 'trailing'} on:click={() => (tab = 'trailing')}>
            Сопровождение
        </button>
        <button class:active={tab === 'limits'} on:click={() => (tab = 'limits')}>
            Лимиты
        </button>
        <button class:active={tab === 'features'} on:click={() => (tab = 'features')}>
            Доп. функции
        </button>
    </div>

    {#if $settingsStore.error}
        <section class="card error">
            <div class="title">Ошибка загрузки</div>
            <div class="sub">{$settingsStore.error}</div>
            <button class="reload" on:click={reload}>Повторить</button>
        </section>
    {:else if $settingsStore.loading && !settings}
        <section class="card">
            <div class="title">Загрузка настроек...</div>
            <div class="sub">Получаем актуальные параметры с сервера</div>
        </section>
    {:else if !settings}
        <section class="card">
            <div class="title">Настройки не найдены</div>
            <div class="sub">Сервер не вернул данные пользователя</div>
        </section>
    {:else if tab === 'trading'}
        <section class="card">
            <div class="title">Базовые параметры торговли</div>
            <div class="sub">Размер позиции, риск, стоп, тейк и плечо</div>

            <div class="list">
                {#each tradingFields as [label, value, hint]}
                    <button class="setting-row">
                        <div>
                            <div class="setting-label">{label}</div>
                            <div class="setting-hint">{hint}</div>
                        </div>
                        <div class="setting-value">{value}</div>
                    </button>
                {/each}
            </div>
        </section>
    {:else if tab === 'limits'}
        <section class="card">
            <div class="title">Лимиты и защита</div>
            <div class="sub">Ограничения по позициям и сигналам</div>

            <div class="list">
                {#each limitsFields as [label, value, hint]}
                    <button class="setting-row">
                        <div>
                            <div class="setting-label">{label}</div>
                            <div class="setting-hint">{hint}</div>
                        </div>
                        <div class="setting-value">{value}</div>
                    </button>
                {/each}
            </div>
        </section>
    {:else if tab === 'trailing'}
        <section class="card">
            <div class="title">Сопровождение позиции</div>
            <div class="sub">BE, Lock, time stop, early exit, partial</div>

            <div class="group-list">
                {#each trailingSections as section}
                    <div class="group">
                        <div class="group-title">{section.title}</div>
                        <div class="group-sub">{section.description}</div>

                        <div class="group-items">
                            {#each section.items as [label, value]}
                                <div class="group-row">
                                    <span>{label}</span>
                                    <span>{value}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </section>
    {:else}
        <section class="card">
            <div class="title">Дополнительные функции</div>
            <div class="sub">Вынесены отдельно от торговых настроек</div>

            <div class="list">
                {#each featureRows as [label, enabled]}
                    <div class="toggle-row">
                        <span>{label}</span>
                        <span class:enabled={enabled} class="toggle-state">
              {enabled ? 'Вкл' : 'Выкл'}
            </span>
                    </div>
                {/each}
            </div>
        </section>
    {/if}
</div>

<style>
    .stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
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

    .card {
        border-radius: 20px;
        padding: 14px;
        background: #111827;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .card.error {
        border-color: rgba(239, 68, 68, 0.18);
        background: rgba(239, 68, 68, 0.08);
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

    .reload {
        margin-top: 12px;
        border: 0;
        border-radius: 12px;
        padding: 10px 14px;
        background: #1d4ed8;
        color: white;
        font-size: 13px;
        font-weight: 600;
    }

    .list,
    .group-list {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .setting-row {
        width: 100%;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
        border-radius: 14px;
        padding: 12px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        text-align: left;
    }

    .setting-label {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.88);
    }

    .setting-hint {
        margin-top: 4px;
        font-size: 11px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.45);
    }

    .setting-value {
        font-size: 14px;
        font-weight: 600;
        color: white;
        white-space: nowrap;
    }

    .group {
        border-radius: 14px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .group-title {
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.92);
    }

    .group-sub {
        margin-top: 4px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
    }

    .group-items {
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .group-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        border-radius: 12px;
        padding: 10px 12px;
        background: #0b1220;
        border: 1px solid rgba(255, 255, 255, 0.08);
        font-size: 13px;
        color: rgba(255, 255, 255, 0.82);
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
    }

    .toggle-state {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
    }

    .toggle-state.enabled {
        color: #34d399;
    }
</style>