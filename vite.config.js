import {defineConfig} from 'vite';
export default defineConfig(()=>({
  base: process.env.PYLW_BASE || (process.env.GITHUB_PAGES ? '/PAINT-YOUR-LOGO-WALL/v3-original-effects/' : '/'),
  server:{host:'0.0.0.0'},
  preview:{host:'0.0.0.0'}
}));
