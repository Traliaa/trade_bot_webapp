<script lang="ts">
    import TopBar from "$lib/components/TopBar.svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    const tabs = [
        { href: "/", label: "Сделки" },      // главный = активные сделки
        { href: "/trades", label: "История" },
        { href: "/settings", label: "Настройки" },
        { href: "/partial", label: "Partial" },
        { href: "/pro", label: "PRO" }
    ];

    $: path = $page.url.pathname;
    function isActive(href: string) {
        return href === "/" ? path === "/" : path.startsWith(href);
    }
</script>

<div class="min-h-screen flex flex-col">
    <TopBar />

    <main class="flex-1 px-4 py-4">
        <slot />
    </main>

    <nav class="px-2 py-2 border-t" style="border-color: rgba(0,0,0,0.08);">
        <div class="grid grid-cols-5 gap-1">
            {#each tabs as t}
                <button
                        class="py-2 rounded-xl text-xs"
                        style="
						background: {isActive(t.href) ? 'rgba(0,0,0,0.06)' : 'transparent'};
						color: {isActive(t.href) ? 'var(--tg-text)' : 'var(--tg-hint)'};
					"
                        on:click={() => goto(t.href)}
                >
                    {t.label}
                </button>
            {/each}
        </div>
    </nav>
</div>