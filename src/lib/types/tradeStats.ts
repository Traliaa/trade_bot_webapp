export type UiTradeStats = {
    totalTrades: number;
    openTrades: number;
    closedTrades: number;

    wins: number;
    losses: number;
    breakevenTrades: number;
    winRate: number;

    totalPnL: number;
    avgPnL: number;
    profitFactor: number;

    totalR: number;
    avgR: number;
    medianR: number;

    avgDurationSec: number;

    avgMfeR: number;
    avgMaeR: number;

    tpCount: number;
    slCount: number;
    breakEvenCount: number;
    lockProfitCount: number;
    partialExitCount: number;
    timeStopEarlyCount: number;
    timeStopStaleCount: number;
    manualCloseCount: number;
    recoveryCloseCount: number;
    forceCloseCount: number;
    unknownCloseCount: number;

    partialTrades: number;

    bestTradeR: number;
    worstTradeR: number;

    openPnL: number;
};