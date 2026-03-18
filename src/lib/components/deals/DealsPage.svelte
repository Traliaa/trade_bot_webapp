<script lang="ts">
    import ActiveDealsList from './ActiveDealsList.svelte';
    import TradeHistoryList from './TradeHistoryList.svelte';
    import SegmentedTabs from '$lib/components/ui/SegmentedTabs.svelte';
    import type {SegmentedTabItem} from "$lib/types/ui";

    let tab: 'active' | 'history' = 'active';

    const items: SegmentedTabItem[] = [
        { key: 'active', label: 'Активные' },
        { key: 'history', label: 'История' }
    ];
</script>

<div class="stack">
    <SegmentedTabs bind:value={tab} {items} columns={2} size="md" />

    {#if tab === 'active'}
        <ActiveDealsList />
    {:else}
        <TradeHistoryList />
    {/if}
</div>

<style>
    .stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
</style>