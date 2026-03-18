export function formatMoney(value?: number, digits = 2): string {
    if (value == null || Number.isNaN(value)) return "—";
    return new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    }).format(value);
}

export function formatPercent(value?: number, digits = 2): string {
    if (value == null || Number.isNaN(value)) return "—";
    return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function formatNumber(value?: number, digits = 2): string {
    if (value == null || Number.isNaN(value)) return "—";
    return new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits
    }).format(value);
}

export function formatCompactDate(value?: string | number | Date): string {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}
