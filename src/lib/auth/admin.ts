import { ADMIN_CHAT_ID } from '$lib/env/public';
import { derived } from 'svelte/store';
import { tgUser } from '$lib/stores/telegram';
import { authed, me } from '$lib/stores/auth';

// UI visibility only; server authorization must still protect admin operations.
export const adminAccess = derived([authed, tgUser, me], ([$authed, $tgUser, $me]) =>
    $authed && isAdminUserId($tgUser?.id ?? $me?.id)
);

export function isAdminUserId(userId?: number | null): boolean {
    if (!ADMIN_CHAT_ID) return false;
    if (!userId) return false;
    return Number(userId) === ADMIN_CHAT_ID;
}
