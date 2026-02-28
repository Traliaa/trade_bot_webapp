<script lang="ts">
    export let positionsCount = 0;
    export let tuneMode: string | null = null;
    export let loading = false;

    export let onRefresh: (() => void) | null = null;
    export let onToggleTune: (() => void) | null = null;
</script>

<section class="wrap">
    <div class="top">
        <div>
            <div class="title">Статус</div>
            <div class="value">
                {#if loading}
                    Обновляю…
                {:else}
                    Активных позиций: <b>{positionsCount}</b>
                {/if}
            </div>
        </div>

        <div class="chip">
            <div class="k">Tune</div>
            <div class="v">{tuneMode ?? "—"}</div>
        </div>
    </div>

    <div class="actions">
        <button class="btn ghost" type="button" on:click={() => onRefresh?.()}>
            Обновить
        </button>
        <button class="btn" type="button" on:click={() => onToggleTune?.()}>
            Toggle tune
        </button>
    </div>
</section>

<style>
    .wrap{
        background: var(--tg-bg);
        border-radius: 18px;
        padding: 14px;
        border: 1px solid var(--tg-hint);
        margin-bottom: 12px;
    }

    .top{
        display:flex;
        justify-content:space-between;
        gap: 12px;
        align-items:flex-start;
    }

    .title{
        font-size: 12px;
        color: var(--tg-hint);
        font-weight: 700;
    }

    .value{
        margin-top: 6px;
        color: var(--tg-text);
        font-size: 14px;
        font-weight: 700;
    }

    .chip{
        background: var(--tg-secondary-bg);
        border: 1px solid var(--tg-hint);
        border-radius: 14px;
        padding: 8px 10px;
        min-width: 92px;
        text-align: right;
    }

    .chip .k{
        font-size: 11px;
        color: var(--tg-hint);
        font-weight: 700;
    }

    .chip .v{
        margin-top: 2px;
        font-size: 12px;
        color: var(--tg-text);
        font-weight: 800;
    }

    .actions{
        display:flex;
        gap: 10px;
        margin-top: 12px;
    }

    .btn{
        flex: 1;
        padding: 10px 12px;
        border-radius: 14px;
        font-size: 13px;
        font-weight: 800;
        background: var(--tg-button);
        color: var(--tg-button-text);
        border: 1px solid var(--tg-button);
    }

    .btn.ghost{
        background: transparent;
        color: var(--tg-text);
        border-color: var(--tg-hint);
    }
</style>