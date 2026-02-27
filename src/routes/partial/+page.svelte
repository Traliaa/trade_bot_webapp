<script lang="ts">
    import { tgReady } from "$lib/stores/telegram";
</script>

{#if !$tgReady}
    <div style="color: var(--tg-hint);">Loading…</div>
{:else}
    <h1 class="text-lg font-semibold mb-2">Позиции</h1>
    <div style="color: var(--tg-hint);">Дальше здесь будет список открытых позиций и PnL.</div>
{/if}