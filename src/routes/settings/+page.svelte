<script lang="ts">
    import { tgReady } from "$lib/stores/telegram";
    import { onMount } from "svelte";
    import { tradeApi } from "$lib/api/trade";
    import { me } from "$lib/stores/auth"; // если у вас есть /api/me

    let userId = 0;
    let positions: any[] = [];
    let mode: string = "";

    onMount(async () => {
        const m = await me(); // или как у тебя называется
        userId = m.id;        // подстрой под структуру

        positions = (await tradeApi.statusForUser(userId)).positions;
        mode = (await tradeApi.tuneMode()).mode;
    });

    async function disable() {
        await tradeApi.disableUser(userId);
    }

    async function toggle() {
        mode = (await tradeApi.toggleTuneMode()).mode;
    }
</script>

<button on:click={disable}>Disable</button>
<button on:click={toggle}>Toggle mode ({mode})</button>

<pre>{JSON.stringify(positions, null, 2)}</pre>