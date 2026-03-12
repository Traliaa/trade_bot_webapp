<script lang="ts">
    const quickActions = [
        ['API ключи OKX', 'Подключение биржи', '🔑'],
        ['Тестовая сделка', 'Проверка логики', '🧪'],
        ['Справка', 'Термины и подсказки', '📘'],
        ['Версия', 'trade_bot_webapp 0.9.1', '🧩']
    ];

    const diagnostics = [
        ['Статус подключения', 'OKX и WebSocket активны'],
        ['Перезапустить бота', 'Служебное действие с подтверждением'],
        ['Открыть логи', 'Для отладки и диагностики']
    ];
</script>

<div class="stack">
    <section class="card">
        <div class="title">Быстрые действия</div>
        <div class="sub">Самые частые сервисные разделы</div>

        <div class="grid2">
            {#each quickActions as [title, subtitle, icon]}
                <button class="action-card">
                    <div class="icon">{icon}</div>
                    <div class="action-title">{title}</div>
                    <div class="action-sub">{subtitle}</div>
                </button>
            {/each}
        </div>
    </section>

    <section class="card">
        <div class="title">Подключение OKX</div>
        <div class="sub">Ключи и состояние соединения</div>

        <div class="list">
            <button class="row-btn">
                <div>
                    <div class="row-title">API ключи</div>
                    <div class="row-sub">Добавить или обновить ключи доступа</div>
                </div>
                <span class="arrow">›</span>
            </button>

            <div class="status-card">
                <div>
                    <div class="status-title">Соединение активно</div>
                    <div class="status-sub">WebSocket подключён, права подтверждены</div>
                </div>
                <span class="dot"></span>
            </div>
        </div>
    </section>

    <section class="card">
        <div class="title">Тест и диагностика</div>
        <div class="sub">Проверка логики и состояния системы</div>

        <div class="list">
            {#each diagnostics as [title, subtitle]}
                <button class="row-btn">
                    <div>
                        <div class="row-title">{title}</div>
                        <div class="row-sub">{subtitle}</div>
                    </div>
                    <span class="arrow">›</span>
                </button>
            {/each}
        </div>
    </section>
</div>

<style>
    .stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

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

    .grid2 {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .action-card {
        text-align: left;
        border-radius: 16px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.04);
        font-size: 18px;
        margin-bottom: 10px;
    }

    .action-title,
    .row-title,
    .status-title {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
    }

    .action-sub,
    .row-sub,
    .status-sub {
        margin-top: 4px;
        font-size: 11px;
        line-height: 1.4;
        color: rgba(255, 255, 255, 0.45);
    }

    .list {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .row-btn,
    .status-card {
        border-radius: 14px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .row-btn {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        text-align: left;
    }

    .status-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        background: rgba(52, 211, 153, 0.1);
        border-color: rgba(52, 211, 153, 0.18);
    }

    .status-title {
        color: #34d399;
    }

    .status-sub {
        color: rgba(167, 243, 208, 0.7);
    }

    .arrow {
        color: rgba(255, 255, 255, 0.3);
        font-size: 18px;
    }

    .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #34d399;
    }
</style>