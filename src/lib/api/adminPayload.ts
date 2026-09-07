export function normalizeTuneMode(mode: unknown): string {
    if (typeof mode === 'number') return ['off', 'safe', 'auto', 'manual'][mode] ?? 'unknown';
    return typeof mode === 'string' ? mode.toLowerCase() : 'unknown';
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
    const number = (key: string, alias: string) => {
        const value = raw[key] ?? raw[alias];
        return value != null && value !== '' && Number.isFinite(Number(value)) ? Number(value) : undefined;
    };
    return {
        ...raw,
        breakoutPct: number('BreakoutPct', 'breakoutPct'),
        minChannelPct: number('MinChannelPct', 'minChannelPct'),
        minBodyPct: number('MinBodyPct', 'minBodyPct'),
        closeUpMin: number('CloseUpMin', 'closeUpMin'),
        closeDnMax: number('CloseDnMax', 'closeDnMax'),
        v3MinConfirmScore: number('V3MinConfirmScore', 'v3MinConfirmScore'),
        v3RetestTolerancePct: number('V3RetestTolerancePct', 'v3RetestTolerancePct'),
        v3ImpulseBodyMinPct: number('V3ImpulseBodyMinPct', 'v3ImpulseBodyMinPct'),
        v3CompressionThresholdPct: number('V3CompressionThresholdPct', 'v3CompressionThresholdPct'),
        v3StrongCloseMin: number('V3StrongCloseMin', 'v3StrongCloseMin'),
        v3StrongCloseMax: number('V3StrongCloseMax', 'v3StrongCloseMax'),
        v3VolumeMinRatio: number('V3VolumeMinRatio', 'v3VolumeMinRatio')
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
