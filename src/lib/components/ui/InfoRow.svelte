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
    }

    .success {
        color: #34d399;
        background: rgba(52, 211, 153, 0.1);
        border: 1px solid rgba(52, 211, 153, 0.18);
    }

    .danger {
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.18);
    }

    .neutral {
        color: rgba(255, 255, 255, 0.75);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }
</style>