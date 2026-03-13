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
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: var(--tg-bg-secondary, #111827);
    }

    .padded {
        padding: 14px;
    }

    .muted {
        background: #0e1628;
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