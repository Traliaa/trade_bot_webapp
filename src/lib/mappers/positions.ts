import type { OpenPosition } from "$lib/api/tradeApi";
import type { TradeCardVM } from "$lib/types/trade";

function n(v: any): number | undefined {
    const x = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(x) ? x : undefined;
}

/**
 * Маппинг OpenPosition (Go) -> TradeCardVM (UI)
 * Поддерживает:
 * - PascalCase из Go json (Symbol, Qty, Entry, LastPrice, UnrealizedPnlPct, Updated...)
 * - а также "популярные" варианты (symbol/instId/avgPx/markPx и т.д.)
 */
export function mapOpenPosition(p: OpenPosition): TradeCardVM {
    const symbol =
        (p as any).Symbol ??
        (p as any).symbol ??
        (p as any).instId ??
        (p as any).instrument ??
        "UNKNOWN";

    const sideRaw =
        (p as any).Side ??
        (p as any).side ??
        (p as any).posSide ??
        (p as any).direction ??
        "BUY";

    // у тебя Side строкой, плюс на всякий случай short/long
    const s = String(sideRaw).toUpperCase();
    const side = s === "SELL" || s === "SHORT" ? "SELL" : "BUY";

    // pnl%: PascalCase из Go + старые варианты
    let pnlPct =
        n((p as any).UnrealizedPnlPct) ??
        n((p as any).unrealizedPnlPct) ??
        n((p as any).pnlPct) ??
        n((p as any).pnl_percent) ??
        n((p as any).pnl_percent_total) ??
        n((p as any).pnlRatio);

    const pnlAbs =
        n((p as any).UnrealizedPnl) ??
        n((p as any).unrealizedPnl) ??
        n((p as any).pnl) ??
        n((p as any).pnlAbs) ??
        n((p as any).upl);

    const entry =
        n((p as any).Entry) ??
        n((p as any).EntryPrice) ??
        n((p as any).HoldAvgPrice) ??
        n((p as any).entry) ??
        n((p as any).avgPx) ??
        n((p as any).entryPrice) ??
        n((p as any).avgPrice);

    const mark =
        n((p as any).LastPrice) ??
        n((p as any).mark) ??
        n((p as any).markPx) ??
        n((p as any).markPrice) ??
        n((p as any).last) ??
        n((p as any).lastPrice);

    const size =
        n((p as any).Qty) ??
        n((p as any).Size) ??
        n((p as any).HoldVol) ??
        n((p as any).size) ??
        n((p as any).pos) ??
        n((p as any).sz) ??
        n((p as any).qty);

    const lev =
        n((p as any).Leverage) ??
        n((p as any).lever) ??
        n((p as any).lev) ??
        n((p as any).leverage);

    const status =
        (p as any).Status ??
        (p as any).status ??
        "OPEN";

    // Updated time.Time на бэке придёт строкой ISO (обычно), но поддержим и unix
    const updatedAt = toTs(
        (p as any).Updated ??
        (p as any).updatedAt ??
        (p as any).ts ??
        (p as any).timestamp
    );

    // если pnlPct не пришёл — считаем от entry/mark
    if (pnlPct == null && entry != null && mark != null && entry > 0 && mark > 0) {
        const raw = ((mark - entry) / entry) * 100;
        pnlPct = side === "BUY" ? raw : -raw;
    }

    return {
        symbol,
        side,
        pnlPct,
        pnlAbs,
        entry,
        mark,
        size,
        lev,
        status,
        updatedAt,
    };
}

function toTs(v: any): string | undefined {
    if (v == null) return undefined;

    // unix ms/sec
    const num = typeof v === "string" ? Number(v) : v;
    if (Number.isFinite(num)) {
        const ms = num < 1e12 ? num * 1000 : num;
        return new Date(ms).toISOString();
    }

    if (typeof v === "string") return v;
    if (v instanceof Date) return v.toISOString();

    return String(v);
}