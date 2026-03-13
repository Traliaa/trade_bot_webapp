<script lang="ts">
    import Card from '$lib/components/ui/Card.svelte';
    import InfoRow from '$lib/components/ui/InfoRow.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';

    export let runtime: any;
</script>

<Card>
    <SectionHeader
            title="Runtime tuning"
            subtitle="Актуальные runtime-параметры стратегии"
    />

    {#if runtime}
        <div class="rows">
            <InfoRow>
                <span slot="label">breakoutPct</span>
                <span slot="value">{runtime.breakoutPct ?? '—'}</span>
            </InfoRow>

            <InfoRow>
                <span slot="label">minChannelPct</span>
                <span slot="value">{runtime.minChannelPct ?? '—'}</span>
            </InfoRow>

            <InfoRow>
                <span slot="label">minBodyPct</span>
                <span slot="value">{runtime.minBodyPct ?? '—'}</span>
            </InfoRow>

            <InfoRow>
                <span slot="label">closeUpMin</span>
                <span slot="value">{runtime.closeUpMin ?? '—'}</span>
            </InfoRow>

            <InfoRow>
                <span slot="label">closeDnMax</span>
                <span slot="value">{runtime.closeDnMax ?? '—'}</span>
            </InfoRow>
        </div>
    {:else}
        <Card className="inner-card">
            <div class="empty">Нет данных runtime tuning</div>
        </Card>
    {/if}
</Card>

<style>
    .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
        color: var(--text-main);
    }

    .inner-card {
        margin-top: 12px;
    }

    .empty {
        font-size: 13px;
        color: var(--text-muted);
    }
</style>