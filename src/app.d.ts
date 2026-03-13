declare global {
	interface Window {
		Telegram?: {
			WebApp?: {
				initData?: string;
				ready?: () => void;
				expand?: () => void;
				setHeaderColor?: (color: string) => void;
				setBackgroundColor?: (color: string) => void;
				disableVerticalSwipes?: () => void;
				HapticFeedback?: {
					impactOccurred?: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
					notificationOccurred?: (type: 'error' | 'success' | 'warning') => void;
					selectionChanged?: () => void;
				};
				onEvent?: (eventType: string, eventHandler: () => void) => void;
				offEvent?: (eventType: string, eventHandler: () => void) => void;
				themeParams?: Record<string, string>;
				colorScheme?: 'light' | 'dark';
			};
		};
	}
}

export {};