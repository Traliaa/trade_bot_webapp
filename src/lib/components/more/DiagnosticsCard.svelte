<script lang="ts">
    import { tgUser, tgReady } from "$lib/stores/telegram";

    let open = false;
    let payload = "";

    function buildDump() {
        if (typeof window === "undefined") return "{}";
        const w: any = window as any;
        const app = w.Telegram?.WebApp;

        const dump = {
            hasTelegram: !!w.Telegram,
            hasWebApp: !!app,
            initDataLen: app?.initData?.length ?? 0,
            initDataPreview: (app?.initData ?? "").slice(0, 120), // не палим всё
            user: app?.initDataUnsafe?.user ?? null,
            chat: app?.initDataUnsafe?.chat ?? null,
            startParam: app?.initDataUnsafe?.start_param ?? null,
            platform: app?.platform ?? null,
            version: app?.version ?? null,
            colorScheme: app?.colorScheme ?? null,
            themeParams: app?.themeParams ?? null,
            viewportHeight: app?.viewportHeight ?? null,
            viewportStableHeight: app?.viewportStableHeight ?? null,
            isExpanded: app?.isExpanded ?? null,
            tgReady: $tgReady,
            tgUserStore: $tgUser ?? null
        };

        return JSON.stringify(dump, null, 2);
    }

    function toggle() {
        open = !open;
        if (open) payload = buildDump();
    }

    async function copy() {
        payload = buildDump();
        try {
            await navigator.clipboard.writeText(payload);
            alert("Скопировано в буфер");
        } catch {
            // fallback
            prompt("Скопируй вручную:", payload);
        }
    }

    function refresh() {
        payload = buildDump();
    }
</script>

<div class="debug-wrap">
    <button class="dbg-btn" on:click={toggle}>
        🧪 Debug TG
    </button>

    {#if open}
        <div class="dbg-card">
            <div class="dbg-actions">
                <button class="dbg-action" on:click={refresh}>Обновить</button>
                <button class="dbg-action" on:click={copy}>Копировать</button>
                <button class="dbg-action" on:click={() => (open = false)}>Закрыть</button>
            </div>

            <pre class="dbg-pre">{payload}</pre>
        </div>
    {/if}
</div>

<style>
    .debug-wrap {
        position: fixed;
        right: 12px;
        bottom: calc(12px + env(safe-area-inset-bottom));
        z-index: 9999;
    }

    .dbg-btn {
        padding: 10px 12px;
        border-radius: 14px;
        background: var(--tg-button);
        color: var(--tg-button-text, #fff);
        border: none;
        font-weight: 700;
        font-size: 13px;
    }

    .dbg-card {
        margin-top: 10px;
        width: min(92vw, 520px);
        max-height: min(60vh, 520px);
        overflow: hidden;
        border-radius: 16px;
        border: 1px solid rgba(0,0,0,0.15);
        background: var(--tg-bg);
        color: var(--tg-text);
        box-shadow: 0 10px 30px rgba(0,0,0,0.18);
    }

    .dbg-actions {
        display: flex;
        gap: 8px;
        padding: 10px;
        border-bottom: 1px solid rgba(0,0,0,0.10);
        background: var(--tg-secondary-bg);
    }

    .dbg-action {
        padding: 8px 10px;
        border-radius: 12px;
        border: 1px solid rgba(0,0,0,0.12);
        background: transparent;
        color: var(--tg-text);
        font-size: 12px;
        font-weight: 600;
    }

    .dbg-pre {
        margin: 0;
        padding: 12px;
        overflow: auto;
        font-size: 11px;
        line-height: 1.35;
        color: var(--tg-text);
        white-space: pre-wrap;
        word-break: break-word;
    }
</style>