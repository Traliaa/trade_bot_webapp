import { api } from "$lib/api/client";

export type ISODateTime = string;

export type TuneMode = "off" | "safe" | "aggressive" | string;
export type TuneDecision = unknown;
export type RuntimeTuning = unknown;
export type RejectSnapshot = unknown;
export type OpenPosition = {
    Symbol?: string;
    Side?: string;
    Entry?: number;
    Qty?: number;
    Size?: number;
    EntryPrice?: number;
    LastPrice?: number;
    UnrealizedPnlPct?: number;
    Updated?: string; // или Date, но с JSON будет string
    HoldVol?: number;
    HoldAvgPrice?: number;
};

// --- Settings types ---
export type UserSettings = {
    id: number;
    telegram_id: number;
    name: string;
    step: string;
    Status: boolean;  // если на бэке реально "Status"
    Premium: boolean; // если на бэке реально "Premium"
    settings: Settings;
};

export type Settings = {
    TradingSettings: TradingSettings;
    TrailingConfig: TrailingConfig;
    FeatureFlags: FeatureConfig;
    PositionGuard?: any;
};

export type FeatureConfig = {
    near_tp_protect_enabled: boolean;
    simulate_before_entry: boolean;
    deal_chart_enabled: boolean;
    auto_recommend_enabled: boolean;
    pro_mode: boolean;
};

export type TradingSettings = {
    okx_api_key: string;
    okx_api_secret: string;
    okx_passphrase: string;

    leverage: number;
    max_open_positions: number;
    position_pct: number;
    risk_pct: number;

    stop_pct: number;
    take_profit_rr: number;

    confirm_timeout: string;      // "30m"
    cooldown_per_symbol: string;  // "10m"
};

export type TrailingConfig = {
    be_trigger_r: number;
    be_offset_r: number;

    lock_trigger_r: number;
    lock_offset_r: number;

    time_stop_bars: number;
    time_stop_min_mfe_r: number;

    partial_enabled: boolean;
    partial_trigger_r: number;
    partial_close_frac: number;
};

// --- API responses ---
export type StatusResponse = { positions: OpenPosition[] };

// Бэк иногда отдаёт либо напрямую UserSettings, либо обёрткой {settings: ...}
// Поддержим оба, чтобы фронт не ломался.
export type SettingsResponse = UserSettings | { settings: UserSettings | null } | null;

export type AutoTuneResponse = {
    decision: TuneDecision;
    runtime: RuntimeTuning;
    from: ISODateTime;
    to: ISODateTime;
    changed: boolean;
    mode: TuneMode;
};

const postEmpty = <T>(url: string) => api<T>(url, { method: "POST", body: "{}" });

const postJSON = <T>(url: string, payload: unknown) =>
    api<T>(url, { method: "POST", body: JSON.stringify(payload) });

function unwrapSettings(resp: SettingsResponse): UserSettings | null {
    if (!resp) return null;
    if (typeof resp === "object" && "settings" in resp) {
        // @ts-expect-error runtime unwrap
        return resp.settings ?? null;
    }
    return resp as UserSettings;
}

export const trade = {
    // --- user ---
    disableUser: (id: number) => postEmpty<void>(`/api/user/${id}/disable`),

    // ✅ без второго аргумента (как ты используешь на главной)
    enableUser: (id: number) => postEmpty<void>(`/api/user/${id}/enable`),

    // ✅ отправляем settings
    // ВАЖНО: если бэк ожидает { user: settings } — поменяй на postJSON(..., { user: settings })
    applySettings: (id: number, settings: Settings) =>
        postJSON<void>(`/api/user/${id}/settings`, settings),

    statusForUser: (id: number) => api<StatusResponse>(`/api/user/${id}/status`),

    // ✅ возвращаем UserSettings | null (без обёртки)
    getSettings: async (id: number): Promise<UserSettings | null> => {
        const resp = await api<SettingsResponse>(`/api/user/${id}/settings`);
        return unwrapSettings(resp);
    },

    // --- tuning ---
    autoTuneNow: () => postEmpty<AutoTuneResponse>(`/api/tune/auto`),

    toggleTuneMode: () => postEmpty<{ mode: TuneMode }>(`/api/tune/toggle`),

    tuneMode: () => api<{ mode: TuneMode }>(`/api/tune/mode`),

    strategyRejects: (reset = false) =>
        api<RejectSnapshot>(`/api/tune/rejects?reset=${reset ? "1" : "0"}`),

    strategyTuning: () =>
        api<{ runtime: RuntimeTuning; from: ISODateTime; to: ISODateTime }>(`/api/tune/runtime`),
};