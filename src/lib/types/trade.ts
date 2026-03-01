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