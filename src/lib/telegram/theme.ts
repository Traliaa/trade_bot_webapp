export function applyTelegramTheme() {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    try {
        tg.setHeaderColor?.('#020817');
        tg.setBackgroundColor?.('#020817');
        tg.ready?.();
        tg.expand?.();
        tg.disableVerticalSwipes?.();
    } catch (e) {
        console.warn('telegram theme apply failed', e);
    }
}