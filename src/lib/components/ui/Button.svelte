<script lang="ts">
    export let type: 'button' | 'submit' | 'reset' = 'button';
    export let variant: 'primary' | 'secondary' | 'ghost' = 'secondary';
    export let wide = false;
    export let disabled = false;
    export let className = '';
</script>

<button
        {type}
        {disabled}
        class={`btn ${variant} ${wide ? 'wide' : ''} ${className}`}
        on:click
>
    <slot />
</button>

<style>
    .btn {
        border-radius: 14px;
        padding: 10px 14px;
        font-size: 13px;
        font-weight: 600;
        transition: 0.15s ease;
    }

    .btn:disabled {
        opacity: 0.6;
    }

    .wide {
        width: 100%;
    }

    .primary {
        border: 0;
        background: var(--accent);
        color: #fff;
    }

    .primary:hover {
        background: var(--accent-hover);
    }

    .secondary,
    .ghost {
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.03);
        color: var(--text-soft);
    }

    .ghost {
        padding: 8px 12px;
        font-size: 12px;
        background: rgba(255, 255, 255, 0.02);
    }
</style>