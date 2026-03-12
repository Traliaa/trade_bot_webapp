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
    Updated?: string;
    HoldVol?: number;
    HoldAvgPrice?: number;
};

export type TradeRecord = {
    symbol?: string;
    side?: string;
    entry_price?: number;
    exit_price?: number;
    qty?: number;
    pnl_pct?: number;
    rr?: number;
    opened_at?: string;
    closed_at?: string;
    status?: string;
    reason?: string;
    partials?: string[];
} & Record<string, any>;

export type TradeStats = {
    total_trades?: number;
    winrate?: number;
    avg_rr?: number;
    pnl_day?: number;
    pnl_day_pct?: number;
} & Record<string, any>;

// --- Settings types ---
export type UserSettings = {
    id: number;
    telegram_id: number;
    name: string;
    step: string;
    Status: boolean;
    Premium: boolean;
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
    max_long_positions: number;
    max_short_positions: number;

    position_pct: number;
    risk_pct: number;

    stop_pct: number;
    take_profit_rr: number;

    confirm_timeout: string;
    cooldown_per_symbol: string;
};

export type TrailingConfig = {
    be_trigger_r: number;
    be_offset_r: number;

    lock_trigger_r: number;
    lock_offset_r: number;

    time_stop_bars: number;
    time_stop_min_current_r: number;

    early_time_stop_bars: number;
    early_time_stop_min_mfe_r: number;

    partial_enabled: boolean;
    partial_trigger_r: number;
    partial_close_frac: number;
};

// --- API responses ---
export type StatusResponse = { positions: OpenPosition[] };
export type SettingsResponse = UserSettings | { setting: UserSettings | null } | null;
export type TradesResponse = { trades: TradeRecord[] };
export type StatsResponse = { stats: TradeStats };

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

    if (typeof ts.confirm_timeout === "number") {
        ts.confirm_timeout = nsToHuman(ts.confirm_timeout);
    }
    if (typeof ts.cooldown_per_symbol === "number") {
        ts.cooldown_per_symbol = nsToHuman(ts.cooldown_per_symbol);
    }

    // normalize PascalCase -> snake_case
    if ("BETriggerR" in tc) {
        s.TrailingConfig = {
            be_trigger_r: tc.BETriggerR,
            be_offset_r: tc.BEOffsetR,
            lock_trigger_r: tc.LockTriggerR,
            lock_offset_r: tc.LockOffsetR,
            time_stop_bars: tc.TimeStopBars,
            time_stop_min_current_r: tc.TimeStopMinCurrentR,
            early_time_stop_bars: tc.EarlyTimeStopBars,
            early_time_stop_min_mfe_r: tc.EarlyTimeStopMinMFER,
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
    disableBot: () => postEmpty<void>(`/api/bot/disable`),

    enableBot: (user: UserSettings) =>
        postJSON<void>(`/api/bot/enable`, { user }),

    applySettings: (settings: UserSettings) =>
        postJSON<void>(`/api/settings`, { user: settings }),

    status: () => api<StatusResponse>(`/api/status`),

    getSettings: async (): Promise<UserSettings | null> => {
        const resp = await api<SettingsResponse>(`/api/settings`);
        const unwrapped = unwrapSettings(resp);
        return normalizeSettings(unwrapped);
    },

    recentTrades: (limit = 20) =>
        api<TradesResponse>(`/api/trades?limit=${limit}`),

    tradeStats: () =>
        api<StatsResponse>(`/api/stats`),

    autoTuneNow: () =>
        postEmpty<AutoTuneResponse>(`/api/strategy/tune/auto`),

    toggleTuneMode: () =>
        postEmpty<{ mode: TuneMode }>(`/api/strategy/tune/toggle`),

    tuneMode: () =>
        api<{ mode: TuneMode }>(`/api/strategy/tune/mode`),

    strategyRejects: (reset = false) =>
        api<RejectSnapshot>(`/api/strategy/rejects?reset=${reset ? "1" : "0"}`),

    strategyTuning: () =>
        api<{ runtime: RuntimeTuning; from: ISODateTime; to: ISODateTime }>(
            `/api/strategy/runtime`
        ),
};