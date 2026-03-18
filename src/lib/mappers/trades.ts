import type { TradeRecord } from '$lib/api/tradeApi';
import type { UiTrade, UiTradeSide } from '$lib/types/trade';

function mapSide(posSide: string, side: string): UiTradeSide {
    const ps = posSide?.toLowerCase();
    const s = side?.toLowerCase();

    if (ps === 'long' || s === 'buy') return 'long';
    if (ps === 'short' || s === 'sell') return 'short';

    return 'long';
}

function mapSideLabel(side: UiTradeSide): string {
    return side === 'long' ? 'LONG' : 'SHORT';
}

function mapSideTone(side: UiTradeSide): 'success' | 'danger' {
    return side === 'long' ? 'success' : 'danger';
}

function normalizeDate(value?: string | null): string | null {
    if (!value) return null;
    if (value === '0001-01-01T00:00:00Z') return null;
    return value;
}

export function mapTradeRecordToUiTrade(record: TradeRecord): UiTrade {
    const payload = record.payload;
    const side = mapSide(payload.pos_side, payload.side);
    const status = record.status?.toLowerCase() ?? '';
    const isOpen = status === 'open';
    const isClosed = !isOpen;
    const exitAt = normalizeDate(record.exit_at ?? null);

    const pnl = isOpen
        ? (payload.unrealized_pnl ?? 0)
        : (payload.realized_pnl ?? 0);

    const pnlPct = isOpen
        ? (payload.unrealized_pnl_pct ?? 0)
        : (payload.realized_pnl_pct ?? 0);

    return {
        id: record.guid,

        symbol: record.inst_id,
        strategy: record.strategy,
        timeframe: record.timeframe,

        side,
        sideLabel: mapSideLabel(side),
        sideTone: mapSideTone(side),

        status: record.status,
        closeReason: record.close_reason,

        entryPrice: payload.entry_price ?? 0,
        entrySize: payload.entry_size ?? 0,
        stopLoss: payload.stop_loss ?? 0,
        takeProfit: payload.take_profit ?? 0,
        leverage: Number(payload.leverage ?? 0),

        currentPrice: payload.current_price ?? null,
        exitPrice: payload.exit_price ?? null,
        exitSize: payload.exit_size ?? null,
        exchangeUplRatio: payload.exchange_upl_ratio ?? null,
        pnl,
        pnlPct,
        rMultiple: payload.r_multiple ?? null,
        riskDist: payload.risk_dist ?? null,
        durationSec: payload.duration_sec ?? null,

        movedToBE: payload.moved_to_be ?? false,
        lockedProfit: payload.locked_profit ?? false,
        tookPartial: payload.took_partial ?? false,
        partialCount: payload.partial_count ?? 0,
        timeStopTriggered: payload.time_stop_triggered ?? false,

        mfePrice: payload.mfe_price ?? null,
        maePrice: payload.mae_price ?? null,
        mfeR: payload.mfe_r ?? null,
        maeR: payload.mae_r ?? null,

        openOrderId: payload.open_order_id ?? null,
        algoId: payload.algo_id ?? null,

        entryAt: record.entry_at,
        exitAt,
        createdAt: record.created_at,
        updatedAt: record.updated_at,

        isOpen,
        isClosed
    };
}

export function mapTradeRecordsToUiTrades(records: unknown): UiTrade[] {
    if (!Array.isArray(records)) {
        return [];
    }

    return records.map((record) => mapTradeRecordToUiTrade(record as TradeRecord));
}