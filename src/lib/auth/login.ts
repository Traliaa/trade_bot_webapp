import { getInitData } from "$lib/telegram";
import { api } from "$lib/api/client";
import { token, authed, authError } from "$lib/stores/auth";

export async function loginViaTelegram() {
    authError.set(null);

    const initData = getInitData();
    if (!initData) {
        authed.set(false);
        authError.set("Нет initData — открой WebApp через кнопку в боте.");
        return;
    }

    try {
        const res = await api<{ token: string }>("/api/tg/session", {
            method: "POST",
            body: JSON.stringify({ initData })
        });

        token.set(res.token);
        authed.set(true);
    } catch (e: any) {
        authed.set(false);
        authError.set(e?.message ?? String(e));
    }
}