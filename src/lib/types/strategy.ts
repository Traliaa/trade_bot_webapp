export type TradingSettings = {
    okxApiKey: string;
    okxApiSecret: string;
    okxPassphrase: string;
    leverage: number;
    maxOpenPositions: number;
    maxLongPositions: number;
    maxShortPositions: number;
    positionPct: number;
    riskPct: number;
    stopPct: number;
    takeProfitRR: number;
    confirmTimeout: string;
    cooldownPerSymbol: string;
};

export type TrailingConfig = {
    beTriggerR: number;
    beOffsetR: number;
    lockTriggerR: number;
    lockOffsetR: number;
    timeStopBars: number;
    timeStopMinCurrentR: number;
    earlyTimeStopBars: number;
    earlyTimeStopMinMFER: number;
    partialEnabled: boolean;
    partialTriggerR: number;
    partialCloseFrac: number;
};

export type FeatureFlags = {
    nearTPProtectEnabled: boolean;
    simulateBeforeEntry: boolean;
    dealChartEnabled: boolean;
    autoRecommendEnabled: boolean;
    proMode: boolean;
};

export type Settings = {
    tradingSettings: TradingSettings;
    trailingConfig: TrailingConfig;
    featureFlags: FeatureFlags;
};