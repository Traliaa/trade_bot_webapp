export function startPoller(task: () => Promise<void> | void, intervalMs: number) {
    let timer: ReturnType<typeof setInterval> | null = null;
    let running = false;

    const run = async () => {
        if (running) return;
        running = true;
        try {
            await task();
        } finally {
            running = false;
        }
    };

    timer = setInterval(run, intervalMs);

    return {
        run,
        stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }
    };
}