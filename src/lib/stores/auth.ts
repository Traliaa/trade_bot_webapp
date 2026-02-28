import { writable } from "svelte/store";

export const token = writable<string | null>(null);
export const authed = writable(false);
export const authError = writable<string | null>(null);

// можно хранить базовую инфу о пользователе (tg или профиль с бэка)
export const me = writable<any | null>(null);