<script lang="ts">
    export let runtime: any;
</script>

<section class="card">

    <div class="title">Runtime tuning</div>

    {#if runtime}

        <div class="row">
            <span>breakout</span>
            <span>{runtime.breakoutPct}</span>
        </div>

        <div class="row">
            <span>channel</span>
            <span>{runtime.minChannelPct}</span>
        </div>

        <div class="row">
            <span>body</span>
            <span>{runtime.minBodyPct}</span>
        </div>

        <div class="row">
            <span>closeUp</span>
            <span>{runtime.closeUpMin}</span>
        </div>

        <div class="row">
            <span>closeDn</span>
            <span>{runtime.closeDnMax}</span>
        </div>

    {/if}

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
        padding:6px 0;
    }
</style>