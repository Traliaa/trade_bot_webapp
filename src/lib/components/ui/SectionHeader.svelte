<script lang="ts">
    export let title = '';
    export let subtitle = '';
</script>

<div class="section-header">
    <div>
        <div class="title">{title}</div>
        {#if subtitle}
            <div class="sub">{subtitle}</div>
        {/if}
    </div>

    <div class="actions">
        <slot name="actions" />
    </div>
</div>

<style>
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
    }

    .title {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-main);
    }

    .sub {
        margin-top: 2px;
        font-size: 12px;
        color: var(--text-muted);
    }

    .actions {
        display: flex;
        gap: 8px;
        align-items: center;

    }
    .title {
        color: var(--text-main);
    }

    .subtitle {
        color: var(--text-muted);
    }
</style>