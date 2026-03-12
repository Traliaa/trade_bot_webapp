<script lang="ts">
    import { onMount } from "svelte";

    onMount(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        const applyTheme = () => {
            const p = tg.themeParams;

            const root = document.documentElement;

            if (!tg && import.meta.env.DEV) {
                const root = document.documentElement;
                root.style.setProperty("--tg-bg", "#0b1220");
                root.style.setProperty("--tg-secondary-bg", "#101a2d");
                root.style.setProperty("--tg-text", "#ffffff");
                root.style.setProperty("--tg-hint", "rgba(255,255,255,.55)");
                root.style.setProperty("--tg-button", "#2ea6ff");
                root.style.setProperty("--tg-button-text", "#ffffff");
            }
        };

        applyTheme();
        tg.onEvent("themeChanged", applyTheme);
    });
</script>

<!-- Ничего не рендерим -->