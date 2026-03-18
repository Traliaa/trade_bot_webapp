<script lang="ts">
  export let label = '';
  export let value = '';
  export let compact = false;
  export let className = '';
  export let valueTone: 'default' | 'success' | 'danger' | 'muted' = 'default';
</script>

<div class={`row ${compact ? 'compact' : ''} ${className}`}>
  <span class="left">{label}</span>
  <span class={`right right--${valueTone}`}>{value}</span>
</div>

<style>
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    min-width: 0;
  }

  .right {
    text-align: right;
    color: var(--text, #fff);
    font-weight: 500;
    min-width: 0;
    word-break: break-word;
  }

  .right--default {
    color: var(--text, #fff);
  }

  .right--success {
    color: #34d399;
  }

  .right--danger {
    color: #fb7185;
  }

  .right--muted {
    color: rgba(255, 255, 255, 0.5);
  }
</style>
