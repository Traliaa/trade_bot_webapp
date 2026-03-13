<script lang="ts">
    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import StatusBadge from '$lib/components/ui/StatusBadge.svelte';

    export type UiPosition = {
        pair: string;
        side: 'Лонг' | 'Шорт';
        entry: string;
        current: string;
        pnlPct: string;
        size: string;
        opened: string;
    };

    export let position: UiPosition;

    $: isLong = position.side === 'Лонг';
    $: isProfit = position.pnlPct.startsWith('+');
</script>

<Card>
    <div class="top">
        <div class="left">
            <div class="pair">{position.pair}</div>

            <div class="meta-inline">
                <StatusBadge tone={isLong ? 'success' : 'danger'}>
                    {position.side}
                </StatusBadge>

                <span class="opened">Открыта {position.opened}</span>
            </div>
        </div>

        <div class:profit={isProfit} class:loss={!isProfit} class="pnl">
            {position.pnlPct}
        </div>
    </div>

    <div class="grid">
        <div class="mini-box">
            <div class="mini-label">Вход</div>
            <div class="mini-value">{position.entry}</div>
        </div>

        <div class="mini-box">
            <div class="mini-label">Цена</div>
            <div class="mini-value">{position.current}</div>
        </div>
    </div>

    <div class="footer-row">
        <span class="footer-label">Размер</span>
        <span class="footer-value">{position.size}</span>
    </div>

    <div class="actions">
        <Button variant="primary">
            Частично закрыть
        </Button>

        <Button variant="secondary">
            Закрыть
        </Button>
    </div>
</Card>

<style>
    .top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
    }

    .left {
        min-width: 0;
    }

    .pair {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-main, #e5e7eb);
    }

    .meta-inline {
        margin-top: 6px;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .opened {
        font-size: 11px;
        color: var(--text-muted, #6b7280);
    }

    .pnl {
        font-size: 18px;
        font-weight: 700;
        white-space: nowrap;
    }

    .profit {
        color: var(--success, #34d399);
    }

    .loss {
        color: var(--danger, #fb7185);
    }

    .grid {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .mini-box {
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        padding: 10px;
        border: 1px solid var(--border, rgba(255,255,255,0.08));
    }

    .mini-label {
        font-size: 10px;
        color: var(--text-muted, #6b7280);
    }

    .mini-value {
        margin-top: 4px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main, #e5e7eb);
    }

    .footer-row {
        margin-top: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border, rgba(255,255,255,0.08));
        padding: 10px 12px;
    }

    .footer-label {
        font-size: 12px;
        color: var(--text-muted, #6b7280);
    }

    .footer-value {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-main, #e5e7eb);
    }

    .actions {
        margin-top: 14px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }
</style>