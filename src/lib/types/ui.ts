export type SegmentedOption<T extends string> = {
    value: T;
    label: string;
};

export type SegmentedTabItem = {
    key: string;
    label: string;
};

export type UiAccountSnapshot = {
    totalEquity: number;
    availableBalance: number;
    frozenBalance: number;
    unrealizedPnL: number;
    realizedPnL: number;
    updatedAt: string;
};
