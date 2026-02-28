import { api } from "$lib/api/client"; // путь подстрой под твой файл с api<T>()

// Типы можешь потом заменить на реальные
export type TuneMode = string;
export type TuneDecision = any;
export type RuntimeTuning = any;
export type RejectSnapshot = any;
export type OpenPosition = any;
export type UserSession = any;

export type UserSettings = {
    userId: number; // подстрой под твой models.UserSettings
    // ... остальное
};

export type StatusResponse = { positions: OpenPosition[] };
export type SessionResponse = { session: UserSession | null };

export type AutoTuneResponse = {
    decision: TuneDecision;
    runtime: RuntimeTuning;
    from: string; // ISO
    to: string;   // ISO
    changed: boolean;
    mode: TuneMode;
};

export const tradeApi = {
    // user
    disableUser: (id: number) =>
        api<void>(`/api/user/${id}/disable`, { method: "POST", body: "{}" }),

    enableUser: (id: number, user: UserSettings) =>
        api<void>(`/api/user/${id}/enable`, {
            method: "POST",
            body: JSON.stringify({ user }),
        }),

    applySettings: (id: number, user: UserSettings) =>
        api<void>(`/api/user/${id}/settings`, {
            method: "POST",
            body: JSON.stringify({ user }),
        }),

    statusForUser: (id: number) =>
        api<StatusResponse>(`/api/user/${id}/status`),

    getSession: (id: number) =>
        api<SessionResponse>(`/api/user/${id}/session`),

    // tuning
    autoTuneNow: () =>
        api<AutoTuneResponse>(`/api/tune/auto`, { method: "POST", body: "{}" }),

    toggleTuneMode: () =>
        api<{ mode: TuneMode }>(`/api/tune/toggle`, { method: "POST", body: "{}" }),

    tuneMode: () =>
        api<{ mode: TuneMode }>(`/api/tune/mode`),

    strategyRejects: (reset = false) =>
        api<RejectSnapshot>(`/api/tune/rejects?reset=${reset ? "1" : "0"}`),

    strategyTuning: () =>
        api<{ runtime: RuntimeTuning; from: string; to: string }>(`/api/tune/runtime`),
};