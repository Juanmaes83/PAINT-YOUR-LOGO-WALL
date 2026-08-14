import {defineConfig} from 'vite';
export default defineConfig(()=>({
  base: process.env.GITHUB_PAGES ? '/PAINT-YOUR-LOGO-WALL/v2/' : '/',
  server:{host:'0.0.0.0'},
  preview:{host:'0.0.0.0'}
}));
