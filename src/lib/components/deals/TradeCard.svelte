<script lang="ts">
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

<div class="trade-card">
    <div class:long-accent={isLong} class:short-accent={!isLong} class="accent"></div>

    <div class="top">
        <div class="left">
            <div class="pair">{position.pair}</div>

            <div class="meta-inline">
        <span class:long-badge={isLong} class:short-badge={!isLong} class="badge">
          {position.side}
        </span>

                <span class="opened">Открыта {position.opened}</span>
            </div>
        </div>

        <div class:profit={isProfit} class:loss={!isProfit} class="pnl">
            {position.pnlPct}
        </div>
    </div>

    <div class="grid">
        <div class="mini-card">
            <div class="mini-label">Вход</div>
            <div class="mini-value">{position.entry}</div>
        </div>

        <div class="mini-card">
            <div class="mini-label">Цена</div>
            <div class="mini-value">{position.current}</div>
        </div>
    </div>

    <div class="footer-row">
        <span class="footer-label">Размер</span>
        <span class="footer-value">{position.size}</span>
    </div>

    <div class="actions">
        <button class="primary" type="button">
            Частично закрыть
        </button>

        <button class="secondary" type="button">
            Закрыть
        </button>
    </div>
</div>

<style>
    .trade-card {
        position: relative;
        overflow: hidden;
        border-radius: 20px;
        padding: 14px;
        background: #111827;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .accent {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
    }

    .long-accent {
        background: #34d399;
    }

    .short-accent {
        background: #fb7185;
    }

    .top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        padding-left: 4px;
    }

    .left {
        min-width: 0;
    }

    .pair {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
    }

    .meta-inline {
        margin-top: 6px;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 10px;
        font-weight: 600;
    }

    .long-badge {
        color: #34d399;
        background: rgba(52, 211, 153, 0.12);
        border: 1px solid rgba(52, 211, 153, 0.18);
    }

    .short-badge {
        color: #fb7185;
        background: rgba(251, 113, 133, 0.12);
        border: 1px solid rgba(251, 113, 133, 0.18);
    }

    .opened {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.4);
    }

    .pnl {
        font-size: 18px;
        font-weight: 700;
        white-space: nowrap;
    }

    .profit {
        color: #34d399;
    }

    .loss {
        color: #fb7185;
    }

    .grid {
        margin-top: 12px;
        margin-left: 4px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .mini-card {
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        padding: 10px;
    }

    .mini-label {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.45);
    }

    .mini-value {
        margin-top: 4px;
        font-size: 13px;
        font-weight: 600;
        color: #fff;
    }

    .footer-row {
        margin-top: 12px;
        margin-left: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        border-radius: 12px;
        background: #0b1220;
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 10px 12px;
    }

    .footer-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
    }

    .footer-value {
        font-size: 13px;
        font-weight: 600;
        color: #fff;
    }

    .actions {
        margin-top: 14px;
        margin-left: 4px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .actions button {
        height: 44px;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 600;
    }

    .primary {
        border: 0;
        background: #1d4ed8;
        color: white;
    }

    .secondary {
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.04);
        color: white;
    }
</style>