<script lang="ts">
    import { onMount } from 'svelte';
    import { adminTradeApi } from '$lib/api/adminTradeApi';
    import type { TuneMode } from '$lib/api/tradeApi';

    import Card from '$lib/components/ui/Card.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
    import Button from '$lib/components/ui/Button.svelte';

    import TuneModeCard from './TuneModeCard.svelte';
    import RejectStatsCard from './RejectStatsCard.svelte';
    import RuntimeTuningCard from './RuntimeTuningCard.svelte';

    let loading = true;
    let error: string | null = null;

    let tuneMode: TuneMode = 'off';
    let runtime: any = null;
    let rejects: any = null;
    let lastAutoTune: any = null;

    onMount(load);

    async function load() {
        loading = true;
        error = null;

        try {
            const [mode, tuning, rej] = await Promise.all([
                adminTradeApi.tuneMode(),
                adminTradeApi.strategyTuning(),
                adminTradeApi.strategyRejects(false)
            ]);

            tuneMode = mode.mode;
            runtime = tuning.runtime;
            rejects = rej;
        } catch (e) {
            error = e instanceof Error ? e.message : 'load failed';
        } finally {
            loading = false;
        }
    }

    async function toggleTune() {
        const r = await adminTradeApi.toggleTuneMode();
        tuneMode = r.mode;
    }

    async function autoTune() {
        lastAutoTune = await adminTradeApi.autoTuneNow();
        await load();
    }

    async function resetRejects() {
        rejects = await adminTradeApi.strategyRejects(true);
    }
</script>

<div class="stack">
    <Card>
        <SectionHeader
                title="Admin Strategy"
                subtitle="Тюн стратегии и reject статистика доступны только админу"
        >
            <svelte:fragment slot="actions">
                <Button variant="ghost" on:click={load} disabled={loading}>
                    {loading ? '...' : 'Обновить'}
                </Button>
            </svelte:fragment>
        </SectionHeader>

        {#if error}
            <Card variant="error" className="inner-card">
                <div class="error-text">{error}</div>
            </Card>
        {/if}
    </Card>

    <TuneModeCard
            {tuneMode}
            {lastAutoTune}
            onToggle={toggleTune}
            onAutoTune={autoTune}
    />

    <RuntimeTuningCard {runtime} />

    <RejectStatsCard
            {rejects}
            onReset={resetRejects}
    />
</div>

<style>
    .stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
        color: var(--text-main);
    }

    .inner-card {
        margin-top: 12px;
    }

    .error-text {
        font-size: 13px;
        color: var(--danger);
    }
</style>