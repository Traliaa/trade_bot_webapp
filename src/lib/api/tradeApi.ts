import { api } from "$lib/api/client";



export type AccountSnapshot = {
    TotalEquity: number;
    AvailableBalance: number;
    FrozenBalance: number;
    UnrealizedPnL: number;
    RealizedPnL: number;
    UpdatedAt: string;
};

export type TradePayload = {
    pos_side: string;
    side: string;

    entry_price: number;
    entry_size: number;
    stop_loss: number;
    take_profit: number;
    leverage: number;

    open_order_id?: string;
    algo_id?: string;

    exit_price?: number;
    exit_size?: number;

    realized_pnl?: number;
    realized_pnl_pct?: number;
    exchange_upl_ratio?: number;

    current_price?: number;
    unrealized_pnl?: number;
    unrealized_pnl_pct?: number;

    risk_dist?: number;
    r_multiple?: number;
    duration_sec?: number;

    moved_to_be?: boolean;
    locked_profit?: boolean;
    took_partial?: boolean;
    partial_count?: number;
    time_stop_triggered?: boolean;

    mfe_price?: number;
    mae_price?: number;
    mfe_r?: number;
    mae_r?: number;
};

export type TradeRecord = {
    guid: string;
    user_id: number;
    inst_id: string;
    strategy: string;
    timeframe: string;
    status: string;
    close_reason: string;
    entry_at: string;
    exit_at?: string;
    payload: TradePayload;
    created_at: string;
    updated_at: string;
};

export type StatusResponse = {
    bot_running: boolean;
    account: AccountSnapshot;
    open_trades: TradeRecord[];
};

export type TradeStats = {
    total_trades: number;
    open_trades: number;
    closed_trades: number;

    wins: number;
    losses: number;
    breakeven_trades: number;
    win_rate: number;

    total_pnl: number;
    avg_pnl: number;
    profit_factor: number;

    total_r: number;
    avg_r: number;
    median_r: number;

    avg_duration_sec: number;

    avg_mfe_r: number;
    avg_mae_r: number;

    tp_count: number;
    sl_count: number;
    break_even_count: number;
    lock_profit_count: number;
    partial_exit_count: number;
    time_stop_early_count: number;
    time_stop_stale_count: number;
    manual_close_count: number;
    recovery_close_count: number;
    force_close_count: number;
    unknown_close_count: number;

    partial_trades: number;

    best_trade_r: number;
    worst_trade_r: number;

    open_pnl?: number;
};

export type TradeStatsResponse = {
    stats: TradeStats;
};

type RequestInitLike = RequestInit | undefined;



// --- Settings types ---
export type UserSettings = {
    id: number;
    telegram_id: number;
    name: string;
    step: string;
    Status: boolean;
    Premium: boolean;
    settings: Settings;
    balance?: number;
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

// // --- API responses ---
// export type StatusResponse = { positions: TradeRecord[] };

export type SettingsResponse = UserSettings | { setting: UserSettings | null } | null;


export type RecentTradesResponse = {
    trades: TradeRecord[];
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
            balance: Number(s?.balance ?? 0),

        },
    };
}

export const trade = {
    disableBot: () => postEmpty<void>(`/api/bot/disable`),
    enableBot: (user: UserSettings) => postJSON<void>(`/api/bot/enable`, { user }),

    getSettings: async (): Promise<UserSettings | null> => {
        const resp = await api<SettingsResponse>(`/api/settings`);
        const unwrapped = unwrapSettings(resp);
        return normalizeSettings(unwrapped);
    },
    applySettings: (settings: UserSettings) => postJSON<void>(`/api/settings`, { user: settings.settings}),

    status: () => api<StatusResponse>('/api/status'),
    getRecentTrades: (limit = 20) =>
        api<RecentTradesResponse>(`/api/trades?limit=${limit}`),
    tradeStats: () => api<TradeStatsResponse>('/api/stats')
};