import { writable } from "svelte/store";
import { getTelegram, getUnsafeUser, type TgWebApp } from "$lib/telegram";
import { DEV_USER_ID } from "$lib/env/public";

export const tg = writable<TgWebApp | null>(null);
export const tgUser = writable<any | null>(null);
export const tgReady = writable(false);

export const tgTheme = writable<{
    colorScheme: "light" | "dark";
    bgColor?: string;
    textColor?: string;
    hintColor?: string;
    linkColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
}>({ colorScheme: "light" });

function readTheme(app: TgWebApp) {
    const p = app?.themeParams ?? {};
    const scheme = (app?.colorScheme === "dark" ? "dark" : "light") as "light" | "dark";
    tgTheme.set({
        colorScheme: scheme,
        bgColor: p.bg_color,
        textColor: p.text_color,
        hintColor: p.hint_color,
        linkColor: p.link_color,
        buttonColor: p.button_color,
        buttonTextColor: p.button_text_color
    });
}

export function initTelegram() {
    const app = getTelegram();
    if (!app) {
        if (import.meta.env.DEV && DEV_USER_ID) {
            tgUser.set({ id: DEV_USER_ID, first_name: "DEV", last_name: "USER", username: "dev" });
        }
        tgReady.set(true);
        return;
    }

    // Telegram lifecycle
    app.ready();
    app.expand();

    tg.set(app);
    tgUser.set(getUnsafeUser());
    readTheme(app);

    // Theme changes (Telegram can update)
    try {
        app.onEvent?.("themeChanged", () => readTheme(app));
        app.onEvent?.("viewportChanged", () => {
            // можно будет позже читать viewportHeight/StableHeight для safe-area
        });
    } catch {
        // на некоторых клиентах/версиях onEvent может быть недоступен
    }

    tgReady.set(true);
}

export function haptic(type: "light" | "medium" | "heavy" | "rigid" | "soft" = "light") {
    const app = getTelegram();
    app?.HapticFeedback?.impactOccurred?.(type);
}