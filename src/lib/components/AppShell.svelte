<script lang="ts">
    import TopBar from "$lib/components/TopBar.svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { tgUser } from "$lib/stores/telegram";
    import { isAdminUserId } from "$lib/auth/admin";

    $: admin = isAdminUserId($tgUser?.id);

    const baseTabs = [
        { href: "/", label: "Сделки" },
        { href: "/settings", label: "Настройки" },
    ];

    $: tabs = admin ? [...baseTabs, { href: "/admin", label: "Админ" }] : baseTabs;

    $: path = $page.url.pathname;
    function isActive(href: string) {
        return href === "/" ? path === "/" : path.startsWith(href);
    }
</script>

<div class="app">
    <TopBar />

    <!-- ✅ TabBar наверху -->
    <nav class="tabbar tabbarTop">
        <div class="tabs">
            {#each tabs as t}
                <button
                        class="tab"
                        class:active={isActive(t.href)}
                        on:click={() => goto(t.href)}
                >
                    {t.label}
                </button>
            {/each}
        </div>
    </nav>

    <!-- ✅ Единственный скролл — только тут -->
    <main class="surface">
        <slot />
    </main>

    <!-- ✅ Safe area снизу, чтобы контент не упирался в низ на iPhone -->
    <div class="bottom-safe"></div>
</div>

<style>
    :global(html, body) {
        height: 100%;
        margin: 0;
    }
    :global(body) {
        overflow: hidden; /* ✅ убираем скролл страницы */
        background: var(--tg-bg);
    }

    .app {
        height: 100dvh; /* ✅ важнее чем 100vh в мобилках */
        display: flex;
        flex-direction: column;
        overflow: hidden; /* ✅ чтобы ничего не вылезало наружу */

        background: var(--tg-bg);
        color: var(--tg-text);
    }

    /* Tabbar сверху */
    .tabbarTop {
        background: var(--tg-secondary-bg);
        border-bottom: 1px solid var(--tg-hint);
        padding: 8px;
        flex: 0 0 auto;
    }

    .tabs {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 1fr;
        gap: 6px;
    }

    .tab {
        padding: 10px 8px;
        border-radius: 14px;
        font-size: 12px;
        line-height: 1;

        background: transparent;
        color: var(--tg-hint);
        border: 1px solid transparent;
    }

    .tab.active {
        background: var(--tg-bg);
        color: var(--tg-text);
        border-color: var(--tg-hint);
    }

    /* ✅ Основная рабочая область: скролл только здесь */
    .surface {
        flex: 1;
        overflow: auto;
        -webkit-overflow-scrolling: touch;

        background: var(--tg-secondary-bg);
        padding: 16px;
    }

    /* Safe area снизу */
    .bottom-safe {
        height: env(safe-area-inset-bottom);
        background: var(--tg-secondary-bg);
        flex: 0 0 auto;
    }
</style>