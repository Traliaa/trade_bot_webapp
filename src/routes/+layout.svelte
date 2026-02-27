<script lang="ts">
    import { onMount } from "svelte";
    import { initTelegram } from "$lib/stores/telegram";
    import TgThemeSync from "$lib/components/TgThemeSync.svelte";
    import AppShell from "$lib/components/AppShell.svelte";

    onMount(async () => {
        initTelegram();
        await loginViaTelegram();
    });
</script>

<TgThemeSync />

<AppShell>
    <slot />
</AppShell>