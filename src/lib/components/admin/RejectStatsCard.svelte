<script lang="ts">
    export let rejects: any;
    export let onReset: () => Promise<void>;
</script>

<section class="card">

    <div class="header">
        <div>Reject statistics</div>
        <button on:click={onReset}>reset</button>
    </div>

    {#if rejects}

        {#each Object.entries(rejects.reasons ?? {}) as [k,v]}
            <div class="row">
                <span>{k}</span>
                <span>{v}</span>
            </div>
        {/each}

    {/if}

</section>

<style>

    .card{
        padding:14px;
        border-radius:16px;
        background:#111827;
    }

    .header{
        display:flex;
        justify-content:space-between;
        margin-bottom:10px;
    }

    .row{
        display:flex;
        justify-content:space-between;
        padding:6px 0;
    }

</style>