export type TgWebApp = any;

export function getTelegram(): TgWebApp | null {
    if (typeof window === "undefined") return null;
    return window.Telegram?.WebApp ?? null;
}

/**
 * Безопасно получить initData строку (для бэка).
 */
export function getInitData(): string {
    return getTelegram()?.initData ?? "";
}

/**
 * Пользователь из initDataUnsafe (удобно для UI, но доверять нельзя — доверяем только верификации на бэке).
 */
export function getUnsafeUser(): any | null {
    return getTelegram()?.initDataUnsafe?.user ?? null;
}