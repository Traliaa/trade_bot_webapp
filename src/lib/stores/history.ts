import { writable } from 'svelte/store';
import { trade, type AccountSnapshot } from '$lib/api/tradeApi';
import { mapTradeRecordsToUiTrades } from '$lib/mappers/trades';
import { mapTradeStatsToUi } from '$lib/mappers/tradeStats';
import type { UiTrade } from '$lib/types/trade';
import type { UiTradeStats } from '$lib/types/tradeStats';
import {mapAccountSnapshot} from "$lib/mappers/history";
import type {UiAccountSnapshot} from "$lib/types/ui";

export type HistoryState = {
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

    return {
        subscribe,

        reset: () => set(initialState),

        loadAll: async (limit = 20) => {
            update((state) => ({
                ...state,
                loading: true,
                error: null
            }));

            try {
                const [status, recentTradesResponse, tradeStats] = await Promise.all([
                    trade.status(),
                    trade.getRecentTrades(limit),
                    trade.tradeStats()
                ]);

                update((state) => ({
                    ...state,
                    loading: false,
                    error: null,

                    botRunning: status.bot_running,
                    account: mapAccountSnapshot(status.account) ?? null,

                    openTrades: mapTradeRecordsToUiTrades(status.open_trades ?? []),
                    trades: mapTradeRecordsToUiTrades(recentTradesResponse.trades ?? []),
                    stats: mapTradeStatsToUi(tradeStats.stats),

                    lastUpdatedAt: new Date().toISOString()
                }));

            } catch (e) {
                console.error('historyStore.loadAll failed', e);

                update((state) => ({
                    ...state,
                    loading: false,
                    error: e instanceof Error ? e.message : 'Не удалось загрузить данные'
                }));
            }
        }
    };
}

export const historyStore = createHistoryStore();