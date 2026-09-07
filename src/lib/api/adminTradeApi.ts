
import {api} from "$lib/api/client";
import { normalizeTuneMode, normalizeRuntime, normalizeRejects } from './adminPayload';


export type ISODateTime = string;

export type TuneMode = "off" | "safe" | "aggressive" | string;
export type TuneDecision = unknown;
export type RuntimeTuning = {
    breakoutPct?: number;
    minChannelPct?: number;
    minBodyPct?: number;
    closeUpMin?: number;
    closeDnMax?: number;
};
export type RejectSnapshot = {
    total?: number;
    from?: ISODateTime;
    to?: ISODateTime;
    reasons?: Record<string, number>;
};
export type AutoTuneResponse = {
    decision: TuneDecision;
    runtime: RuntimeTuning;
    from: ISODateTime;
    to: ISODateTime;
    changed: boolean;
    mode: TuneMode;
};
export type TradeStatsResponse = {
    stats: RawTradeStats;
};

export type RawTradeStats = {
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

const postEmpty = <T>(url: string) =>
    api<T>(url, { method: "POST", body: "{}" });

export const adminTradeApi = {
    tuneMode: async () => {
        const data = await api<{ mode: string | number }>(`/api/strategy/tune/mode`);
        return { mode: normalizeTuneMode(data.mode) };
    },
    toggleTuneMode: async () => {
        const data = await postEmpty<{ mode: string | number }>(`/api/strategy/tune/toggle`);
        return { mode: normalizeTuneMode(data.mode) };
    },
    autoTuneNow: async () => {
        const data = await postEmpty<AutoTuneResponse>(`/api/strategy/tune/auto`);
        return { ...data, mode: normalizeTuneMode(data.mode), runtime: normalizeRuntime(data.runtime) };
    },
    strategyRejects: async (reset = false) => {
        const data = await api<Record<string, unknown>>(`/api/strategy/rejects?reset=${reset ? "1" : "0"}`);
        return normalizeRejects(data);
    },
    tradeStats: () => api<TradeStatsResponse>('/api/stats'),
    strategyTuning: async () => {
        const data = await api<{ runtime: RuntimeTuning; from: ISODateTime; to: ISODateTime }>(
            `/api/strategy/runtime`
        );
        return { ...data, runtime: normalizeRuntime(data.runtime) };
    }
};
