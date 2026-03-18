<script lang="ts">
  export let tone: 'success' | 'danger' | 'neutral' = 'neutral';
</script>

<span class={`badge ${tone}`}>
  <slot />
</span>

<style>
    .badge {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 5px 10px;
        font-size: 11px;
        border: 1px solid transparent;
    }

    .success {
        color: var(--success);
        background: var(--success-soft);
        border-color: rgba(52, 211, 153, 0.18);
    }

    .danger {
        color: var(--danger);
        background: var(--danger-soft);
        border-color: rgba(251, 113, 133, 0.18);
    }

    .neutral {
        color: var(--text-soft);
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--border);
    }
</style>