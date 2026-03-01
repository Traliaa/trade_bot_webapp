<script lang="ts">
    import TopBar from "$lib/components/TopBar.svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { tgUser } from "$lib/stores/telegram";
    import { isAdminUserId } from "$lib/auth/admin";
    import DebugPanel from "$lib/components/DebugPanel.svelte";

    $: admin = isAdminUserId($tgUser?.id);

    const baseTabs = [
        { href: "/", label: "Сделки" },
        { href: "/partial", label: "Partial" },
        { href: "/pro", label: "PRO" },
        { href: "/settings", label: "Настройки" }
    ];

    $: tabs = admin ? [...baseTabs, { href: "/admin", label: "Админ" }] : baseTabs;

    $: path = $page.url.pathname;
    function isActive(href: string) {
        return href === "/" ? path === "/" : path.startsWith(href);
    }
</script>

<div class="app">
    <TopBar />

    <!-- главная рабочая поверхность -->
    <main class="surface">
        <slot />
    </main>

    <!-- нижняя панель тоже на secondary_bg, а не с "черным rgba" -->
    <nav class="tabbar">
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
        <div class="tabbar-safe"></div>
    </nav>
<!--    <DebugPanel />-->
</div>

<style>
    .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;

        background: var(--tg-bg);
        color: var(--tg-text);
    }

    /* Surface: основной слой контента */
    .surface {
        flex: 1;
        background: var(--tg-secondary-bg);

        padding: 16px;
        /* чтобы контент не залезал под таббар */
        padding-bottom: 84px;
    }

    /* Tabbar: фиксируем визуально как нижний слой */
    .tabbar {
        background: var(--tg-secondary-bg);
        border-top: 1px solid var(--tg-hint);
        padding: 8px 8px 0;
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

    /* Safe area снизу (iPhone) */
    .tabbar-safe {
        height: env(safe-area-inset-bottom);
    }
</style>