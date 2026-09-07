import type { UserSettings } from './tradeApi';

const trailingFields = {
    be_trigger_r: 'BETriggerR', be_offset_r: 'BEOffsetR',
    lock_trigger_r: 'LockTriggerR', lock_offset_r: 'LockOffsetR',
    time_stop_bars: 'TimeStopBars', time_stop_min_current_r: 'TimeStopMinCurrentR',
    early_time_stop_bars: 'EarlyTimeStopBars', early_time_stop_min_mfe_r: 'EarlyTimeStopMinMFER',
    partial_enabled: 'PartialEnabled', partial_trigger_r: 'PartialTriggerR',
    partial_close_frac: 'PartialCloseFrac'
} as const;

export function durationToNs(value: string | number): number {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return value;
    const text = String(value).trim();
    if (!text || text === '0') return 0;
    const units: Record<string, number> = { h: 3600e9, m: 60e9, s: 1e9, ms: 1e6, us: 1e3, ns: 1 };
    let total = 0;
    let consumed = '';
    for (const part of text.matchAll(/(\d+(?:\.\d+)?)(ms|us|ns|h|m|s)/g)) {
        consumed += part[0];
        total += Number(part[1]) * units[part[2]];
    }
    if (consumed !== text || !Number.isSafeInteger(total)) {
        throw new Error('Некорректный интервал: используйте 30s, 10m или 1h30m');
    }
    return total;
}

export function settingsPayload(user: UserSettings) {
    const settings = user.settings;
    const trailing: Record<string, unknown> = { ...settings.TrailingConfig };
    for (const [ui, wire] of Object.entries(trailingFields)) {
        if (ui in trailing) trailing[wire] = trailing[ui];
        delete trailing[ui];
    }
    const { PositionGuard, ...rest } = settings;
    return { user: { settings: {
        ...rest,
        TradingSettings: {
            ...settings.TradingSettings,
            confirm_timeout: durationToNs(settings.TradingSettings.confirm_timeout),
            cooldown_per_symbol: durationToNs(settings.TradingSettings.cooldown_per_symbol)
        },
        TrailingConfig: trailing,
        ...(PositionGuard != null ? { position_guard: PositionGuard } : {})
    } } };
}
