import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const base=process.env.PYLW_URL||'http://127.0.0.1:4173/PAINT-YOUR-LOGO-WALL/v2/';
await fs.mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1720,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto(base,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__PYLW_V2__?.ready===true,{timeout:20000});
const initial=await page.evaluate(()=>window.__PYLW_V2__);if(initial.jobs!==0)throw new Error(`Expected content-first empty state, got ${initial.jobs} jobs`);if(!initial.cssLoaded)throw new Error('CSS not loaded');
const upload=page.locator('#asset-upload');if(!(await upload.getAttribute('accept'))?.includes('video'))throw new Error('Video accept missing');if((await upload.getAttribute('multiple'))===null)throw new Error('Multi-upload missing');
await page.click('#use-demo');await page.waitForFunction(()=>window.__PYLW_V2__?.jobs===5);const methods=['brush','roller','spray','charcoal','ink','digital'];for(const method of methods){await page.click(`[data-method="${method}"]`);await page.waitForTimeout(80);const active=await page.locator(`[data-method="${method}"]`).evaluate(el=>el.classList.contains('active'));if(!active)throw new Error(`Method ${method} did not activate`)}
const reveals=['horizontal','vertical','radial','contour','stroke','stencil','particles','blocks','center','edges'];for(const r of reveals){await page.selectOption('#reveal-mask',r);if(await page.inputValue('#reveal-mask')!==r)throw new Error(`Reveal ${r} failed`)}
await page.click('[data-method="spray"]');await page.click('#play');await page.waitForTimeout(4300);const live=await page.evaluate(()=>window.__PYLW_V2__);if(live.paintProgress<=.05)throw new Error(`Paint did not progress: ${live.paintProgress}`);if(live.method!=='spray')throw new Error(`Expected spray method, got ${live.method}`);
await page.click('#duplicate-job');await page.waitForFunction(()=>window.__PYLW_V2__?.jobs===6);await page.click('#delete-job');await page.waitForFunction(()=>window.__PYLW_V2__?.jobs===5);
await page.screenshot({path:'artifacts/v2-creative-engine.png',fullPage:true});if(errors.length)throw new Error(`Browser errors: ${errors.join(' | ')}`);console.log(JSON.stringify({ok:true,jobs:live.jobs,method:live.method,reveals:reveals.length,errors},null,2));await browser.close();
