<script lang="ts">
    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import InfoRow from '$lib/components/ui/InfoRow.svelte';
    import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
    import { hapticLight, hapticSuccess, hapticError } from '$lib/telegram/haptics';
    import type {TuneMode} from "$lib/api/adminTradeApi";

    export let tuneMode: TuneMode;
    export let lastAutoTune: any = null;
    export let onToggle: () => Promise<void>;
    export let onAutoTune: () => Promise<void>;

    let loading = false;
    let error: string | null = null;

    function prettyMode(mode: TuneMode): string {
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

    async function handleToggle() {
        loading = true;
        error = null;
        hapticLight();

        try {
            await onToggle();
            hapticSuccess();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось переключить режим';
            hapticError();
        } finally {
            loading = false;
        }
    }

    async function handleAutoTune() {
        loading = true;
        error = null;
        hapticLight();

        try {
            await onAutoTune();
            hapticSuccess();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось выполнить авто-тюн';
            hapticError();
        } finally {
            loading = false;
        }
    }
</script>

<Card>
    <SectionHeader
            title="Tune mode"
            subtitle="Управление режимом автотюна и ручной запуск"
    >
        <svelte:fragment slot="actions">
            <StatusBadge tone={tuneMode === 'off' ? 'neutral' : 'success'}>
                {prettyMode(tuneMode)}
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
            <span slot="label">Текущий режим</span>
            <span slot="value">{prettyMode(tuneMode)}</span>
        </InfoRow>

        {#if lastAutoTune}
            <InfoRow>
                <span slot="label">Последний Auto Tune</span>
                <span slot="value">{lastAutoTune.changed ? 'Есть изменения' : 'Без изменений'}</span>
            </InfoRow>
        {/if}
    </div>

    <div class="actions">
        <Button variant="secondary" on:click={handleToggle} disabled={loading}>
            Переключить режим
        </Button>

        <Button variant="primary" on:click={handleAutoTune} disabled={loading}>
            Auto Tune
        </Button>
    </div>

    {#if lastAutoTune?.decision}
        <Card className="inner-card">
            <div class="diff-title">Результат последнего тюна</div>
            <div class="diff-text">
                {#if lastAutoTune.changed}
                    Mode: {lastAutoTune.mode}
                {:else}
                    Изменений нет
                {/if}
            </div>
        </Card>
    {/if}
</Card>

<style>
    .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
        color: var(--text-main);
    }

    .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 12px;
    }

    .inner-card {
        margin-top: 12px;
    }

    .error-text {
        font-size: 13px;
        color: var(--danger);
    }

    .diff-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main);
    }

    .diff-text {
        margin-top: 6px;
        font-size: 12px;
        color: var(--text-muted);
    }
</style>