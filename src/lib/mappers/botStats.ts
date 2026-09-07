import type { RawTradeStats } from '$lib/api/adminTradeApi';
import type { BotTradeStats } from '$lib/types/botStats';

function toNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
}

export function mapBotTradeStats(raw: RawTradeStats): BotTradeStats {
    return {
        totalTrades: toNumber(raw.total_trades),
        openTrades: toNumber(raw.open_trades),
        closedTrades: toNumber(raw.closed_trades),

        wins: toNumber(raw.wins),
        losses: toNumber(raw.losses),
        breakevenTrades: toNumber(raw.breakeven_trades),
        winRate: toNumber(raw.win_rate),

        totalPnL: toNumber(raw.total_pnl),
        avgPnL: toNumber(raw.avg_pnl),
        profitFactor: toNumber(raw.profit_factor),

        totalR: toNumber(raw.total_r),
        avgR: toNumber(raw.avg_r),
        medianR: toNumber(raw.median_r),

        avgDurationSec: toNumber(raw.avg_duration_sec),

        avgMfeR: toNumber(raw.avg_mfe_r),
        avgMaeR: toNumber(raw.avg_mae_r),

        tpCount: toNumber(raw.tp_count),
        slCount: toNumber(raw.sl_count),
        breakEvenCount: toNumber(raw.break_even_count),
        lockProfitCount: toNumber(raw.lock_profit_count),
        partialExitCount: toNumber(raw.partial_exit_count),
        timeStopEarlyCount: toNumber(raw.time_stop_early_count),
        timeStopStaleCount: toNumber(raw.time_stop_stale_count),
        manualCloseCount: toNumber(raw.manual_close_count),
        recoveryCloseCount: toNumber(raw.recovery_close_count),
        forceCloseCount: toNumber(raw.force_close_count),
        unknownCloseCount: toNumber(raw.unknown_close_count),

        partialTrades: toNumber(raw.partial_trades),

        bestTradeR: toNumber(raw.best_trade_r),
        worstTradeR: toNumber(raw.worst_trade_r),

        openPnL: toNumber(raw.open_pnl)
    };
}