<script lang="ts">
    import ActiveDealsList from "$lib/components/ActiveDealsList.svelte";

    // мок — потом заменим на fetch с твоего Go API
    const deals = [
        { symbol: "BTC-USDT-SWAP", side: "BUY", entry: 51000, pnlPct: 1.24, size: 0.02, updatedAt: "сейчас" },
        { symbol: "ETH-USDT-SWAP", side: "SELL", entry: 2800, pnlPct: -0.35, size: 0.5, updatedAt: "1 мин назад" }
    ];
</script>

<h1 class="text-lg font-semibold mb-3">Активные сделки</h1>
<ActiveDealsList {deals} />