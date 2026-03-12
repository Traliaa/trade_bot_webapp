<script lang="ts">
    import { page } from '$app/stores';

    const items = [
        { href: '/', label: 'Обзор' },
        { href: '/deals', label: 'Сделки' },
        { href: '/strategy', label: 'Стратегия' },
        { href: '/more', label: 'Ещё' }
    ];

    $: pathname = $page.url.pathname;
</script>

<nav class="bottom-nav">
    {#each items as item}
        <a
                href={item.href}
                class:active={pathname === item.href}
        >
            {item.label}
        </a>
    {/each}
</nav>

<style>
    .bottom-nav {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
        background: rgba(17, 24, 39, 0.96);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(10px);
        z-index: 20;
    }

    .bottom-nav a {
        text-decoration: none;
        text-align: center;
        border-radius: 16px;
        padding: 10px 8px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        background: rgba(255, 255, 255, 0.04);
    }

    .bottom-nav a.active {
        background: #1d4ed8;
        color: white;
    }
</style>