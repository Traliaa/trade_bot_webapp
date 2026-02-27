import { token } from "$lib/stores/auth";

const API_BASE = import.meta.env.PUBLIC_API_BASE || "http://localhost:8080";

let tokenValue: string | null = null;
token.subscribe((v) => (tokenValue = v));

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers ?? {});
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (tokenValue) headers.set("Authorization", `Bearer ${tokenValue}`);

    const resp = await fetch(`${API_BASE}${path}`, { ...init, headers });
    if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || `HTTP ${resp.status}`);
    }
    if (resp.status === 204) return undefined as T;
    return (await resp.json()) as T;
}