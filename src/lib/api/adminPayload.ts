export function normalizeTuneMode(mode: string | number): string {
    return typeof mode === 'number' ? (['off', 'safe', 'auto', 'manual'][mode] ?? 'unknown') : mode.toLowerCase();
}

export function tuneDecisionMessage(result: { changed: boolean; decision: unknown }): string {
    const decision = result.decision as { Why?: string; why?: string } | null;
    const reason = decision?.Why ?? decision?.why ?? 'unknown';
    const messages: Record<string, string> = {
        off: 'Тюн выключен. Сначала переключите режим.',
        warmup_not_done: 'Стратегия ещё прогревается. Повторите после загрузки свечей.',
        cooldown: 'Слишком рано для повторного тюна: действует защитный интервал.',
        signals_recent: 'Недавно были сигналы — менять параметры пока не требуется.',
        not_enough_rejects: 'Недостаточно отказов для обоснованной настройки.',
        too_few_rejects: 'Недостаточно отказов: для V3 нужно минимум 50.',
        no_dominant_reason: 'Нет преобладающей причины отказов. Параметры сохранены.',
        no_signals_yet: 'Сигналов пока не было. Параметры сохранены.',
        no_change: 'Подходящих изменений в допустимых пределах нет.'
    };
    return result.changed ? 'Изменения применены' : messages[reason] ?? `Параметры не изменены (${reason}).`;
}

export function normalizeRuntime(raw: Record<string, unknown>) {
    return {
        ...raw,
        breakoutPct: Number(raw.BreakoutPct ?? raw.breakoutPct ?? 0),
        minChannelPct: Number(raw.MinChannelPct ?? raw.minChannelPct ?? 0),
        minBodyPct: Number(raw.MinBodyPct ?? raw.minBodyPct ?? 0),
        closeUpMin: Number(raw.CloseUpMin ?? raw.closeUpMin ?? 0),
        closeDnMax: Number(raw.CloseDnMax ?? raw.closeDnMax ?? 0)
    };
}

export function normalizeRejects(raw: Record<string, unknown>) {
    return {
        total: Number(raw.Total ?? raw.total ?? 0),
        from: (raw.From ?? raw.from) as string | undefined,
        to: (raw.To ?? raw.to) as string | undefined,
        reasons: (raw.Counts ?? raw.reasons ?? {}) as Record<string, number>
    };
}
