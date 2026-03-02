<script lang="ts">
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
    <!-- ✅ Меню (с safe-area сверху) -->
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

    <!-- ✅ Контент -->
    <main class="surface">
        <slot />
    </main>

    <!-- ✅ Safe area снизу -->
    <div class="bottom-safe"></div>
</div>

<style>
    :global(html, body) {
        height: 100%;
        margin: 0;
    }

    :global(body) {
        overflow: hidden; /* убираем второй скролл */
        background: var(--tg-bg);
    }

    .app {
        height: 100dvh;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        background: var(--tg-bg);
        color: var(--tg-text);
    }

    /* Меню сверху + safe area */
    .tabbarTop {
        padding:
                calc(10px + env(safe-area-inset-top))
                12px
                10px;

        background: var(--tg-secondary-bg);
        border-bottom: 1px solid var(--tg-hint);
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

    /* Единственный скролл */
    .surface {
        flex: 1;
        overflow: auto;
        -webkit-overflow-scrolling: touch;

        background: var(--tg-secondary-bg);
        padding: 16px;
    }

    .bottom-safe {
        height: env(safe-area-inset-bottom);
        background: var(--tg-secondary-bg);
        flex: 0 0 auto;
    }
</style>