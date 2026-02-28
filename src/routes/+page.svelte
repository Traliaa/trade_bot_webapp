<script lang="ts">
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import ActiveDealsList from "$lib/components/ActiveDealsList.svelte";
    import { tgUser } from "$lib/stores/telegram";
    import { DEV_USER_ID } from "$lib/env/public";
    // путь подстрой под свой файл
    import { trade } from "$lib/api/tradeApi.ts";


    function getUserId(): number | null {
        const u = get(tgUser);
        return u?.id ?? (import.meta.env.DEV && DEV_USER_ID ? DEV_USER_ID : null);
    }
    type DealVM = {
        symbol: string;
        side: "BUY" | "SELL";
        entry: number;
        pnlPct: number;
        size: number;
        updatedAt: string;
    };

    let loading = true;
    let error: string | null = null;
    let deals: DealVM[] = [];

    // DEBUG
    type DebugRow = { name: string; ok: boolean; data: any };
    let debug: DebugRow[] = [];
    let debugLoading = false;

    function toDealVM(p: any): DealVM {
        const symbol = p.symbol ?? p.instId ?? "UNKNOWN";
        const side = String(p.side ?? p.posSide ?? "BUY").toUpperCase() === "SELL" ? "SELL" : "BUY";
        const entry = Number(p.entry ?? p.avgPx ?? p.entryPrice ?? 0);
        const size = Number(p.size ?? p.pos ?? p.sz ?? p.qty ?? 0);

        const pnlPctFromApi = p.pnlPct ?? p.pnl_percent ?? p.pnlRatio ?? null;
        let pnlPct = pnlPctFromApi != null ? Number(pnlPctFromApi) : 0;

        if (pnlPctFromApi == null) {
            const mark = Number(p.mark ?? p.markPx ?? p.markPrice ?? p.last ?? 0);
            if (entry > 0 && mark > 0) {
                const raw = ((mark - entry) / entry) * 100;
                pnlPct = side === "BUY" ? raw : -raw;
            }
        }

        const updatedAt = p.updatedAt ?? p.ts ?? "сейчас";
        return { symbol, side, entry, pnlPct, size, updatedAt };
    }

    async function loadDeals() {
        loading = true;
        error = null;

        try {

            const userId = getUserId();
            if (!userId) {
                deals = [];
                error = "Нет Telegram-пользователя. Открой мини-апп из Telegram.";
                return;
            }

            const res = await trade.statusForUser(userId);
            deals = (res.positions ?? []).map(toDealVM);
        } catch (e: any) {
            error = e?.message ?? String(e);
            deals = [];
        } finally {
            loading = false;
        }
    }

    async function runDebug() {
        debugLoading = true;
        debug = [];

        const u = get(tgUser);
        const userId = u?.id;

        const calls: Array<[string, () => Promise<any>]> = [
            ["tuneMode()", () => trade.tuneMode()],
            ["strategyTuning()", () => trade.strategyTuning()],
            ["strategyRejects(reset=0)", () => trade.strategyRejects(false)],
            ["statusForUser(userId)", () => trade.statusForUser(userId ?? 0)],
            ["getSession(userId)", () => trade.getSession(userId ?? 0)],
            // POST’ы (можно комментить если страшно)
            ["toggleTuneMode()", () => trade.toggleTuneMode()],
            ["autoTuneNow()", () => trade.autoTuneNow()],
        ];

        for (const [name, fn] of calls) {
            try {
                const data = await fn();
                debug = [...debug, { name, ok: true, data }];
            } catch (e: any) {
                debug = [...debug, { name, ok: false, data: e?.message ?? String(e) }];
            }
        }

        debugLoading = false;
    }

    onMount(async () => {
        // сначала сделки, потом debug
        await loadDeals();
        await runDebug();
    });
</script>

<h1 class="title">Активные сделки</h1>

{#if loading}
    <div class="state">Загружаю…</div>
{:else if error}
    <div class="state">
        <div class="err">Ошибка: {error}</div>
        <button class="btn" on:click={loadDeals}>Повторить</button>
    </div>
{:else}
    <ActiveDealsList {deals} />
{/if}
<div style="color: var(--tg-hint); font-size: 12px;">
    DEV: {String(import.meta.env.DEV)} |
    PUBLIC_DEV_USER_ID: {import.meta.env.PUBLIC_DEV_USER_ID ?? "—"}
</div>
<div style="color: var(--tg-hint); font-size: 12px;">
    DEV: {String(import.meta.env.DEV)} | DEV_USER_ID: {DEV_USER_ID || "—"}
</div>
<!-- DEBUG PANEL -->
<section class="dbg">
    <div class="dbgHead">
        <div class="dbgTitle">Debug API</div>
        <button class="btn ghost" disabled={debugLoading} on:click={runDebug}>
            {debugLoading ? "…" : "Run"}
        </button>
    </div>

    <div class="dbgMeta" style="color: var(--tg-hint);">
        tgUser.id: {getUserId() ?? "—"}
    </div>

    {#each debug as r}
        <div class="dbgRow">
            <div class="dbgName" style="color: var(--tg-text);">
                {r.ok ? "✅" : "❌"} {r.name}
            </div>
            <pre class="dbgPre">{typeof r.data === "string" ? r.data : JSON.stringify(r.data, null, 2)}</pre>
        </div>
    {/each}
</section>

<style>
    .title {
        font-size: 16px;
        font-weight: 800;
        margin: 0 0 12px;
        color: var(--tg-text);
    }
    .state { color: var(--tg-hint); padding: 8px 2px; }
    .err { color: var(--tg-text); margin-bottom: 10px; }
    .btn {
        width: 100%;
        padding: 10px 12px;
        border-radius: 14px;
        font-weight: 800;
        background: var(--tg-button);
        color: var(--tg-button-text);
        border: 1px solid var(--tg-button);
    }
    .btn.ghost {
        width: auto;
        background: transparent;
        color: var(--tg-text);
        border-color: var(--tg-hint);
    }

    .dbg {
        margin-top: 16px;
        background: var(--tg-bg);
        border: 1px solid var(--tg-hint);
        border-radius: 18px;
        padding: 12px;
    }
    .dbgHead { display:flex; justify-content:space-between; align-items:center; gap:10px; }
    .dbgTitle { font-weight: 900; color: var(--tg-text); }
    .dbgMeta { margin-top: 6px; font-size: 12px; }
    .dbgRow { margin-top: 12px; }
    .dbgName { font-size: 13px; font-weight: 800; margin-bottom: 6px; }
    .dbgPre {
        background: var(--tg-secondary-bg);
        border: 1px solid var(--tg-hint);
        border-radius: 14px;
        padding: 10px;
        font-size: 11px;
        color: var(--tg-text);
        overflow: auto;
        max-height: 220px;
    }
</style>