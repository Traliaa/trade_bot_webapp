import { ADMIN_CHAT_ID } from '$lib/env/public';

export function isAdminUserId(userId?: number | null): boolean {
    if (!ADMIN_CHAT_ID) return false;
    if (!userId) return false;
    return Number(userId) === ADMIN_CHAT_ID;
}
