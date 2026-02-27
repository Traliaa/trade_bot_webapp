<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { tgUser } from "$lib/stores/telegram";

    let open = false;

    // время — локальное, можно потом заменить на серверное/биржевое
    let timeStr = "";
    let tzStr = "";

    function tick() {
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        timeStr = `${hh}:${mm}`;

        const offsetMin = -d.getTimezoneOffset(); // например +180
        const sign = offsetMin >= 0 ? "+" : "-";
        const h = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0");
        const m = String(Math.abs(offsetMin) % 60).padStart(2, "0");
        tzStr = `UTC${sign}${h}${m === "00" ? "" : ":" + m}`;
    }

    function close() {
        open = false;
    }

    onMount(() => {
        tick();
        const id = setInterval(tick, 1000 * 10);
        const onDoc = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // закрываем по клику вне меню
            if (!target.closest?.("[data-avatar-root]")) open = false;
        };
        document.addEventListener("click", onDoc);

        return () => {
            clearInterval(id);
            document.removeEventListener("click", onDoc);
        };
    });

    function initials(u: any) {
        const a = (u?.first_name?.[0] ?? "").toUpperCase();
        const b = (u?.last_name?.[0] ?? "").toUpperCase();
        return (a + b) || "?";
    }

    function goProfile() {
        close();
        goto("/profile");
    }

    function goSettings() {
        close();
        goto("/settings");
    }
</script>

<header class="px-4 py-3 border-b" style="border-color: rgba(0,0,0,0.08);">
    <div class="flex items-center justify-between gap-3">
        <div class="font-semibold">Trade Bot</div>

        <div class="flex items-center gap-2">
            <!-- time chip -->
            <div
                    class="flex items-center gap-2 px-3 py-2 rounded-full text-sm"
                    style="background: rgba(0,0,0,0.06); color: var(--tg-text);"
                    title="Локальное время"
            >
                <span class="inline-block w-2 h-2 rounded-full" style="background: rgba(0,0,0,0.35)"></span>
                <span class="font-medium">{timeStr}</span>
                <span class="text-xs" style="color: var(--tg-hint);">{tzStr}</span>
            </div>

            <!-- avatar + dropdown -->
            <div class="relative" data-avatar-root>
                <button
                        class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
                        style="background: rgba(0,0,0,0.08);"
                        on:click={() => (open = !open)}
                        aria-label="Открыть профиль"
                >
                    {#if $tgUser?.photo_url}
                        <img src={$tgUser.photo_url} alt="avatar" class="w-full h-full object-cover" />
                    {:else}
                        <span class="text-sm font-semibold" style="color: var(--tg-text);">{initials($tgUser)}</span>
                    {/if}
                </button>

                {#if open}
                    <div
                            class="absolute right-0 mt-2 w-56 rounded-2xl border shadow-sm overflow-hidden"
                            style="background: var(--tg-bg); border-color: rgba(0,0,0,0.10);"
                    >
                        <div class="px-4 py-3">
                            <div class="text-sm font-semibold">
                                {$tgUser ? `${$tgUser.first_name ?? ""} ${$tgUser.last_name ?? ""}` : "Гость"}
                            </div>
                            {#if $tgUser?.username}
                                <div class="text-xs" style="color: var(--tg-hint);">@{$tgUser.username}</div>
                            {/if}
                        </div>

                        <div class="h-px" style="background: rgba(0,0,0,0.08)"></div>

                        <button class="w-full text-left px-4 py-3 text-sm hover:opacity-80" on:click={goProfile}>
                            Профиль
                        </button>
                        <button class="w-full text-left px-4 py-3 text-sm hover:opacity-80" on:click={goSettings}>
                            Настройки
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</header>