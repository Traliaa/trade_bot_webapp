export function applyTelegramTheme() {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    try {
        tg.setHeaderColor?.('#020817');
        tg.setBackgroundColor?.('#020817');

        document.documentElement.style.setProperty('--tg-theme-bg-color', '#020817');
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#0b1220');
        document.documentElement.style.setProperty('--tg-theme-text-color', '#e5e7eb');
        document.documentElement.style.setProperty('--tg-theme-hint-color', '#9ca3af');
        document.documentElement.style.setProperty('--tg-theme-link-color', '#2563eb');

        tg.ready?.();
        tg.expand?.();
        tg.disableVerticalSwipes?.();
    } catch (e) {
        console.warn('telegram theme apply failed', e);
    }
}