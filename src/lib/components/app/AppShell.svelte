<script lang="ts">
    import BottomNav from '$lib/components/app/BottomNav.svelte';
    import TgThemeSync from '$lib/components/telegram/TgThemeSync.svelte';
</script>

<TgThemeSync />

<div class="app-shell">
    <main class="app-content">
        <slot />
    </main>

    <BottomNav />
</div>

<style>
    :global(:root) {
        --tg-bg: #0b1220;
        --tg-bg-secondary: #111827;
        --tg-text: #ffffff;
        --tg-hint: rgba(255, 255, 255, 0.55);
        --tg-link: #60a5fa;
        --tg-button: #1d4ed8;
        --tg-button-text: #ffffff;
    }

    .app-shell {
        min-height: 100dvh;
        background: var(--tg-bg);
        color: var(--tg-text);
    }

    .app-content {
        padding: 12px 12px 84px;
    }
</style>