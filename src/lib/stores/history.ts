import { writable } from 'svelte/store';
import { trade, type StatusResponse } from '$lib/api/tradeApi';
import { mapTradeRecordsToUiTrades } from '$lib/mappers/trades';
import { mapTradeStatsToUi } from '$lib/mappers/tradeStats';
import type { UiTrade } from '$lib/types/trade';
import type { UiTradeStats } from '$lib/types/tradeStats';
import {mapAccountSnapshot} from "$lib/mappers/history";
import type {UiAccountSnapshot} from "$lib/types/ui";

export type HistoryState = {
    lastSignal: StatusResponse['last_signal'];
    loading: boolean;
    error: string | null;

    botRunning: boolean;
    account: UiAccountSnapshot | null;

    openTrades: UiTrade[];
    trades: UiTrade[];
    stats: UiTradeStats | null;

    lastUpdatedAt: string | null;
};

const initialState: HistoryState = {
    lastSignal: null,
    loading: false,
    error: null,

    botRunning: false,
    account: null,

    openTrades: [],
    trades: [],
    stats: null,

    lastUpdatedAt: null
};

function createHistoryStore() {
    const { subscribe, update, set } = writable<HistoryState>(initialState);
    let requestVersion = 0;

    return {
        subscribe,

        reset: () => {
            requestVersion += 1;
            set(initialState);
        },

        loadAll: async (limit = 20) => {
            const version = ++requestVersion;
            update((state) => ({
                ...state,
                loading: true,
                error: null
            }));

            const [statusResult, tradesResult, statsResult] = await Promise.allSettled([
                trade.status(),
                trade.getRecentTrades(limit),
                trade.tradeStats()
            ]);

            if (version !== requestVersion) return;

            const errors = [statusResult, tradesResult, statsResult]
                .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
                .map((result) =>
                    result.reason instanceof Error ? result.reason.message : 'Не удалось загрузить данные'
                );

            update((state) => {
                const status = statusResult.status === 'fulfilled' ? statusResult.value : null;
                const recentTrades = tradesResult.status === 'fulfilled' ? tradesResult.value : null;
                const tradeStats = statsResult.status === 'fulfilled' ? statsResult.value : null;
                const hasFreshData = Boolean(status || recentTrades || tradeStats);

                return {
                    ...state,
                    loading: false,
                    error: errors.length > 0 ? [...new Set(errors)].join('; ') : null,
                    botRunning: status?.bot_running ?? state.botRunning,
                    lastSignal: status ? status.last_signal ?? null : state.lastSignal,
                    account: status ? mapAccountSnapshot(status.account) : state.account,
                    openTrades: status
                        ? mapTradeRecordsToUiTrades(status.open_trades ?? [])
                        : state.openTrades,
                    trades: recentTrades
                        ? mapTradeRecordsToUiTrades(recentTrades.trades ?? [])
                        : state.trades,
                    stats: tradeStats ? mapTradeStatsToUi(tradeStats.stats) : state.stats,
                    lastUpdatedAt: hasFreshData ? new Date().toISOString() : state.lastUpdatedAt
                };
            });
        }
    };
}

export const historyStore = createHistoryStore();
