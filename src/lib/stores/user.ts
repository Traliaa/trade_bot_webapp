import { derived } from "svelte/store";
import { tgUser } from "$lib/stores/telegram";
import { me } from "$lib/stores/auth";
import { DEV_USER_ID } from "$lib/env/public";

export const userId = derived([tgUser, me], ([$tgUser, $me]) => {
    return $tgUser?.id ?? $me?.id ?? (import.meta.env.DEV ? DEV_USER_ID : null);
});