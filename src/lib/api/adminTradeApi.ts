
import {api} from "$lib/api/client";


export type ISODateTime = string;

export type TuneMode = "off" | "safe" | "aggressive" | string;
export type TuneDecision = unknown;
export type RuntimeTuning = unknown;
export type RejectSnapshot = unknown;
export type AutoTuneResponse = {
    decision: TuneDecision;
    runtime: RuntimeTuning;
    from: ISODateTime;
    to: ISODateTime;
    changed: boolean;
    mode: TuneMode;
};

const postEmpty = <T>(url: string) =>
    api<T>(url, { method: "POST", body: "{}" });

export const adminTradeApi = {
    tuneMode: async () => {
        return api<{ mode: TuneMode }>(`/api/strategy/tune/mode`);
    },
    toggleTuneMode: async () => {
        return postEmpty<{ mode: TuneMode }>(`/api/strategy/tune/toggle`);
    },
    autoTuneNow: async () => {
        return postEmpty<AutoTuneResponse>(`/api/strategy/tune/auto`);
    },
    strategyRejects: async (reset = false) => {
        return api<RejectSnapshot>(`/api/strategy/rejects?reset=${reset ? "1" : "0"}`);
    },
    strategyTuning: async () => {
        return api<{ runtime: RuntimeTuning; from: ISODateTime; to: ISODateTime }>(
            `/api/strategy/runtime`
        );
    }
};


