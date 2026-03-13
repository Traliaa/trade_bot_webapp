<script lang="ts">
    import Card from '$lib/components/ui/Card.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import SectionHeader from '$lib/components/ui/SectionHeader.svelte';
    import { hapticLight, hapticSuccess, hapticError, hapticSelection } from '$lib/telegram/haptics';

    let symbol = 'BTC-USDT-SWAP';
    let side: 'buy' | 'sell' = 'buy';
    let leverage = 1;
    let qty = 1;
    let loading = false;
    let success: string | null = null;
    let error: string | null = null;

    function setSide(next: 'buy' | 'sell') {
        side = next;
        hapticSelection();
    }

    async function submit() {
        loading = true;
        success = null;
        error = null;
        hapticLight();

        try {
            // TODO: заменить на реальную ручку
            console.log('test-trade', {
                symbol,
                side,
                leverage,
                qty
            });

            await new Promise((resolve) => setTimeout(resolve, 500));
            success = 'Тестовая сделка отправлена';
            hapticSuccess();
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось отправить тестовую сделку';
            hapticError();
        } finally {
            loading = false;
        }
    }
</script>

<Card>
    <SectionHeader
            title="Тестовая сделка"
            subtitle="Проверка сценария без Telegram-кнопок"
    />

    <div class="form-grid">
        <label class="field">
            <span>Инструмент</span>
            <input type="text" bind:value={symbol} placeholder="BTC-USDT-SWAP" />
        </label>

        <div class="segment">
            <button type="button" class:active={side === 'buy'} on:click={() => setSide('buy')}>
                Лонг
            </button>
            <button type="button" class:active={side === 'sell'} on:click={() => setSide('sell')}>
                Шорт
            </button>
        </div>

        <label class="field">
            <span>Плечо</span>
            <input type="number" min="1" step="1" bind:value={leverage} />
        </label>

        <label class="field">
            <span>Количество</span>
            <input type="number" min="0" step="0.01" bind:value={qty} />
        </label>
    </div>

    {#if error}
        <Card variant="error" className="inner-card">
            <div class="error-text">{error}</div>
        </Card>
    {/if}

    {#if success}
        <Card variant="success" className="inner-card">
            <div class="success-text">{success}</div>
        </Card>
    {/if}

    <div class="top-gap">
        <Button variant="primary" wide on:click={submit} disabled={loading}>
            {loading ? 'Отправка...' : 'Открыть тестовую сделку'}
        </Button>
    </div>
</Card>

<style>
    .form-grid {
        display: grid;
        gap: 10px;
        margin-top: 12px;
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13px;
        color: var(--text-soft);
    }

    .field input {
        height: 42px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.03);
        color: var(--text-main);
        padding: 0 12px;
        font-size: 14px;
    }

    .segment {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    }

    .segment button {
        height: 42px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.03);
        color: var(--text-soft);
        font-size: 14px;
        font-weight: 600;
    }

    .segment button.active {
        background: var(--accent);
        color: #fff;
        border-color: transparent;
    }

    .inner-card {
        margin-top: 12px;
    }

    .top-gap {
        margin-top: 12px;
    }

    .error-text {
        font-size: 13px;
        color: var(--danger);
    }

    .success-text {
        font-size: 13px;
        color: var(--success);
    }
</style>