<script lang="ts">
    import { tgReady, tgUser } from "$lib/stores/telegram";
    import { DEV_USER_ID } from "$lib/env/public";
    import { trade, UserSettings } from "$lib/api/tradeApi";



    $: userId = $tgUser?.id ?? (import.meta.env.DEV && DEV_USER_ID ? DEV_USER_ID : null);

    let loading = false;
    let saving = false;
    let error: string | null = null;
    let ok: string | null = null;

    let model: UserSettings | null = null;

    function setErr(e: any) {
        error = e?.message ?? String(e);
    }

    async function load() {
        if (!userId) return;
        loading = true;
        error = null;
        ok = null;
        try {
            // GET /api/user/{id}/settings
            model = await trade.getSettings(userId);
        } catch (e) {
            setErr(e);
            model = null;
        } finally {
            loading = false;
        }
    }

    async function save() {
        if (!userId || !model) return;
        saving = true;
        error = null;
        ok = null;
        try {
            // POST /api/user/{id}/settings
            await trade.applySettings(userId, model.settings);
            ok = "Сохранено";
            await load();
        } catch (e) {
            setErr(e);
        } finally {
            saving = false;
        }
    }

    $: if ($tgReady && userId) load();
</script>

<h1 class="title">Настройки</h1>

{#if !$tgReady}
    <div class="state">Инициализация Telegram…</div>
{:else if !userId}
    <div class="err">Нет Telegram-пользователя</div>
{:else if loading}
    <div class="state">Загружаю…</div>
{:else if error}
    <div class="err">Ошибка: {error}</div>
{:else if !model}
    <div class="state">Нет данных</div>
{:else}
    <!-- Feature flags -->
    <section class="card">
        <div class="k">Фичи</div>

        <label class="toggle">
            <input type="checkbox" bind:checked={model.settings.FeatureFlags.near_tp_protect_enabled} />
            <span>Near TP protect</span>
        </label>

        <label class="toggle">
            <input type="checkbox" bind:checked={model.settings.FeatureFlags.simulate_before_entry} />
            <span>Simulate before entry</span>
        </label>

        <label class="toggle">
            <input type="checkbox" bind:checked={model.settings.FeatureFlags.deal_chart_enabled} />
            <span>Deal chart</span>
        </label>

        <label class="toggle">
            <input type="checkbox" bind:checked={model.settings.FeatureFlags.auto_recommend_enabled} />
            <span>Auto recommend</span>
        </label>

        <label class="toggle">
            <input type="checkbox" bind:checked={model.settings.FeatureFlags.pro_mode} />
            <span>PRO mode</span>
        </label>
    </section>

    <!-- Trading settings -->
    <section class="card">
        <div class="k">Торговля</div>

        <div class="grid">
            <label class="field">
                <span>Leverage</span>
                <input type="number" min="1" step="1" bind:value={model.settings.TradingSettings.leverage} />
            </label>

            <label class="field">
                <span>Max open positions</span>
                <input type="number" min="0" step="1" bind:value={model.settings.TradingSettings.max_open_positions} />
            </label>

            <label class="field">
                <span>Position %</span>
                <input type="number" min="0" step="0.1" bind:value={model.settings.TradingSettings.position_pct} />
            </label>

            <label class="field">
                <span>Risk %</span>
                <input type="number" min="0" step="0.1" bind:value={model.settings.TradingSettings.risk_pct} />
            </label>

            <label class="field">
                <span>Stop %</span>
                <input type="number" min="0" step="0.1" bind:value={model.settings.TradingSettings.stop_pct} />
            </label>

            <label class="field">
                <span>TP (RR)</span>
                <input type="number" min="0" step="0.1" bind:value={model.settings.TradingSettings.take_profit_rr} />
            </label>

            <label class="field">
                <span>Confirm timeout</span>
                <input placeholder="30m" bind:value={model.settings.TradingSettings.confirm_timeout} />
            </label>

            <label class="field">
                <span>Cooldown per symbol</span>
                <input placeholder="10m" bind:value={model.settings.TradingSettings.cooldown_per_symbol} />
            </label>
        </div>
    </section>

    <!-- Trailing -->
    <section class="card">
        <div class="k">Trailing / Partial</div>

        <div class="grid">
            <label class="field"><span>BE trigger (R)</span><input type="number" step="0.05" bind:value={model.settings.TrailingConfig.be_trigger_r} /></label>
            <label class="field"><span>BE offset (R)</span><input type="number" step="0.05" bind:value={model.settings.TrailingConfig.be_offset_r} /></label>

            <label class="field"><span>Lock trigger (R)</span><input type="number" step="0.05" bind:value={model.settings.TrailingConfig.lock_trigger_r} /></label>
            <label class="field"><span>Lock offset (R)</span><input type="number" step="0.05" bind:value={model.settings.TrailingConfig.lock_offset_r} /></label>

            <label class="field"><span>Time stop bars</span><input type="number" step="1" bind:value={model.settings.TrailingConfig.time_stop_bars} /></label>
            <label class="field"><span>Time stop min MFE (R)</span><input type="number" step="0.05" bind:value={model.settings.TrailingConfig.time_stop_min_mfe_r} /></label>

            <label class="toggle">
                <input type="checkbox" bind:checked={model.settings.TrailingConfig.partial_enabled} />
                <span>Partial enabled</span>
            </label>

            <label class="field"><span>Partial trigger (R)</span><input type="number" step="0.05" bind:value={model.settings.TrailingConfig.partial_trigger_r} /></label>
            <label class="field"><span>Partial close frac</span><input type="number" step="0.05" min="0" max="1" bind:value={model.settings.TrailingConfig.partial_close_frac} /></label>
        </div>
    </section>

    <div class="actions">
        <button class="btn ghost" disabled={saving} on:click={load}>Reload</button>
        <button class="btn" disabled={saving} on:click={save}>{saving ? "Saving…" : "Save"}</button>
    </div>

    {#if ok}
        <div class="ok">{ok}</div>
    {/if}
{/if}

<style>
    .title{ font-size:16px; font-weight:900; margin:0 0 12px; color:var(--tg-text); }
    .state{ color:var(--tg-hint); padding:8px 2px; }
    .err{ margin-top:8px; background:var(--tg-bg); border:1px solid var(--tg-hint); border-radius:14px; padding:10px; color:var(--tg-text); }
    .ok{ margin-top:8px; background:var(--tg-secondary-bg); border:1px solid var(--tg-hint); border-radius:14px; padding:10px; color:var(--tg-text); }

    .card{ background:var(--tg-bg); border:1px solid var(--tg-hint); border-radius:18px; padding:14px; margin-bottom:12px; }
    .k{ font-size:12px; color:var(--tg-hint); font-weight:800; margin-bottom:10px; }

    .grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    @media (max-width: 420px){ .grid{ grid-template-columns:1fr; } }

    .field{ display:flex; flex-direction:column; gap:6px; }
    .field span{ font-size:12px; color:var(--tg-hint); font-weight:800; }
    .field input{
        padding:10px 12px;
        border-radius:14px;
        border:1px solid var(--tg-hint);
        background: var(--tg-secondary-bg);
        color: var(--tg-text);
        outline: none;
    }

    .toggle{
        display:flex;
        align-items:center;
        gap:10px;
        padding:10px 12px;
        border-radius:14px;
        border:1px solid var(--tg-hint);
        background: var(--tg-secondary-bg);
        color: var(--tg-text);
        font-weight:800;
    }
    .toggle input{ width:18px; height:18px; }

    .actions{ display:flex; gap:10px; }
    .btn{
        width:100%;
        padding:10px 12px;
        border-radius:14px;
        font-weight:900;
        font-size:13px;
        background:var(--tg-button);
        color:var(--tg-button-text);
        border:1px solid var(--tg-button);
    }
    .btn.ghost{ background:transparent; color:var(--tg-text); border-color:var(--tg-hint); }
</style>