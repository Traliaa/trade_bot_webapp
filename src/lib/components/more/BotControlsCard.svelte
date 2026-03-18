<script lang="ts">
    import { settingsStore } from '$lib/stores/settings';
    import { hapticLight, hapticSuccess, hapticError } from '$lib/telegram/haptics';

    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import InfoRow from '$lib/components/ui/InfoRow.svelte';
    import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
    import {adminTradeApi, type TuneMode} from "$lib/api/adminTradeApi";
    import {trade, type UserSettings} from "$lib/api/tradeApi";


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
            hapticError();
            return;
        }

        actionLoading = true;
        error = null;
        hapticLight();

        try {
            if (botEnabled) {
                await trade.disableBot();
            } else {
                await trade.enableBot(user);
            }

            await settingsStore.load();
            await onReload();
            hapticSuccess();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось переключить бота';
            hapticError();
        } finally {
            actionLoading = false;
        }
    }

    async function toggleTune() {
        actionLoading = true;
        error = null;
        hapticLight();

        try {
            const resp = await adminTradeApi.toggleTuneMode();
            onTuneChanged(resp.mode ?? tuneMode);
            hapticSuccess();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось переключить режим тюна';
            hapticError();
        } finally {
            actionLoading = false;
        }
    }

    async function autoTuneNow() {
        actionLoading = true;
        error = null;
        hapticLight();

        try {
            await adminTradeApi.autoTuneNow();
            await onReload();
            hapticSuccess();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось выполнить авто-тюн';
            hapticError();
        } finally {
            actionLoading = false;
        }
    }
</script>

<Card>
    <SectionHeader
            title="Управление ботом"
            subtitle="Быстрые действия для текущего пользователя"
    >
        <svelte:fragment slot="actions">
            <StatusBadge tone={botEnabled ? 'success' : 'danger'}>
                {botEnabled ? 'Активен' : 'Остановлен'}
            </StatusBadge>
        </svelte:fragment>
    </SectionHeader>

    {#if error}
        <Card variant="error" className="inner-card">
            <div class="error-text">{error}</div>
        </Card>
    {/if}

    <div class="rows">
        <InfoRow>
            <span slot="label">Имя</span>
            <span slot="value">{user?.name || '—'}</span>
        </InfoRow>

        <InfoRow>
            <span slot="label">Premium</span>
            <span slot="value" class:profit={premium}>{premium ? 'Да' : 'Нет'}</span>
        </InfoRow>

        <InfoRow>
            <span slot="label">Режим тюна</span>
            <span slot="value">{prettyTuneMode(tuneMode)}</span>
        </InfoRow>
    </div>

    <div class="actions">
        <Button variant="primary" on:click={toggleBot} disabled={actionLoading || !user}>
            {actionLoading ? '...' : botEnabled ? 'Остановить бота' : 'Запустить бота'}
        </Button>

        <Button variant="secondary" on:click={toggleTune} disabled={actionLoading}>
            Переключить тюн
        </Button>
    </div>

    <div class="wide-action">
        <Button variant="ghost" wide on:click={autoTuneNow} disabled={actionLoading}>
            Выполнить авто-тюн сейчас
        </Button>
    </div>
</Card>

<style>
    .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
    }

    .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 12px;
    }

    .wide-action {
        margin-top: 8px;
    }

    .inner-card {
        margin-top: 12px;
    }

    .error-text {
        font-size: 13px;
        color: #fca5a5;
    }

    .profit {
        color: #34d399;
    }
</style>