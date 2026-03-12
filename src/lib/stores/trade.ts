import { writable } from "svelte/store";
import { trade } from "$lib/api/tradeApi";
import { mapOpenPositionsToUi, type UiPosition } from "$lib/mappers/positions";

type TradeState = {
    loading: boolean;
    error: string | null;
    positions: UiPosition[];
};

const initialState: TradeState = {
    loading: false,
    error: null,
    positions: [],
};

function createTradeStore() {
    const { subscribe, set, update } = writable<TradeState>(initialState);

    return {
        subscribe,

        reset: () => set(initialState),

        loadPositions: async () => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const resp = await trade.status();

                update((state) => ({
                    ...state,
                    loading: false,
                    positions: mapOpenPositionsToUi(resp.positions ?? []),
                }));
            } catch (e) {
                update((state) => ({
                    ...state,
                    loading: false,
                    error: e instanceof Error ? e.message : "Не удалось загрузить позиции",
                }));
            }
        },
    };
}

export const tradeStore = createTradeStore();