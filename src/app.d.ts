// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface Window {
		Telegram?: {
			WebApp?: {
				initData?: string;
				ready?: () => void;
				expand?: () => void;
			};
		};
	}
}
//
//
//
// declare global {
// 	interface Window {
// 		Telegram?: {
// 			WebApp?: any;
// 		};
// 	}
// }


export {};
