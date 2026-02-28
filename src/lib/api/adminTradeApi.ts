import { trade } from "$lib/api/tradeApi.ts";
import { isAdminNow } from "$lib/auth/admin";

function requireAdmin() {
    if (!isAdminNow()) throw new Error("forbidden: admin only");
}

export const adminTradeApi = {
    tuneMode: async () => {
        requireAdmin();
        return trade.tuneMode();
    },
    toggleTuneMode: async () => {
        requireAdmin();
        return trade.toggleTuneMode();
    },
    autoTuneNow: async () => {
        requireAdmin();
        return trade.autoTuneNow();
    },
    strategyRejects: async (reset = false) => {
        requireAdmin();
        return trade.strategyRejects(reset);
    },
    strategyTuning: async () => {
        requireAdmin();
        return trade.strategyTuning();
    }
};