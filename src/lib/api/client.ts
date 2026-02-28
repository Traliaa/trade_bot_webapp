import { token } from "$lib/stores/auth";
import { API_BASE } from "$lib/env/public";

let tokenValue: string | null = null;
token.subscribe((v) => (tokenValue = v));

type ApiOptions = Omit<RequestInit, "headers"> & {
    headers?: Record<string, string>;
};

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
    if (!API_BASE) {
        throw new Error("PUBLIC_API_BASE is not defined");
    }

    const url = new URL(path, API_BASE).toString();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(opts.headers ?? {})
    };

    if (tokenValue) {
        headers["Authorization"] = `Bearer ${tokenValue}`;
    }

    if (typeof window !== "undefined") {
        const initData = window.Telegram?.WebApp?.initData;
        if (initData) headers["X-Tg-Init-Data"] = initData;
    }

    const res = await fetch(url, {
        ...opts,
        headers,
        credentials: "include",
    });

    const text = await res.text();
    let data: any = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!res.ok) {
        const msg =
            typeof data === "string"
                ? data
                : data?.error ?? data?.message ?? `HTTP ${res.status}`;
        throw new Error(msg);
    }

    return data as T;
}