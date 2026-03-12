import type { OpenPosition } from '$lib/api/tradeApi';

export type UiPosition = {
    pair: string;
    side: 'Лонг' | 'Шорт';
    entry: string;
    current: string;
    pnlPct: string;
    size: string;
    opened: string;
};

function formatPrice(v?: number): string {
    if (typeof v !== 'number' || Number.isNaN(v)) return '—';
    return v.toLocaleString('ru-RU', { maximumFractionDigits: 6 });
}

function formatPct(v?: number): string {
    if (typeof v !== 'number' || Number.isNaN(v)) return '—';
    const sign = v > 0 ? '+' : '';
    return `${sign}${v.toFixed(2)}%`;
}

function formatDate(v?: string): string {
    if (!v) return '—';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function mapSide(side?: string): 'Лонг' | 'Шорт' {
    const s = (side ?? '').toLowerCase();
    if (s.includes('sell') || s.includes('short')) return 'Шорт';
    return 'Лонг';
}

export function mapOpenPositionToUi(position: OpenPosition): UiPosition {
    return {
        pair: position.Symbol ?? '—',
        side: mapSide(position.Side),
        entry: formatPrice(position.EntryPrice ?? position.Entry),
        current: formatPrice(position.LastPrice),
        pnlPct: formatPct(position.UnrealizedPnlPct),
        size: formatPrice(position.Qty ?? position.Size ?? position.HoldVol),
        opened: formatDate(position.Updated)
    };
}

export function mapOpenPositionsToUi(positions: OpenPosition[] = []): UiPosition[] {
    return positions.map(mapOpenPositionToUi);
}