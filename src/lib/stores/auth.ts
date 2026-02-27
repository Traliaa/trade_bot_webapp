import { writable } from "svelte/store";

export const token = writable<string | null>(null);
export const authed = writable(false);
export const authError = writable<string | null>(null);