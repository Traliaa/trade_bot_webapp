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
        color: rgba(255, 255, 255, 0.92);
    }

    .sub {
        margin-top: 2px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
    }

    .actions {
        display: flex;
        gap: 8px;
        align-items: center;
    }
</style>