import type { OpenPosition } from "$lib/api/tradeApi";
import type { TradeCardVM } from "$lib/types/trade";

function n(v: any): number | undefined {
    const x = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(x) ? x : undefined;
}

/**
 * Подстрой поля под реальные ключи из бэка.
 * Сейчас сделано "мягко": ищет популярные варианты имен.
 */
export function mapOpenPosition(p: OpenPosition): TradeCardVM {
    const symbol =
        (p as any).symbol ??
        (p as any).instId ??
        (p as any).instrument ??
        "UNKNOWN";

    const sideRaw =
        (p as any).side ??
        (p as any).posSide ??
        (p as any).direction ??
        "BUY";

    const side = String(sideRaw).toUpperCase() === "SELL" ? "SELL" : "BUY";

    // pnl%: пробуем несколько вариантов
    const pnlPct =
        n((p as any).pnlPct) ??
        n((p as any).pnl_percent) ??
        n((p as any).pnl_percent_total) ??
        n((p as any).pnlRatio);

    const pnlAbs =
        n((p as any).pnl) ??
        n((p as any).pnlAbs) ??
        n((p as any).upl) ??
        n((p as any).unrealizedPnl);

    const entry =
        n((p as any).entry) ??
        n((p as any).avgPx) ??
        n((p as any).entryPrice) ??
        n((p as any).avgPrice);

    const mark =
        n((p as any).mark) ??
        n((p as any).markPx) ??
        n((p as any).markPrice) ??
        n((p as any).last) ??
        n((p as any).lastPrice);

    const size =
        n((p as any).size) ??
        n((p as any).pos) ??
        n((p as any).sz) ??
        n((p as any).qty);

    const lev =
        n((p as any).lev) ??
        n((p as any).leverage);

    const status =
        (p as any).status ??
        "OPEN";

    const updatedAt = toTs((p as any).updatedAt ?? (p as any).ts ?? (p as any).timestamp);
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
        updatedAt
    };
}


function toTs(v: any): string | undefined {
    if (v == null) return undefined;

    // если это число/строка-число (unix ms)
    const n = typeof v === "string" ? Number(v) : v;
    if (Number.isFinite(n)) {
        // если похоже на unix seconds, домножим
        const ms = n < 1e12 ? n * 1000 : n;
        return new Date(ms).toISOString();
    }

    if (typeof v === "string") return v;
    if (v instanceof Date) return v.toISOString();

    return String(v);
}