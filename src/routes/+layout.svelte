<script lang="ts">
    import { onMount } from "svelte";
    import { initTelegram } from "$lib/stores/telegram";
    import { loginViaTelegram } from "$lib/auth/login";
    import TgThemeSync from "$lib/components/TgThemeSync.svelte";
    import AppShell from "$lib/components/AppShell.svelte";

    onMount(async () => {
        await initTelegram();      // ✅ важно
        await loginViaTelegram();
    });
</script>

<TgThemeSync />

<AppShell>
    <slot />
</AppShell>