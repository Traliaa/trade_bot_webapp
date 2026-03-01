<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { get } from "svelte/store";
    import { tgUser, tgReady } from "$lib/stores/telegram";
    import { isAdminUserId } from "$lib/auth/admin";
    import { adminTradeApi } from "$lib/api/adminTradeApi";
    import { trade } from "$lib/api/tradeApi"; // для user-scoped debug: status/settings
    import { DEV_USER_ID } from "$lib/env/public";

    let loading = false;
    let error: string | null = null;

    let mode: string | null = null;
    let runtime: any = null;
    let runtimeFrom: string | null = null;
    let runtimeTo: string | null = null;
    let rejects: any = null;

    // DEBUG
    type DebugRow = { name: string; ok: boolean; data: any };
    let debug: DebugRow[] = [];
    let debugLoading = false;

    // userId реактивно (для user-scoped debug)
    $: userId =
        $tgUser?.id ?? (import.meta.env.DEV && DEV_USER_ID ? DEV_USER_ID : null);

    function setErr(e: any) {
        error = e?.message ?? String(e);
    }

    async function loadAll() {
        loading = true;
        error = null;
        try {
            const m = await adminTradeApi.tuneMode();
            mode = (m as any).mode ?? null;

            const rt = await adminTradeApi.strategyTuning();
            runtime = (rt as any).runtime ?? null;
            runtimeFrom = (rt as any).from ?? null;
            runtimeTo = (rt as any).to ?? null;

            rejects = await adminTradeApi.strategyRejects(false);
        } catch (e) {
            setErr(e);
        } finally {
            loading = false;
        }
    }

    async function toggleMode() {
        loading = true;
        error = null;
        try {
            const res = await adminTradeApi.toggleTuneMode();
            mode = (res as any).mode ?? mode;
        } catch (e) {
            setErr(e);
        } finally {
            loading = false;
        }
    }

    async function autoTuneNow() {
        loading = true;
        error = null;
        try {
            await adminTradeApi.autoTuneNow();
            await loadAll();
        } catch (e) {
            setErr(e);
        } finally {
            loading = false;
        }
    }

    async function resetRejects() {
        loading = true;
        error = null;
        try {
            rejects = await adminTradeApi.strategyRejects(true);
        } catch (e) {
            setErr(e);
        } finally {
            loading = false;
        }
    }

    function pretty(v: any) {
        if (typeof v === "string") return v;
        try {
            return JSON.stringify(v, null, 2);
        } catch {
            return String(v);
        }
    }

    async function runDebug() {
        debugLoading = true;
        debug = [];

        const uid = userId;

        // admin-scoped (без userId)
        const calls: Array<[string, () => Promise<any>]> = [
            ["admin.tuneMode()", () => adminTradeApi.tuneMode()],
            ["admin.strategyTuning()", () => adminTradeApi.strategyTuning()],
            ["admin.strategyRejects(reset=0)", () => adminTradeApi.strategyRejects(false)],
            ["admin.toggleTuneMode()", () => adminTradeApi.toggleTuneMode()],
            ["admin.autoTuneNow()", () => adminTradeApi.autoTuneNow()],
        ];

        // user-scoped (требуют userId) — теперь вместо session используем settings
        if (uid) {
            calls.unshift(["user.statusForUser(userId)", () => trade.statusForUser(uid)]);
            calls.unshift(["user.getSettings(userId)", () => trade.getSettings(uid)]);
        } else {
            debug = [
                ...debug,
                { name: "userId", ok: false, data: "userId отсутствует (tgUser.id ещё не готов / не Telegram)" },
            ];
        }

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

    onMount(() => {
        const u = get(tgUser);
        if (!isAdminUserId(u?.id)) {
            goto("/");
            return;
        }
        loadAll();
    });
</script>

<h1 class="title">Админ</h1>

{#if !$tgReady}
    <div class="state">Инициализация Telegram…</div>
{:else}
    <section class="card">
        <div class="row">
            <div>
                <div class="k">Tune mode</div>
                <div class="v">{mode ?? "—"}</div>
            </div>
            <button class="btn" disabled={loading} on:click={toggleMode}>
                Toggle
            </button>
        </div>

        <div class="actions">
            <button class="btn ghost" disabled={loading} on:click={loadAll}>
                Refresh
            </button>
            <button class="btn" disabled={loading} on:click={autoTuneNow}>
                Auto tune now
            </button>
        </div>
    </section>

    <section class="card">
        <div class="head">
            <div>
                <div class="k">Runtime</div>
                <div class="sub">{runtimeFrom ?? "—"} → {runtimeTo ?? "—"}</div>
            </div>
        </div>

        <pre class="pre">{runtime ? JSON.stringify(runtime, null, 2) : "—"}</pre>
    </section>

    <section class="card">
        <div class="row">
            <div>
                <div class="k">Rejects</div>
                <div class="sub">Снимок отклонений стратегии</div>
            </div>
            <button class="btn ghost" disabled={loading} on:click={resetRejects}>
                Reset
            </button>
        </div>

        <pre class="pre">{rejects ? JSON.stringify(rejects, null, 2) : "—"}</pre>
    </section>

    <!-- DEBUG (под кнопкой) -->
    <section class="card">
        <div class="row">
            <div>
                <div class="k">Debug</div>
                <div class="sub">Ручной прогон запросов (ничего не автозапускается)</div>
            </div>
            <button class="btn ghost" disabled={debugLoading} on:click={runDebug}>
                {debugLoading ? "…" : "Run"}
            </button>
        </div>

        <div class="meta">
            tgReady: {String($tgReady)} |
            tgUser.id: {$tgUser?.id ?? "—"} |
            effective userId: {userId ?? "—"}
        </div>

        {#if debug.length === 0}
            <div class="state">Нажми Run — выведу результаты.</div>
        {:else}
            {#each debug as r}
                <div class="dbgRow">
                    <div class="dbgName">{r.ok ? "✅" : "❌"} {r.name}</div>
                    <pre class="pre">{pretty(r.data)}</pre>
                </div>
            {/each}
        {/if}
    </section>

    {#if loading}
        <div class="state">Выполняю…</div>
    {/if}

    {#if error}
        <div class="err">Ошибка: {error}</div>
    {/if}
{/if}

<style>
    .title {
        font-size: 16px;
        font-weight: 900;
        margin: 0 0 12px;
        color: var(--tg-text);
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

    .head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 10px;
    }

    .k {
        font-size: 12px;
        color: var(--tg-hint);
        font-weight: 800;
    }

    .v {
        margin-top: 6px;
        color: var(--tg-text);
        font-weight: 900;
        font-size: 16px;
    }

    .sub {
        margin-top: 6px;
        color: var(--tg-hint);
        font-size: 12px;
    }

    .meta {
        margin-top: 8px;
        color: var(--tg-hint);
        font-size: 12px;
    }

    .actions {
        display: flex;
        gap: 10px;
        margin-top: 12px;
    }

    .btn {
        padding: 10px 12px;
        border-radius: 14px;
        font-weight: 900;
        font-size: 13px;
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

    .pre {
        margin-top: 10px;
        background: var(--tg-secondary-bg);
        border: 1px solid var(--tg-hint);
        border-radius: 14px;
        padding: 10px;
        font-size: 11px;
        color: var(--tg-text);
        overflow: auto;
        max-height: 240px;
    }

    .dbgRow { margin-top: 12px; }
    .dbgName { font-size: 13px; font-weight: 900; color: var(--tg-text); margin-top: 8px; }

    .state {
        color: var(--tg-hint);
        padding: 6px 2px;
    }

    .err {
        margin-top: 8px;
        background: var(--tg-bg);
        border: 1px solid var(--tg-hint);
        border-radius: 14px;
        padding: 10px;
        color: var(--tg-text);
    }
</style>