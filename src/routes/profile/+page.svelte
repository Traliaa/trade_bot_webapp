<script lang="ts">
    import { tgUser } from "$lib/stores/telegram";
    import { goto } from "$app/navigation";
</script>

<h1 class="text-lg font-semibold mb-3">Профиль</h1>

{#if $tgUser}
    <div class="rounded-2xl border p-4" style="border-color: rgba(0,0,0,0.10);">
        <div class="text-base font-semibold">
            {$tgUser.first_name} {$tgUser.last_name}
        </div>
        {#if $tgUser.username}
            <div class="text-sm" style="color: var(--tg-hint);">@{$tgUser.username}</div>
        {/if}
        <div class="text-sm mt-2" style="color: var(--tg-hint);">
            Telegram ID: {$tgUser.id}
        </div>
    </div>

    <div class="mt-4 flex gap-2">
        <button
                class="px-4 py-3 rounded-2xl text-sm font-semibold"
                style="background: var(--tg-btn); color: var(--tg-btn-text);"
                on:click={() => goto("/settings")}
        >
            Открыть настройки
        </button>
    </div>
{:else}
    <div style="color: var(--tg-hint);">Открой WebApp внутри Telegram.</div>
{/if}