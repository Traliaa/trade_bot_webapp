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
        border-radius: 12px;
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
        background: var(--tg-button, #1d4ed8);
        color: var(--tg-button-text, #fff);
    }

    .secondary,
    .ghost {
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.8);
    }

    .ghost {
        padding: 8px 12px;
        font-size: 12px;
    }
</style>