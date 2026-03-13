<script lang="ts">
    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
    import { hapticLight, hapticSuccess, hapticError } from '$lib/telegram/haptics';

    export let rejects: any;
    export let onReset: () => Promise<void>;

    let loading = false;
    let error: string | null = null;

    async function handleReset() {
        loading = true;
        error = null;
        hapticLight();

        try {
            await onReset();
            hapticSuccess();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось сбросить статистику';
            hapticError();
        } finally {
            loading = false;
        }
    }

    function entriesFromRejects(obj: any): Array<[string, number]> {
        if (!obj || typeof obj !== 'object') return [];

        const source =
            obj.reasons ??
            obj.counts ??
            obj.items ??
            obj;

        return Object.entries(source)
            .filter(([, v]) => typeof v === 'number')
            .sort((a, b) => Number(b[1]) - Number(a[1])) as Array<[string, number]>;
    }

    $: rows = entriesFromRejects(rejects);
    $: maxValue = rows.length ? Math.max(...rows.map(([, v]) => v)) : 1;
</script>

<Card>
    <SectionHeader
            title="Reject statistics"
            subtitle="Причины отклонения сигналов стратегии"
    >
        <svelte:fragment slot="actions">
            <Button variant="ghost" on:click={handleReset} disabled={loading}>
                {loading ? '...' : 'Сбросить'}
            </Button>
        </svelte:fragment>
    </SectionHeader>

    {#if error}
        <Card variant="error" className="inner-card">
            <div class="error-text">{error}</div>
        </Card>
    {/if}

    {#if rows.length > 0}
        <div class="chart">
            {#each rows as [key, value]}
                <div class="chart-row">
                    <div class="chart-head">
                        <span class="label">{key}</span>
                        <span class="value">{value}</span>
                    </div>

                    <div class="track">
                        <div class="fill" style={`width:${(value / maxValue) * 100}%`}></div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <Card className="inner-card">
            <div class="empty">Нет данных reject статистики</div>
        </Card>
    {/if}
</Card>

<style>
    .inner-card {
        margin-top: 12px;
    }

    .error-text {
        font-size: 13px;
        color: var(--danger);
    }

    .empty {
        font-size: 13px;
        color: var(--text-muted);
    }

    .chart {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 12px;
    }

    .chart-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .chart-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 12px;
    }

    .label {
        color: var(--text-soft);
    }

    .value {
        color: var(--text-main);
        font-weight: 600;
    }

    .track {
        height: 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        overflow: hidden;
    }

    .fill {
        height: 100%;
        border-radius: 999px;
        background: var(--accent);
    }
</style>