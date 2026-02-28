import { writable } from "svelte/store";
import { getTelegram, getUnsafeUser, type TgWebApp } from "$lib/telegram";

export const tg = writable<TgWebApp | null>(null);
export const tgUser = writable<any | null>(null);
export const tgReady = writable(false);

// debug (врем)
export const tgDebug = writable<any>({});

export function initTelegram() {
    const app = getTelegram();

    // сохраним состояние чтобы видеть, что реально есть
    tgDebug.set({
        hasWindow: typeof window !== "undefined",
        hasTelegram: typeof window !== "undefined" ? Boolean((window as any).Telegram) : false,
        hasWebApp: Boolean(app),
        initDataLen: app?.initData?.length ?? 0,
        initDataUnsafeKeys: app?.initDataUnsafe ? Object.keys(app.initDataUnsafe) : [],
        userPresent: Boolean(app?.initDataUnsafe?.user),
        platform: app?.platform,
        version: app?.version,
    });

    if (!app) {
        tgReady.set(true);
        return;
    }

    try {
        app.ready();
        app.expand();
    } catch {
        // ignore
    }

    tg.set(app);

    // ВАЖНО: читаем user ПОСЛЕ ready/expand
    const u = getUnsafeUser();
    tgUser.set(u);

    tgReady.set(true);
}