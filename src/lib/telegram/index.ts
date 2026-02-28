export type TgWebApp = any;

export function getTelegram(): TgWebApp | null {
    if (typeof window === "undefined") return null;
    return (window as any).Telegram?.WebApp ?? null;
}

export function getInitData(): string {
    const app = getTelegram();
    return app?.initData ?? "";
}

export function getUnsafeUser(): any | null {
    const app = getTelegram();
    return app?.initDataUnsafe?.user ?? null;
}