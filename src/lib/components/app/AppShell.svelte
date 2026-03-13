<script lang="ts">
    import BottomNav from '$lib/components/app/BottomNav.svelte';
</script>

<div class="app-shell">
    <main class="app-content">
        <slot />
    </main>

    <BottomNav />
</div>

<style>
    .app-shell {
        min-height: 100dvh;
        background: var(--app-bg);
        color: var(--text-main);
    }

    .app-content {
        padding: 12px 12px 92px;
    }
</style>