<script lang="ts">
    import { settingsStore } from '$lib/stores/settings';
    import { hapticLight, hapticSuccess, hapticError } from '$lib/telegram/haptics';

    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import StatusBadge from '$lib/components/ui/StatusBadge.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

    import { trade, type UserSettings } from '$lib/api/tradeApi';

    export let user: UserSettings | null = null;
    export let onReload: () => Promise<void> = async () => {};

    let actionLoading = false;
    let error: string | null = null;

    $: botEnabled = Boolean(user?.Status);
    // $: premium = Boolean(user?.Premium);

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
</script>

<Card>
    <SectionHeader
            title="Управление ботом"
            subtitle="Базовые действия для текущего пользователя"
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

    <div class="actions">
        <Button variant="primary" on:click={toggleBot} disabled={actionLoading || !user}>
            {actionLoading ? '...' : botEnabled ? 'Остановить бота' : 'Запустить бота'}
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
        margin-top: 12px;
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