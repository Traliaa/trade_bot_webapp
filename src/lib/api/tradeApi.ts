import { api } from "$lib/api/client";

export type ISODateTime = string;

export type TuneMode = "off" | "safe" | "aggressive" | string;
export type TuneDecision = unknown;
export type RuntimeTuning = unknown;
export type RejectSnapshot = unknown;
export type OpenPosition = Record<string, any>;
export type UserSession = unknown;

export type UserSettings = {
    userId: number;
    // ...
};

export type StatusResponse = { positions: OpenPosition[] };
export type SessionResponse = { session: UserSession | null };

export type AutoTuneResponse = {
    decision: TuneDecision;
    runtime: RuntimeTuning;
    from: ISODateTime;
    to: ISODateTime;
    changed: boolean;
    mode: TuneMode;
};

const postEmpty = <T>(url: string) =>
    api<T>(url, { method: "POST", body: "{}" });

const postJSON = <T>(url: string, payload: unknown) =>
    api<T>(url, { method: "POST", body: JSON.stringify(payload) });

export const trade = {
    // user
    disableUser: (id: number) => postEmpty<void>(`/api/user/${id}/disable`),

    enableUser: (id: number, user: UserSettings) =>
        postJSON<void>(`/api/user/${id}/enable`, { user }),

    applySettings: (id: number, user: UserSettings) =>
        postJSON<void>(`/api/user/${id}/settings`, { user }),

    statusForUser: (id: number) =>
        api<StatusResponse>(`/api/user/${id}/status`),

    getSession: (id: number) =>
        api<SessionResponse>(`/api/user/${id}/session`),

    // tuning
    autoTuneNow: () => postEmpty<AutoTuneResponse>(`/api/tune/auto`),

    toggleTuneMode: () => postEmpty<{ mode: TuneMode }>(`/api/tune/toggle`),

    tuneMode: () => api<{ mode: TuneMode }>(`/api/tune/mode`),

    strategyRejects: (reset = false) =>
        api<RejectSnapshot>(`/api/tune/rejects?reset=${reset ? "1" : "0"}`),

    strategyTuning: () =>
        api<{ runtime: RuntimeTuning; from: ISODateTime; to: ISODateTime }>(
            `/api/tune/runtime`
        ),
};