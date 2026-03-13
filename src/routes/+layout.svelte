<script lang="ts">
    import '../app.css';
    import { onMount } from "svelte";
    import { initTelegram } from "$lib/stores/telegram";
    import { loginViaTelegram } from "$lib/auth/login";
    import { authed, authError } from "$lib/stores/auth";
    import AppShell from "$lib/components/app/AppShell.svelte";
    import { applyTelegramTheme } from "$lib/telegram/theme";

    let booting = true;

    onMount(async () => {
        try {
            applyTelegramTheme();
            await initTelegram();
            await loginViaTelegram();
        } finally {
            booting = false;
        }
    });
</script>

<AppShell>
    {#if booting}
        <div class="boot-screen">
            <div class="title">Инициализация...</div>
            <div class="sub">Подключаем Telegram сессию</div>
        </div>
    {:else if $authed}
        <slot />
    {:else}
        <div class="boot-screen error">
            <div class="title">Не удалось войти</div>
            <div class="sub">{$authError ?? "Открой mini app через кнопку в Telegram"}</div>
        </div>
    {/if}
</AppShell>

<style>
    .boot-screen {
        min-height: 60vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 8px;
        text-align: center;
        color: var(--text-main);
    }

    .title {
        font-size: 18px;
        font-weight: 700;
    }

    .sub {
        font-size: 13px;
        color: var(--text-muted);
    }

    .error .title {
        color: var(--danger);
    }
</style>