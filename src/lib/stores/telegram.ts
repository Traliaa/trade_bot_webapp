import { writable } from "svelte/store";
import { getTelegram, waitForUnsafeUser, type TgWebApp } from "$lib/telegram";

export const tg = writable<TgWebApp | null>(null);
export const tgUser = writable<any | null>(null);
export const tgReady = writable(false);

// debug (врем)
export const tgDebug = writable<any>({});


export async function waitForInitData(timeoutMs = 1500): Promise<string> {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        const initData = window.Telegram?.WebApp?.initData;
        if (initData && initData.length > 0) return initData;
        await new Promise((r) => setTimeout(r, 50));
    }

    return window.Telegram?.WebApp?.initData ?? "";
}




export async function initTelegram() {
    const app = getTelegram();

    // Если Mini App открыт НЕ в Telegram — это не "ready"
    if (!app) {
        tg.set(null as any);        // если tg store типизирован под TelegramWebApp, подстрой
        tgUser.set(null);
        tgReady.set(false);
        return;
    }

    app.ready();
    app.expand();

    tg.set(app);
    readTheme(app);

    // Пробуем взять user сразу (часто он уже есть)
    let u = app.initDataUnsafe?.user ?? null;

    // Если нет — ждём, но с понятным таймаутом
    if (!u) {
        u = await waitForUnsafeUser({ timeoutMs: 2000, intervalMs: 50 });
    }

    tgUser.set(u);

    // tgReady = true только после установки tgUser (даже если он null)
    tgReady.set(true);
}
// export function initTelegram() {
//     const app = getTelegram();
//
//     const debug = {
//         hasWebApp: Boolean(app),
//         initDataLen: app?.initData?.length ?? 0,
//         initData: app?.initData ?? "",
//         initDataUnsafe: app?.initDataUnsafe ?? null,
//         user: app?.initDataUnsafe?.user ?? null,
//         platform: app?.platform ?? null,
//         version: app?.version ?? null,
//         colorScheme: app?.colorScheme ?? null,
//     };
//
//     console.log("[TG DEBUG]", debug);
//
//     if (!app) {
//         tgReady.set(true);
//         return;
//     }
//
//     app.ready();
//     app.expand();
//
//     tg.set(app);
//     tgUser.set(app.initDataUnsafe?.user ?? null);
//     tgReady.set(true);
// }


function readTheme(app: any) {
    const theme = app?.themeParams ?? {};
    const root = document.documentElement;

    if (!theme) return;

    if (theme.bg_color) root.style.setProperty("--tg-bg", theme.bg_color);
    if (theme.text_color) root.style.setProperty("--tg-text", theme.text_color);
    if (theme.hint_color) root.style.setProperty("--tg-hint", theme.hint_color);
    if (theme.secondary_bg_color)
        root.style.setProperty("--tg-secondary-bg", theme.secondary_bg_color);
    if (theme.button_color)
        root.style.setProperty("--tg-button", theme.button_color);
}