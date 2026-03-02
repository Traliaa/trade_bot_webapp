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
export type SettingsResponse = UserSettings | { setting: UserSettings | null } | null;

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

type SettingsEnvelope =
    | UserSettings
    | { setting: UserSettings | null }
    | { settings: UserSettings | null }
    | null;

function unwrapSettings(resp: SettingsEnvelope): UserSettings | null {
    if (!resp) return null;

    if (typeof resp === "object") {
        if ("setting" in resp) return (resp as any).setting ?? null;
        if ("settings" in resp) return (resp as any).settings ?? null;
    }

    return resp as UserSettings;
}
function nsToHuman(v: any): string {
    const n = typeof v === "string" ? Number(v) : v;
    if (!Number.isFinite(n) || n <= 0) return "";

    const sec = Math.round(n / 1e9);

    if (sec % 3600 === 0) return `${sec / 3600}h`;
    if (sec % 60 === 0) return `${sec / 60}m`;
    return `${sec}s`;
}
function normalizeSettings(u: UserSettings | null): UserSettings | null {
    if (!u) return null;

    const s: any = u.settings ?? {};
    const ts: any = s.TradingSettings ?? {};
    const tc: any = s.TrailingConfig ?? {};

    // --- normalize duration ---
    if (typeof ts.confirm_timeout === "number") {
        ts.confirm_timeout = nsToHuman(ts.confirm_timeout);
    }
    if (typeof ts.cooldown_per_symbol === "number") {
        ts.cooldown_per_symbol = nsToHuman(ts.cooldown_per_symbol);
    }

    // --- normalize TrailingConfig PascalCase -> snake_case ---
    if ("BETriggerR" in tc) {
        s.TrailingConfig = {
            be_trigger_r: tc.BETriggerR,
            be_offset_r: tc.BEOffsetR,
            lock_trigger_r: tc.LockTriggerR,
            lock_offset_r: tc.LockOffsetR,
            time_stop_bars: tc.TimeStopBars,
            time_stop_min_mfe_r: tc.TimeStopMinMFER,
            partial_enabled: tc.PartialEnabled,
            partial_trigger_r: tc.PartialTriggerR,
            partial_close_frac: tc.PartialCloseFrac,
        };
    }

    return {
        ...u,
        settings: {
            ...s,
            TradingSettings: ts,
            TrailingConfig: s.TrailingConfig,
            FeatureFlags: s.FeatureFlags ?? {},
            PositionGuard: s.PositionGuard ?? s.position_guard ?? null,
        },
    };
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
        const unwrapped = unwrapSettings(resp);
        return normalizeSettings(unwrapped);
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


