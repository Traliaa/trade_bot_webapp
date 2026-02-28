import { token } from "$lib/stores/auth";


let tokenValue: string | null = null;
token.subscribe((v) => (tokenValue = v));

type ApiOptions = Omit<RequestInit, "headers"> & {
    headers?: Record<string, string>;
};

// Универсальный api<T>()
export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(opts.headers ?? {})
    };

    // ВАЖНО: передаём initData (только в браузере)
    if (typeof window !== "undefined") {
        const initData = window.Telegram?.WebApp?.initData;
        if (initData) headers["X-Tg-Init-Data"] = initData;
    }

    const res = await fetch(path, {
        ...opts,
        headers,
        // ВАЖНО: чтобы cookie-сессия (если есть) отправлялась
        credentials: "include",
    });

    // попробуем распарсить тело всегда
    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
        const msg = typeof data === "string"
            ? data
            : (data?.error ?? data?.message ?? `HTTP ${res.status}`);
        throw new Error(msg);
    }

    return data as T;
}