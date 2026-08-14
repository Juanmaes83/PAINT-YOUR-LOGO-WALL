import {defineConfig} from 'vite';
export default defineConfig(({mode})=>({
  base: process.env.GITHUB_PAGES ? '/PAINT-YOUR-LOGO-WALL/' : '/',
  server:{host:'0.0.0.0'},
  preview:{host:'0.0.0.0'}
}));