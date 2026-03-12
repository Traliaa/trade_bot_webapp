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
    .app-shell {
        min-height: 100dvh;
        background: #0b1220;
        color: #fff;
    }

    .app-content {
        padding: 12px 12px 84px;
    }
</style>