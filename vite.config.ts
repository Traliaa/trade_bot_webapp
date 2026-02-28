import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            "/api": {
                target: "https://api.trade.bot.etk3.xyz",
                changeOrigin: true,
                secure: true
            }
        }
    },
    plugins: [tailwindcss(), sveltekit()] });
