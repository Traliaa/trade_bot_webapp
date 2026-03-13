<script lang="ts">
    export let padded = true;
    export let variant: 'default' | 'muted' | 'error' | 'success' = 'default';
    export let className = '';
</script>

<div class={`card ${variant} ${padded ? 'padded' : ''} ${className}`}>
    <slot />
</div>

<style>
    .card {
        background: var(--bg-card);
        border-radius: 16px;
        padding: 14px;
        border: 1px solid var(--border);

        color: var(--text-main);
    }
    .padded {
        padding: 14px;
    }

    .muted {
        background: var(--card-soft);
    }

    .error {
        background: rgba(239, 68, 68, 0.08);
        border-color: rgba(239, 68, 68, 0.2);
    }

    .success {
        background: rgba(52, 211, 153, 0.08);
        border-color: rgba(52, 211, 153, 0.2);
    }
</style>