<script lang="ts">
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

    let loading = true;
    let actionLoading = false; // для enable/disable
    let error: string | null = null;
    let deals: DealVM[] = [];

    // userId вычисляем реактивно
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

    async function enableBot() {
        if (!userId) return;
        actionLoading = true;
        error = null;
        try {
            await trade.enableUser(userId);
            await loadDeals(userId);
        } catch (e: any) {
            error = e?.message ?? String(e);
        } finally {
            actionLoading = false;
        }
    }

    async function disableBot() {
        if (!userId) return;
        actionLoading = true;
        error = null;
        try {
            await trade.disableUser(userId);
            await loadDeals(userId);
        } catch (e: any) {
            error = e?.message ?? String(e);
        } finally {
            actionLoading = false;
        }
    }

    function retry() {
        if (userId) loadDeals(userId);
    }

    // Ждём tgReady + userId и только потом грузим сделки
    $: if ($tgReady && userId) {
        loadDeals(userId);
    }

    // Если tgReady=true, но userId нет — это реально "нет Telegram-пользователя"
    $: if ($tgReady && !userId) {
        loading = false;
        deals = [];
        error = "Нет Telegram-пользователя. Открой мини-апп из Telegram.";
    }
</script>

<h1 class="title">Активные сделки</h1>

{#if !$tgReady}
    <div class="state">Инициализация Telegram…</div>
{:else}
    <!-- Управление ботом на главной -->
    <section class="card">
        <div class="row">
            <div>
                <div class="k">Бот</div>
                <div class="sub">Включение/выключение торговли</div>
            </div>
        </div>

        <div class="actions">
            <button class="btn" disabled={!userId || actionLoading} on:click={enableBot}>
                Enable
            </button>
            <button class="btn ghost" disabled={!userId || actionLoading} on:click={disableBot}>
                Disable
            </button>
        </div>

        <div class="meta">
            userId: {userId ?? "—"}
        </div>
    </section>

    {#if loading}
        <div class="state">Загружаю…</div>
    {:else if error}
        <div class="state">
            <div class="err">Ошибка: {error}</div>
            <button class="btn" on:click={retry} disabled={!userId || loading}>
                Повторить
            </button>
        </div>
    {:else}
        <ActiveDealsList {deals} />
    {/if}
{/if}

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

    .card {
        background: var(--tg-bg);
        border: 1px solid var(--tg-hint);
        border-radius: 18px;
        padding: 14px;
        margin-bottom: 12px;
    }

    .row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
    }

    .k {
        font-size: 12px;
        color: var(--tg-hint);
        font-weight: 800;
    }

    .sub {
        margin-top: 6px;
        color: var(--tg-hint);
        font-size: 12px;
    }

    .actions {
        display: flex;
        gap: 10px;
        margin-top: 12px;
    }

    .meta {
        margin-top: 8px;
        color: var(--tg-hint);
        font-size: 12px;
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
        background: transparent;
        color: var(--tg-text);
        border-color: var(--tg-hint);
    }

    .btn:disabled {
        opacity: 0.6;
    }
</style>