<script lang="ts">
    import { onMount } from "svelte";

    onMount(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        const applyTheme = () => {
            const p = tg.themeParams;

            const root = document.documentElement;

            root.style.setProperty("--tg-bg", p.bg_color);
            root.style.setProperty("--tg-secondary-bg", p.secondary_bg_color);
            root.style.setProperty("--tg-text", p.text_color);
            root.style.setProperty("--tg-hint", p.hint_color);
            root.style.setProperty("--tg-link", p.link_color);
            root.style.setProperty("--tg-button", p.button_color);
            root.style.setProperty("--tg-button-text", p.button_text_color);
        };

        applyTheme();
        tg.onEvent("themeChanged", applyTheme);
    });
</script>

<!-- Ничего не рендерим -->