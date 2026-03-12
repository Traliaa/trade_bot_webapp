import { writable } from 'svelte/store';

export const strategyState = writable({
    tradingSettings: {
        leverage: 20,
        maxOpenPositions: 10,
        maxLongPositions: 5,
        maxShortPositions: 5,
        positionPct: 0.5,
        riskPct: 0.5,
        stopPct: 1.2,
        takeProfitRR: 2.0,
        confirmTimeout: '30s',
        cooldownPerSymbol: '15m'
    },
    trailingConfig: {
        beTriggerR: 0.6,
        beOffsetR: 0,
        lockTriggerR: 0.9,
        lockOffsetR: 0.3,
        timeStopBars: 12,
        timeStopMinCurrentR: 0.1,
        earlyTimeStopBars: 4,
        earlyTimeStopMinMFER: 0.15,
        partialEnabled: true,
        partialTriggerR: 0.9,
        partialCloseFrac: 0.5
    },
    featureFlags: {
        nearTPProtectEnabled: true,
        simulateBeforeEntry: false,
        dealChartEnabled: true,
        autoRecommendEnabled: false,
        proMode: false
    }
});