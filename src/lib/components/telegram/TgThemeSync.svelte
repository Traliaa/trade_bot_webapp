<script lang="ts">
    import { onMount } from 'svelte';

    function applyTheme() {
        const root = document.documentElement;
        const tg = window.Telegram?.WebApp;
        const theme = tg?.themeParams ?? {};
        const scheme = tg?.colorScheme ?? 'dark';

        root.dataset.tgScheme = scheme;

        if (theme.bg_color) root.style.setProperty('--tg-bg', theme.bg_color);
        if (theme.secondary_bg_color) root.style.setProperty('--tg-bg-secondary', theme.secondary_bg_color);
        if (theme.text_color) root.style.setProperty('--tg-text', theme.text_color);
        if (theme.hint_color) root.style.setProperty('--tg-hint', theme.hint_color);
        if (theme.link_color) root.style.setProperty('--tg-link', theme.link_color);
        if (theme.button_color) root.style.setProperty('--tg-button', theme.button_color);
        if (theme.button_text_color) root.style.setProperty('--tg-button-text', theme.button_text_color);
    }

    onMount(() => {
        applyTheme();

        const tg = window.Telegram?.WebApp;
        const handler = () => applyTheme();

        tg?.onEvent?.('themeChanged', handler);

        return () => {
            tg?.offEvent?.('themeChanged', handler);
        };
    });
</script>

<!-- Ничего не рендерим -->