<script lang="ts">
    let symbol = 'BTC-USDT-SWAP';
    let side: 'buy' | 'sell' = 'buy';
    let leverage = 1;
    let qty = 1;
    let loading = false;
    let success: string | null = null;
    let error: string | null = null;

    async function submit() {
        loading = true;
        success = null;
        error = null;

        try {
            // TODO: заменить на реальную ручку, когда будет готова
            console.log('test-trade', {
                symbol,
                side,
                leverage,
                qty
            });

            await new Promise((resolve) => setTimeout(resolve, 500));
            success = 'Тестовая сделка отправлена';
        } catch (e) {
            error = e instanceof Error ? e.message : 'Не удалось отправить тестовую сделку';
        } finally {
            loading = false;
        }
    }
</script>

<section class="card">
    <div class="title">Тестовая сделка</div>
    <div class="sub">Проверка сценария без Telegram-кнопок</div>

    <div class="form-grid">
        <label class="field">
            <span>Инструмент</span>
            <input type="text" bind:value={symbol} placeholder="BTC-USDT-SWAP" />
        </label>

        <div class="segment">
            <button type="button" class:active={side === 'buy'} on:click={() => (side = 'buy')}>
                Лонг
            </button>
            <button type="button" class:active={side === 'sell'} on:click={() => (side = 'sell')}>
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
        <div class="error">{error}</div>
    {/if}

    {#if success}
        <div class="success">{success}</div>
    {/if}

    <button class="primary wide" on:click={submit} disabled={loading}>
        {loading ? 'Отправка...' : 'Открыть тестовую сделку'}
    </button>
</section>

<style>
    .card {
        border-radius: 20px;
        padding: 14px;
        background: #111827;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .title {
        font-size: 14px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.92);
    }

    .sub {
        margin-top: 2px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
    }

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
        color: rgba(255, 255, 255, 0.82);
    }

    .field input {
        height: 42px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
        color: #fff;
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
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        font-weight: 600;
    }

    .segment button.active {
        background: #1d4ed8;
        color: #fff;
        border-color: transparent;
    }

    .primary {
        border: 0;
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 13px;
        font-weight: 600;
        background: #1d4ed8;
        color: #fff;
    }

    .wide {
        width: 100%;
        margin-top: 12px;
    }

    .primary:disabled {
        opacity: 0.6;
    }

    .error,
    .success {
        border-radius: 14px;
        padding: 12px;
        margin-top: 12px;
        font-size: 13px;
    }

    .error {
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .success {
        color: #34d399;
        background: rgba(52, 211, 153, 0.08);
        border: 1px solid rgba(52, 211, 153, 0.2);
    }
</style>