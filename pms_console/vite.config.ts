import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import proxyOptions from './proxyOptions';

// https://vitejs.dev/config/
export default defineConfig({
	base: '/',
	plugins: [
		react({
			babel: {
				plugins: [
					['@babel/plugin-proposal-decorators', { legacy: true }],
					['@babel/plugin-transform-class-properties', { loose: true }],
					'babel-plugin-transform-typescript-metadata'
				],
			},
		}),
		tailwindcss()
	],
	server: {
		port: 8080,
		host: '0.0.0.0',
		proxy: proxyOptions
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src')
		}
	},
	build: {
		outDir: '../bookpondy_pms/public/pms_console',
		emptyOutDir: true,
		target: 'es2015',
	},
});
