<script lang="ts">
    import type { TuneMode } from "$lib/api/tradeApi";

    export let tuneMode: TuneMode;
    export let onToggle: () => Promise<void>;
    export let onAutoTune: () => Promise<void>;
</script>

<section class="card">

    <div class="row">
        <div>Mode</div>
        <div>{tuneMode}</div>
    </div>

    <div class="buttons">

        <button on:click={onToggle}>
            Toggle Mode
        </button>

        <button on:click={onAutoTune}>
            Auto Tune
        </button>

    </div>

</section>

<style>
    .card{
        padding:14px;
        border-radius:16px;
        background:#111827;
    }

    .row{
        display:flex;
        justify-content:space-between;
        margin-bottom:10px;
    }

    .buttons{
        display:flex;
        gap:8px;
    }
</style>