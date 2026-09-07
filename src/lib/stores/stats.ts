import { writable } from 'svelte/store';
import { adminTradeApi } from '$lib/api/adminTradeApi';
import { mapBotTradeStats } from '$lib/mappers/botStats';
import type { BotTradeStats } from '$lib/types/botStats';

export type BotStatsState = {
    loading: boolean;
    error: string | null;
    data: BotTradeStats | null;
};

const initialState: BotStatsState = {
    loading: false,
    error: null,
    data: null
};

function createBotStatsStore() {
    const { subscribe, set, update } = writable<BotStatsState>(initialState);

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
                const resp = await adminTradeApi.tradeStats();

                update((state) => ({
                    ...state,
                    loading: false,
                    data: mapBotTradeStats(resp.stats)
                }));
            } catch (e) {
                update((state) => ({
                    ...state,
                    loading: false,
                    error: e instanceof Error ? e.message : 'Не удалось загрузить статистику бота'
                }));
            }
        }
    };
}

export const botStatsStore = createBotStatsStore();