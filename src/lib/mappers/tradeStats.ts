import type { TradeStats } from '$lib/api/tradeApi';
import type { UiTradeStats } from '$lib/types/tradeStats';

export function mapTradeStatsToUi(stats: TradeStats): UiTradeStats {
    return {
        totalTrades: stats.total_trades ?? 0,
        openTrades: stats.open_trades ?? 0,
        closedTrades: stats.closed_trades ?? 0,

        wins: stats.wins ?? 0,
        losses: stats.losses ?? 0,
        breakevenTrades: stats.breakeven_trades ?? 0,
        winRate: stats.win_rate ?? 0,

        totalPnL: stats.total_pnl ?? 0,
        avgPnL: stats.avg_pnl ?? 0,
        profitFactor: stats.profit_factor ?? 0,

        totalR: stats.total_r ?? 0,
        avgR: stats.avg_r ?? 0,
        medianR: stats.median_r ?? 0,

        avgDurationSec: stats.avg_duration_sec ?? 0,

        avgMfeR: stats.avg_mfe_r ?? 0,
        avgMaeR: stats.avg_mae_r ?? 0,

        tpCount: stats.tp_count ?? 0,
        slCount: stats.sl_count ?? 0,
        breakEvenCount: stats.break_even_count ?? 0,
        lockProfitCount: stats.lock_profit_count ?? 0,
        partialExitCount: stats.partial_exit_count ?? 0,
        timeStopEarlyCount: stats.time_stop_early_count ?? 0,
        timeStopStaleCount: stats.time_stop_stale_count ?? 0,
        manualCloseCount: stats.manual_close_count ?? 0,
        recoveryCloseCount: stats.recovery_close_count ?? 0,
        forceCloseCount: stats.force_close_count ?? 0,
        unknownCloseCount: stats.unknown_close_count ?? 0,

        partialTrades: stats.partial_trades ?? 0,

        bestTradeR: stats.best_trade_r ?? 0,
        worstTradeR: stats.worst_trade_r ?? 0,

        openPnL: stats.open_pnl ?? 0
    };
}