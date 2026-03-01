<script lang="ts">
    import { onMount } from "svelte";
    import ActiveDealsList from "$lib/components/ActiveDealsList.svelte";
    import { tgUser, tgReady } from "$lib/stores/telegram";
    import { DEV_USER_ID } from "$lib/env/public";
    import { trade } from "$lib/api/tradeApi";

    type DealVM = {
        symbol: string;
        side: "BUY" | "SELL";
        entry: number;
        pnlPct: number;
        size: number;
        updatedAt: string;
    };

    // DEBUG
    type DebugRow = { name: string; ok: boolean; data: any };

    let loading = true;
    let error: string | null = null;
    let deals: DealVM[] = [];

    let debug: DebugRow[] = [];
    let debugLoading = false;

    // userId вычисляем реактивно (без get()), чтобы не ловить race на onMount
    $: userId =
        $tgUser?.id ?? (import.meta.env.DEV && DEV_USER_ID ? DEV_USER_ID : null);

    function toDealVM(p: any): DealVM {
        const symbol = p.symbol ?? p.instId ?? "UNKNOWN";
        const side =
            String(p.side ?? p.posSide ?? "BUY").toUpperCase() === "SELL" ? "SELL" : "BUY";
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

    async function loadDeals(uid: number) {
        loading = true;
        error = null;

        try {
            const res = await trade.statusForUser(uid);
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

        // Снимок текущих значений (но userId уже реактивный)
        const uid = userId;

        const calls: Array<[string, () => Promise<any>]> = [
            ["tuneMode()", () => trade.tuneMode()],
            ["strategyTuning()", () => trade.strategyTuning()],
            ["strategyRejects(reset=0)", () => trade.strategyRejects(false)],
        ];

        if (uid) {
            calls.push(["statusForUser(userId)", () => trade.statusForUser(uid)]);
            calls.push(["getSettings(userId)", () => trade.getSettings(uid)]);
        } else {
            debug = [
                ...debug,
                {
                    name: "userId",
                    ok: false,
                    data: "tgUser.id ещё не готов или Mini App открыт не из Telegram",
                },
            ];
        }

        // POST’ы (можно комментить если не надо)
        calls.push(["toggleTuneMode()", () => trade.toggleTuneMode()]);
        calls.push(["autoTuneNow()", () => trade.autoTuneNow()]);

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

    // 1) На маунте — просто стартуем debug (он сам отработает корректно, без userId=0)
    onMount(async () => {
        await runDebug();
    });

    // 2) Реактивная загрузка сделок: ждём tgReady + userId
    $: if ($tgReady && userId) {
        // чтобы не дергать API лишний раз, можно добавить простую защиту
        // но обычно достаточно: загрузим при появлении userId
        loadDeals(userId);
    }

    // 3) Если tgReady=true, но userId нет — это действительно "нет Telegram-пользователя"
    $: if ($tgReady && !userId) {
        loading = false;
        deals = [];
        error = "Нет Telegram-пользователя. Открой мини-апп из Telegram.";
    }

    function retry() {
        if (userId) loadDeals(userId);
        runDebug();
    }
</script>

<h1 class="title">Активные сделки</h1>

{#if !$tgReady}
    <div class="state">Инициализация Telegram…</div>
{:else if loading}
    <div class="state">Загружаю…</div>
{:else if error}
    <div class="state">
        <div class="err">Ошибка: {error}</div>
        <button class="btn" on:click={retry}>Повторить</button>
    </div>
{:else}
    <ActiveDealsList {deals} />
{/if}

<!-- DEBUG PANEL -->
{#if import.meta.env.DEV}
    <div>DEV MODE</div>
{:else}
    <div>PROD MODE</div>
{/if}

<div style="color: var(--tg-hint); font-size: 12px;">
    DEV: {String(import.meta.env.DEV)} |
    PUBLIC_DEV_USER_ID: {import.meta.env.PUBLIC_DEV_USER_ID ?? "—"}
</div>

<div style="color: var(--tg-hint); font-size: 12px;">
    DEV: {String(import.meta.env.DEV)} | DEV_USER_ID: {DEV_USER_ID || "—"}
</div>

<section class="dbg">
    <div class="dbgHead">
        <div class="dbgTitle">Debug API</div>
        <button class="btn ghost" disabled={debugLoading} on:click={runDebug}>
            {debugLoading ? "…" : "Run"}
        </button>
    </div>

    <div class="dbgMeta" style="color: var(--tg-hint);">
        tgReady: {String($tgReady)} |
        tgUser.id: {($tgUser?.id ?? "—")} |
        effective userId: {userId ?? "—"}
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
    .state {
        color: var(--tg-hint);
        padding: 8px 2px;
    }
    .err {
        color: var(--tg-text);
        margin-bottom: 10px;
    }
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
    .dbgHead {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
    }
    .dbgTitle {
        font-weight: 900;
        color: var(--tg-text);
    }
    .dbgMeta {
        margin-top: 6px;
        font-size: 12px;
    }
    .dbgRow {
        margin-top: 12px;
    }
    .dbgName {
        font-size: 13px;
        font-weight: 800;
        margin-bottom: 6px;
    }
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