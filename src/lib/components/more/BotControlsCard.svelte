<script lang="ts">
    import { trade, type TuneMode, type UserSettings } from '$lib/api/tradeApi';
    import { settingsStore } from '$lib/stores/settings';

    export let user: UserSettings | null = null;
    export let tuneMode: TuneMode = 'off';
    export let onTuneChanged: (mode: TuneMode) => void = () => {};
    export let onReload: () => Promise<void> = async () => {};

    let actionLoading = false;
    let error: string | null = null;

    $: botEnabled = Boolean(user?.Status);
    $: premium = Boolean(user?.Premium);

    function prettyTuneMode(mode: TuneMode): string {
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

    async function toggleBot() {
        if (!user) {
            error = 'Пользователь не загружен';
            return;
        }

        actionLoading = true;
        error = null;

        try {
            if (botEnabled) {
                await trade.disableBot();
            } else {
                await trade.enableBot(user);
            }

            await settingsStore.load();
            await onReload();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось переключить бота';
        } finally {
            actionLoading = false;
        }
    }

    async function toggleTune() {
        actionLoading = true;
        error = null;

        try {
            const resp = await trade.toggleTuneMode();
            onTuneChanged(resp.mode ?? tuneMode);
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось переключить режим тюна';
        } finally {
            actionLoading = false;
        }
    }

    async function autoTuneNow() {
        actionLoading = true;
        error = null;

        try {
            await trade.autoTuneNow();
            await onReload();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось выполнить авто-тюн';
        } finally {
            actionLoading = false;
        }
    }
</script>

<section class="card">
    <div class="section-header">
        <div>
            <div class="title">Управление ботом</div>
            <div class="sub">Быстрые действия для текущего пользователя</div>
        </div>

        <span class:success-badge={botEnabled} class:danger-badge={!botEnabled} class="badge">
      {botEnabled ? 'Активен' : 'Остановлен'}
    </span>
    </div>

    {#if error}
        <div class="error">{error}</div>
    {/if}

    <div class="rows">
        <div class="row">
            <span>Имя</span>
            <span>{user?.name || '—'}</span>
        </div>

        <div class="row">
            <span>Premium</span>
            <span class:profit={premium}>{premium ? 'Да' : 'Нет'}</span>
        </div>

        <div class="row">
            <span>Режим тюна</span>
            <span>{prettyTuneMode(tuneMode)}</span>
        </div>
    </div>

    <div class="actions">
        <button class="primary" on:click={toggleBot} disabled={actionLoading || !user}>
            {actionLoading ? '...' : botEnabled ? 'Остановить бота' : 'Запустить бота'}
        </button>

        <button class="secondary" on:click={toggleTune} disabled={actionLoading}>
            Переключить тюн
        </button>
    </div>

    <button class="ghost wide" on:click={autoTuneNow} disabled={actionLoading}>
        Выполнить авто-тюн сейчас
    </button>
</section>

<style>
    .card {
        border-radius: 20px;
        padding: 14px;
        background: #111827;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
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

    .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
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

    .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 12px;
    }

    .primary,
    .secondary,
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

    .secondary,
    .ghost {
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.8);
    }

    .wide {
        width: 100%;
        margin-top: 8px;
    }

    .primary:disabled,
    .secondary:disabled,
    .ghost:disabled {
        opacity: 0.6;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 5px 10px;
        font-size: 11px;
    }

    .success-badge {
        color: #34d399;
        background: rgba(52, 211, 153, 0.1);
        border: 1px solid rgba(52, 211, 153, 0.18);
    }

    .danger-badge {
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.18);
    }

    .profit {
        color: #34d399;
    }

    .error {
        border-radius: 14px;
        padding: 12px;
        margin-top: 12px;
        font-size: 13px;
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.2);
    }
</style>