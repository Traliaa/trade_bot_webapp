export function startVisibilityPoller(
    task: () => Promise<void> | void,
    intervalMs: number
) {
    let timer: ReturnType<typeof setInterval> | null = null;
    let running = false;

    const run = async () => {
        if (running) return;
        if (typeof document !== 'undefined' && document.hidden) return;

        running = true;
        try {
            await task();
        } finally {
            running = false;
        }
    };

    const start = () => {
        if (timer) return;
        timer = setInterval(run, intervalMs);
    };

    const stop = () => {
        if (!timer) return;
        clearInterval(timer);
        timer = null;
    };

    const onVisibilityChange = () => {
        if (document.hidden) {
            stop();
        } else {
            run();
            start();
        }
    };

    if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', onVisibilityChange);
    }

    start();

    return {
        run,
        stop() {
            stop();
            if (typeof document !== 'undefined') {
                document.removeEventListener('visibilitychange', onVisibilityChange);
            }
        }
    };
}