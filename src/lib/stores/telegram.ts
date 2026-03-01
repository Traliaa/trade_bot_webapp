import { writable } from "svelte/store";
import { getTelegram, getUnsafeUser, type TgWebApp } from "$lib/telegram";

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

export function initTelegram() {
    const app = getTelegram();

    const debug = {
        hasWebApp: Boolean(app),
        initDataLen: app?.initData?.length ?? 0,
        initData: app?.initData ?? "",
        initDataUnsafe: app?.initDataUnsafe ?? null,
        user: app?.initDataUnsafe?.user ?? null,
        platform: app?.platform ?? null,
        version: app?.version ?? null,
        colorScheme: app?.colorScheme ?? null,
    };

    console.log("[TG DEBUG]", debug);

    if (!app) {
        tgReady.set(true);
        return;
    }

    app.ready();
    app.expand();

    tg.set(app);
    tgUser.set(app.initDataUnsafe?.user ?? null);
    tgReady.set(true);
}