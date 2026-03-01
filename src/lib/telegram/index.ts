export type TgWebApp = any;

export function getTelegram(): TgWebApp | null {
    if (typeof window === "undefined") return null;
    return (window as any).Telegram?.WebApp ?? null;
}

// export function getInitData(): string {
//     const app = getTelegram();
//     return app?.initData ?? "";
// }

export function getUnsafeUser(): any | null {
    const app = getTelegram();
    return app?.initDataUnsafe?.user ?? null;
}


export async function waitForUnsafeUser(timeoutMs = 1500): Promise<any | null> {
    if (typeof window === "undefined") return null;

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const u = (window as any).Telegram?.WebApp?.initDataUnsafe?.user ?? null;
        if (u?.id) return u;
        await new Promise((r) => setTimeout(r, 50));
    }

    return getUnsafeUser();
}