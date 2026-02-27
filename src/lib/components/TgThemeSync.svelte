<script lang="ts">
    import { tgTheme } from "$lib/stores/telegram";

    $: theme = $tgTheme;

    $: if (typeof document !== "undefined") {
        const root = document.documentElement;

        if (theme.bgColor) root.style.setProperty("--tg-bg", theme.bgColor);
        if (theme.textColor) root.style.setProperty("--tg-text", theme.textColor);
        if (theme.hintColor) root.style.setProperty("--tg-hint", theme.hintColor);
        if (theme.linkColor) root.style.setProperty("--tg-link", theme.linkColor);
        if (theme.buttonColor) root.style.setProperty("--tg-btn", theme.buttonColor);
        if (theme.buttonTextColor) root.style.setProperty("--tg-btn-text", theme.buttonTextColor);

        // если потом будешь использовать Tailwind dark:
        if (theme.colorScheme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
    }
</script>

<!-- Ничего не рендерим -->