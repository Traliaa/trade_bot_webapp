import { writable } from "svelte/store";
import { trade, type UserSettings } from "$lib/api/tradeApi";

type SettingsState = {
    loading: boolean;
    saving: boolean;
    error: string | null;
    data: UserSettings | null;
};

const initialState: SettingsState = {
    loading: false,
    saving: false,
    error: null,
    data: null,
};

function createSettingsStore() {
    const { subscribe, update, set } = writable<SettingsState>(initialState);

    return {
        subscribe,

        reset: () => set(initialState),

        load: async () => {
            update((state) => ({ ...state, loading: true, error: null }));

            try {
                const data = await trade.getSettings();

                update((state) => ({
                    ...state,
                    loading: false,
                    data,
                }));
            } catch (e) {
                update((state) => ({
                    ...state,
                    loading: false,
                    error: e instanceof Error ? e.message : "Не удалось загрузить настройки",
                }));
            }
        },

        save: async (settings: UserSettings) => {
            update((state) => ({ ...state, saving: true, error: null }));

            try {
                await trade.applySettings(settings);

                update((state) => ({
                    ...state,
                    saving: false,
                    data: settings,
                }));
            } catch (e) {
                update((state) => ({
                    ...state,
                    saving: false,
                    error: e instanceof Error ? e.message : "Не удалось сохранить настройки",
                }));
                throw e;
            }
        },
    };
}

export const settingsStore = createSettingsStore();