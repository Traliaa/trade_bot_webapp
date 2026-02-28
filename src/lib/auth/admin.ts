import { tgUser } from "$lib/stores/telegram";
import { get } from "svelte/store";

const ADMIN_CHAT_ID = Number(import.meta.env.PUBLIC_ADMIN_CHAT_ID ?? "213532199");

export function isAdminUserId(userId?: number | null): boolean {
    if (!ADMIN_CHAT_ID) return false;
    if (!userId) return false;
    return Number(userId) === ADMIN_CHAT_ID;
}

export function isAdminNow(): boolean {
    const u = get(tgUser);
    return isAdminUserId(u?.id ?? null);
}