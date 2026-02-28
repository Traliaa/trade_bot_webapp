import {
    PUBLIC_API_BASE,
    PUBLIC_ADMIN_CHAT_ID,
    PUBLIC_DEV_USER_ID
} from "$env/static/public";


export const API_BASE = PUBLIC_API_BASE ?? "https://api.trade.bot.etk3.xyz";

export const ADMIN_CHAT_ID = Number(PUBLIC_ADMIN_CHAT_ID || "0");

// dev-only fallback (но значение доступно и в прод, просто мы используем только в DEV)
export const DEV_USER_ID = Number(PUBLIC_DEV_USER_ID || "0");