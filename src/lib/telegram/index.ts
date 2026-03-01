export type TgWebApp = any;

export function getTelegram(): TgWebApp | null {
    if (typeof window === "undefined") return null;
    return (window as any).Telegram?.WebApp ?? null;
}



export function getUnsafeUser(): any | null {
    const app = getTelegram();
    return app?.initDataUnsafe?.user ?? null;
}


type WaitOpts = { timeoutMs?: number; intervalMs?: number };

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

export async function waitForUnsafeUser(opts: WaitOpts = {}) {
    const timeoutMs = opts.timeoutMs ?? 2000;
    const intervalMs = opts.intervalMs ?? 50;

    const app = getTelegram();
    if (!app) return null;

    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
        const u = app.initDataUnsafe?.user ?? null;
        if (u?.id) return u;
        await sleep(intervalMs);
    }

    return null;
}
