<script lang="ts">
    import { tgReady } from "$lib/stores/telegram";
    import { onMount } from "svelte";
    import { trade } from "$lib/api/tradeApi.ts";
    import { me } from "$lib/stores/auth"; // если у вас есть /api/me

    let userId = 0;
    let positions: any[] = [];
    let mode: string = "";

    onMount(async () => {
        const m = await me(); // или как у тебя называется
        userId = m.id;        // подстрой под структуру

        positions = (await trade.statusForUser(userId)).positions;
        mode = (await trade.tuneMode()).mode;
    });

    async function disable() {
        await trade.disableUser(userId);
    }

    async function toggle() {
        mode = (await trade.toggleTuneMode()).mode;
    }
</script>

<button on:click={disable}>Disable</button>
<button on:click={toggle}>Toggle mode ({mode})</button>

<pre>{JSON.stringify(positions, null, 2)}</pre>