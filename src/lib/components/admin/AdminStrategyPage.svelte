<script lang="ts">
    import { onMount } from "svelte";
    import { adminTradeApi } from "$lib/api/adminTradeApi";
    import type { TuneMode } from "$lib/api/tradeApi";

    import TuneModeCard from "./TuneModeCard.svelte";
    import RejectStatsCard from "./RejectStatsCard.svelte";
    import RuntimeTuningCard from "./RuntimeTuningCard.svelte";

    let loading = true;
    let error: string | null = null;

    let tuneMode: TuneMode = "off";
    let runtime: any = null;
    let rejects: any = null;

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
            error = e instanceof Error ? e.message : "load failed";
        } finally {
            loading = false;
        }
    }

    async function toggleTune() {
        const r = await adminTradeApi.toggleTuneMode();
        tuneMode = r.mode;
    }

    async function autoTune() {
        await adminTradeApi.autoTuneNow();
        await load();
    }

    async function resetRejects() {
        rejects = await adminTradeApi.strategyRejects(true);
    }
</script>

<section class="stack">

    <div class="title">Admin Strategy</div>

    {#if error}
        <div class="error">{error}</div>
    {/if}

    <TuneModeCard
            {tuneMode}
            onToggle={toggleTune}
            onAutoTune={autoTune}
    />

    <RuntimeTuningCard {runtime} />

    <RejectStatsCard
            {rejects}
            onReset={resetRejects}
    />

</section>

<style>
    .stack {
        display:flex;
        flex-direction:column;
        gap:12px;
    }

    .title{
        font-size:16px;
        font-weight:600;
    }

    .error{
        padding:12px;
        background:#3a1c1c;
        border-radius:12px;
    }
</style>