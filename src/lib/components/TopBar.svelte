<header class="topbar">
    <div class="left">
        <div class="title">Trade Bot</div>
    </div>

    <div class="right">
        <div class="time-chip">
            <span class="dot"></span>
            <span class="time">{timeStr}</span>
            <span class="tz">{tzStr}</span>
        </div>

        <div class="relative" data-avatar-root>
            <button class="avatar" on:click={() => (open = !open)}>
                {#if $tgUser?.photo_url}
                    <img src={$tgUser.photo_url} alt="avatar" />
                {:else}
                    <span>{initials($tgUser)}</span>
                {/if}
            </button>
        </div>
    </div>
</header>

<style>
    .topbar {
        padding:
                calc(12px + env(safe-area-inset-top))
                16px
                12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--tg-bg);
        color: var(--tg-text);
        border-bottom: 1px solid var(--tg-hint);
    }

    .title {
        font-weight: 700;
        font-size: 16px;
    }

    .right {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .time-chip {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 999px;
        background: var(--tg-secondary-bg);
        font-size: 13px;
    }

    .dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: var(--tg-button);
    }

    .time {
        font-weight: 600;
    }

    .tz {
        font-size: 11px;
        color: var(--tg-hint);
    }

    .avatar {
        width: 36px;
        height: 36px;
        border-radius: 999px;
        overflow: hidden;
        background: var(--tg-secondary-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--tg-text);
        font-weight: 600;
    }

    .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>