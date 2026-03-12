import type { Settings } from '$lib/api/tradeApi';

export function partialFracToPercent(v?: number): number {
    if (typeof v !== 'number' || Number.isNaN(v)) return 0;
    return Math.round(v * 100);
}

export function partialPercentToFrac(v?: number): number {
    if (typeof v !== 'number' || Number.isNaN(v)) return 0;
    return v / 100;
}

export function cloneSettings(settings: Settings): Settings {
    return JSON.parse(JSON.stringify(settings));
}