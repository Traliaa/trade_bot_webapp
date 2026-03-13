import { getUnsafeUser } from "$lib/telegram";
import { api } from "$lib/api/client";
import { token, authed, authError, me } from "$lib/stores/auth";
import { waitForInitData } from "$lib/stores/telegram";

const isDev = import.meta.env.DEV;

async function loginViaDev() {
    const res = await api<{ token: string }>("/api/dev/session", {
        method: "POST",
        body: "{}"
    });

    token.set(res.token);
    authed.set(true);

    me.set({
        id: 213532199,
        first_name: "Aleksey",
        username: "dev"
    } as any);
}

export async function loginViaTelegram() {
    authError.set(null);

    const initData = await waitForInitData();

    if (!initData) {
        if (isDev) {
            try {
                await loginViaDev();
                return;
            } catch (e: any) {
                authed.set(false);
                authError.set(e?.message ?? String(e));
                return;
            }
        }

        authed.set(false);

        const u = getUnsafeUser();
        authError.set(
            u
                ? "Есть Telegram user, но нет initData. Открой mini app через кнопку WebApp в боте."
                : "Нет initData — открой WebApp через кнопку в боте."
        );
        return;
    }

    try {
        const res = await api<{ token: string }>("/api/tg/session", {
            method: "POST",
            body: JSON.stringify({ initData })
        });

        token.set(res.token);
        authed.set(true);
        me.set(getUnsafeUser());
    } catch (e: any) {
        authed.set(false);
        authError.set(e?.message ?? String(e));
    }
}