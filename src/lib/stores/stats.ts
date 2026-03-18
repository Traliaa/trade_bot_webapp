import { writable } from 'svelte/store';
import { trade, type TradeStats } from '$lib/api/tradeApi';

export type StatsState = {
    loading: boolean;
    error: string | null;
    data: TradeStats | null;
};

const initialState: StatsState = {
    loading: false,
    error: null,
    data: null
};

function createStatsStore() {
    const { subscribe, update, set } = writable<StatsState>(initialState);

    return {
        subscribe,

        reset: () => set(initialState),

        load: async () => {
            update((state) => ({
                ...state,
                loading: true,
                error: null
            }));

            try {
                const data = await trade.tradeStats();

                update((state) => ({
                    ...state,
                    loading: false,
                    data
                }));
            } catch (e) {
                update((state) => ({
                    ...state,
                    loading: false,
                    error: e instanceof Error ? e.message : 'Не удалось загрузить статистику'
                }));
            }
        }
    };
}

export const stats = createStatsStore();
