<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import { trade, type ManualCloseResult } from '$lib/api/tradeApi';
    import { historyStore } from '$lib/stores/history';
    import { ApiError } from '$lib/api/client';

    export let guid: string;
    export let symbol: string;
    export let side: string;
    let confirming = false;
    let fraction = 0.5;
    let busy = false;
    let error = '';
    let result: ManualCloseResult | null = null;
    let pending: { request_id: string; fraction: number } | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let destroyed = false;
    let checks = 0;
    const terminal = (s: string) => ['filled', 'canceled', 'rejected'].includes(s);
    $: key = `manual-close:${guid}`;

    onMount(() => {
        try { pending = JSON.parse(localStorage.getItem(key) ?? 'null'); } catch { pending = null; }
        if (pending) void checkStatus();
    });
    onDestroy(() => { destroyed = true; clearTimeout(timer); });

    function accept(value: ManualCloseResult) {
        result = value;
        if (terminal(value.status)) {
            localStorage.removeItem(key);
            pending = null;
            void historyStore.loadAll();
        } else {
            pending = { request_id: value.request_id, fraction: value.fraction };
            localStorage.setItem(key, JSON.stringify(pending));
            if (!destroyed && checks < 15) {
                clearTimeout(timer);
                timer = setTimeout(() => { void checkStatus(); }, 2000);
            }
        }
    }

    async function checkStatus() {
        if (!pending || busy) return;
        busy = true; error = ''; checks++;
        try { accept(await trade.closeStatus(guid, pending.request_id)); }
        catch (e) { error = e instanceof Error ? e.message : 'Не удалось проверить статус'; }
        finally { busy = false; }
    }

    async function submit() {
        if (busy) return;
        busy = true; error = ''; clearTimeout(timer);
        try {
            if (!pending) {
                checks = 0;
                const operation = { request_id: crypto.randomUUID(), fraction };
                // Persist before POST so a lost response cannot create a second order.
                localStorage.setItem(key, JSON.stringify(operation));
                pending = operation;
            }
            confirming = false;
            accept(await trade.closeTrade(guid, pending));
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось отправить запрос';
            if (e instanceof ApiError && [400, 404, 409].includes(e.status)) {
                pending = null;
                localStorage.removeItem(key);
            }
        } finally { busy = false; }
    }
</script>

<div class="close-controls">
    {#if pending}
        <p role="status">{result?.message ?? 'Проверяем результат запроса. Новый ордер не отправляется.'}</p>
        <Button disabled={busy} on:click={checkStatus}>Проверить статус</Button>
        {#if error}
            <Button disabled={busy} on:click={submit}>Повторить тот же запрос</Button>
        {/if}
    {:else if confirming}
        <div class="confirmation" role="group" aria-label="Подтверждение закрытия">
            <p>Закрыть {fraction * 100}% текущей позиции {symbol} ({side}) рыночным ордером?</p>
            <p>Цена определяется при исполнении. Возможны комиссия и проскальзывание.</p>
            {#if fraction < 1}
                <label>Доля закрытия
                    <select bind:value={fraction} disabled={busy}>
                        <option value={0.25}>25%</option>
                        <option value={0.5}>50%</option>
                        <option value={0.75}>75%</option>
                    </select>
                </label>
            {/if}
            <Button variant="primary" disabled={busy} on:click={submit}>Подтвердить закрытие</Button>
            <Button disabled={busy} on:click={() => confirming = false}>Отмена</Button>
        </div>
    {:else}
        <div class="actions">
            <Button disabled={busy} on:click={() => { fraction = 0.5; confirming = true; error = ''; }}>Частично</Button>
            <Button variant="primary" disabled={busy} on:click={() => { fraction = 1; confirming = true; error = ''; }}>Закрыть</Button>
        </div>
        {#if result}<p role="status">{result.message}</p>{/if}
    {/if}
    {#if error}<p class="error" role="alert">{error}</p>{/if}
</div>

<style>
    .close-controls { margin-top: 12px; font-size: 13px; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .confirmation { padding: 12px; border: 1px solid var(--border); border-radius: 12px; }
    p { margin: 8px 0; }
    label { display: block; margin: 12px 0; }
    select { margin-left: 8px; padding: 8px; background: var(--bg-soft); color: var(--text-main); }
    .error { color: var(--danger, #fb7185); }
</style>
