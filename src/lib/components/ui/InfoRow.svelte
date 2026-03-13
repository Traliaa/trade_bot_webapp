<script lang="ts">
  export let compact = false;
  export let className = '';
</script>

<div class={`row ${compact ? 'compact' : ''} ${className}`}>
  <span class="left">
    <slot name="label" />
  </span>

  <span class="right">
    <slot name="value" />
  </span>
</div>

<style>
  .row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    border-radius: 14px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border);
    font-size: 13px;
  }

  .compact {
    padding: 10px 12px;
  }

  .left {
    color: var(--text-soft);
  }

  .right {
    text-align: right;
    color: var(--text-main);
  }
  .label {
    color: var(--text-soft);
  }

  .value {
    color: var(--text-main);
  }
</style>