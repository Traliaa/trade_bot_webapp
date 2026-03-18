export type UiTradeSide = 'long' | 'short';

export type UiTrade = {
    id: string;

    symbol: string;
    strategy: string;
    timeframe: string;

    side: UiTradeSide;
    sideLabel: string;
    sideTone: 'success' | 'danger';

    status: string;
    closeReason: string;

    entryPrice: number;
    entrySize: number;
    stopLoss: number;
    takeProfit: number;
    leverage: number;

    currentPrice: number | null;
    exitPrice: number | null;
    exitSize: number | null;

    pnl: number;
    pnlPct: number;
    exchangeUplRatio: number| null;
    rMultiple: number | null;
    riskDist: number | null;
    durationSec: number | null;

    movedToBE: boolean;
    lockedProfit: boolean;
    tookPartial: boolean;
    partialCount: number;
    timeStopTriggered: boolean;

    mfePrice: number | null;
    maePrice: number | null;
    mfeR: number | null;
    maeR: number | null;

    openOrderId: string | null;
    algoId: string | null;

    entryAt: string;
    exitAt: string | null;
    createdAt: string;
    updatedAt: string;

    isOpen: boolean;
    isClosed: boolean;
};