export type TradeSide = "BUY" | "SELL";

export type TradeCardVM = {
    symbol: string;
    side: TradeSide;

    pnlPct?: number;
    pnlAbs?: number;

    entry?: number;
    mark?: number;

    size?: number;
    lev?: number;

    status?: string;

    // лучше хранить как string (чтобы UI не гадал)
    updatedAt?: string;
};

export type Side = 'long' | 'short';

export type Position = {
    pair: string;
    side: Side;
    pnlPct: number;
    entry: string;
    current: string;
    sl: string;
    tp: string;
    size: string;
    openedAt: string;
    meta?: string;
    progress?: number;
};

export type HistoryTrade = {
    pair: string;
    side: Side;
    resultPct: number;
    rr: number;
    date: string;
    status: string;
    entry: string;
    exit: string;
    sl: string;
    tp: string;
    size: string;
    reason: string;
    partials: string[];
};