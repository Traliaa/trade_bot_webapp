import { writable } from "svelte/store";
import { trade, type TradeRecord, type TradeStats } from "$lib/api/tradeApi";

type HistoryState = {
    loading: boolean;
    error: string | null;
    trades: TradeRecord[];
    stats: TradeStats | null;
};

const initialState: HistoryState = {
    loading: false,
    error: null,
    trades: [],
    stats: null,
};

function createHistoryStore() {
    const { subscribe, set, update } = writable<HistoryState>(initialState);

    return {
        subscribe,

        reset: () => set(initialState),

        loadTrades: async (limit = 20) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const resp = await trade.recentTrades(limit);

                update((state) => ({
                    ...state,
                    loading: false,
                    trades: resp.trades ?? [],
                }));
            } catch (e) {
                update((state) => ({
                    ...state,
                    loading: false,
                    error: e instanceof Error ? e.message : "Не удалось загрузить историю",
                }));
            }
        },

        loadStats: async () => {
            update((state) => ({ ...state, error: null }));

            try {
                const resp = await trade.tradeStats();

                update((state) => ({
                    ...state,
                    stats: resp.stats ?? null,
                }));
            } catch (e) {
                update((state) => ({
                    ...state,
                    error: e instanceof Error ? e.message : "Не удалось загрузить статистику",
                }));
            }
        },

        loadAll: async (limit = 20) => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const [tradesResp, statsResp] = await Promise.all([
                    trade.recentTrades(limit),
                    trade.tradeStats(),
                ]);

                update((state) => ({
                    ...state,
                    loading: false,
                    trades: tradesResp.trades ?? [],
                    stats: statsResp.stats ?? null,
                }));
            } catch (e) {
                update((state) => ({
                    ...state,
                    loading: false,
                    error: e instanceof Error ? e.message : "Не удалось загрузить историю и статистику",
                }));
            }
        },
    };
}

export const historyStore = createHistoryStore();