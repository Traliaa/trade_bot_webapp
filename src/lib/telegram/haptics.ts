function getHaptic() {
    return window.Telegram?.WebApp?.HapticFeedback;
}

export function hapticLight() {
    getHaptic()?.impactOccurred?.('light');
}

export function hapticMedium() {
    getHaptic()?.impactOccurred?.('medium');
}

export function hapticHeavy() {
    getHaptic()?.impactOccurred?.('heavy');
}

export function hapticSuccess() {
    getHaptic()?.notificationOccurred?.('success');
}

export function hapticError() {
    getHaptic()?.notificationOccurred?.('error');
}

export function hapticWarning() {
    getHaptic()?.notificationOccurred?.('warning');
}

export function hapticSelection() {
    getHaptic()?.selectionChanged?.();
}