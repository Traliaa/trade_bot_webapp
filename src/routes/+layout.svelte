<script lang="ts">
    import { onMount } from "svelte";
    import { initTelegram } from "$lib/stores/telegram";
    import { loginViaTelegram } from "$lib/auth/login";
    import AppShell from "$lib/components/app/AppShell.svelte";
    import { authed, authError } from "$lib/stores/auth";

    let booting = true;

    onMount(async () => {
        try {
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
        text-align: center;
        gap: 8px;
        color: white;
    }

    .title {
        font-size: 18px;
        font-weight: 700;
    }

    .sub {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.55);
    }

    .error .title {
        color: #fca5a5;
    }
</style>