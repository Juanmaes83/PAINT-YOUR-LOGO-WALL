import {chromium} from 'playwright';
import fs from 'node:fs';import path from 'node:path';
const url=process.env.PYLW_URL||'http://127.0.0.1:4178/PAINT-YOUR-LOGO-WALL/v3/';
const fixtures=process.env.PYLW_FIXTURES||path.resolve('artifacts/fixtures');fs.mkdirSync('artifacts',{recursive:true});
const videos=['v23-a.mp4','v23-b.webm','v23-c.mp4'].map(f=>path.join(fixtures,f));for(const f of videos)if(!fs.existsSync(f))throw new Error(`Missing QA fixture ${f}`);
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1720,height:1020}});const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(String(e)));
const read=()=>page.evaluate(()=>window.__PYLW_V3__);
async function selectJob(i){await page.locator('.job-row').nth(i).click();await page.waitForTimeout(100)}
async function setDuration(i,v='6'){await selectJob(i);await page.$eval('#job-duration',(el,val)=>{el.value=val;el.dispatchEvent(new Event('input',{bubbles:true}))},v)}
async function setMethod(i,method){await selectJob(i);await page.locator(`[data-method="${method}"]`).click();await page.waitForTimeout(100)}
async function hash(i){return page.evaluate(i=>{const j=window.__PYLW_JOB_MANAGER__.jobs[i],d=j.out.getContext('2d').getImageData(0,0,j.out.width,j.out.height).data;let h=2166136261;for(let p=0;p<d.length;p+=64){h^=(d[p]+d[p+1]*3+d[p+2]*7+d[p+3]*11)&255;h=Math.imul(h,16777619)}return h>>>0},i)}
async function renderSignature(i){return page.evaluate(i=>{const m=window.__PYLW_JOB_MANAGER__,j=m.jobs[i];m.paint(j,1,{size:54,edge:.68,wet:.78,forceFinal:true});const d=j.out.getContext('2d').getImageData(0,0,j.out.width,j.out.height).data;let h=2166136261,occupied=0,sum=0,energy=0;for(let p=0;p<d.length;p+=16){const r=d[p],g=d[p+1],b=d[p+2],a=d[p+3];if(a>10)occupied++;const v=(r*3+g*5+b*7+a*11)&255;sum=(sum+v)>>>0;energy=(energy+((r-g)*(r-g)+(g-b)*(g-b)))>>>0;h^=v;h=Math.imul(h,16777619)}return{hash:h>>>0,occupied,sum,energy,method:j.method,effect:j.lastEffect}},i)}
async function motion(i,label){const a=await hash(i);await page.waitForTimeout(900);const b=await hash(i);if(a===b)throw new Error(`${label}: rendered pixels did not move (${a})`);return[a,b]}
async function seek(job,local,count=3){await page.$eval('#timeline',(el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}))},(job+local)/count);await page.waitForTimeout(450);return read()}
try{
 await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__PYLW_V3__&&window.__PYLW_JOB_MANAGER__);
 const methods=await page.locator('#method-grid [data-method]').count();if(methods!==13)throw new Error(`Expected 13 total methods (8 legacy + 5 V3), got ${methods}`);
 const engineButtons=await page.locator('#method-grid .engine-method').count();if(engineButtons!==5)throw new Error(`Expected 5 V3 effect engines, got ${engineButtons}`);
 await page.setInputFiles('#asset-upload',videos);await page.waitForFunction(()=>window.__PYLW_V3__?.jobs===3&&window.__PYLW_V3__?.videoJobs===3,{timeout:20000});for(let i=0;i<3;i++)await setDuration(i);
 // Render and inspect synchronously in one browser task so the timeline RAF cannot overwrite the forced final frame between paint and measurement.
 const engineSignatures={};for(const method of ['grass','particles','liquid','pixel','glitch']){await setMethod(0,method);const sig=await renderSignature(0);engineSignatures[method]=sig;if(sig.method!==method||sig.effect?.engine!=='native-v3-canvas-engine')throw new Error(`${method} did not use V3 engine ${JSON.stringify(sig)}`);if(sig.occupied<100)throw new Error(`${method} produced an effectively empty output ${JSON.stringify(sig)}`)}
 const signatureKeys=Object.values(engineSignatures).map(s=>`${s.hash}:${s.occupied}:${s.sum}:${s.energy}`);if(new Set(signatureKeys).size<5)throw new Error(`Effect engines did not produce five structurally distinct outputs ${JSON.stringify(engineSignatures)}`);
 await page.locator('#timeline').evaluate(el=>{el.value='.31';el.dispatchEvent(new Event('input',{bubbles:true}))});await page.waitForTimeout(250);await page.screenshot({path:'artifacts/v3-five-engines.png',fullPage:true});
 await setMethod(0,'grass');await setMethod(1,'particles');await setMethod(2,'glitch');
 let s=await seek(0,.93);await page.waitForTimeout(700);s=await read();if(!s.videos[0].activated||s.videos[0].paused||s.videos[0].playFailures)throw new Error(`Video 1 failed ${JSON.stringify(s.videos[0])}`);const m1=await motion(0,'Grass video');
 s=await seek(1,.93);await page.waitForTimeout(700);s=await read();if(s.videos.slice(0,2).some(v=>!v.activated||v.paused||v.playFailures||v.status!=='live'))throw new Error(`Videos 1-2 not live ${JSON.stringify(s.videos)}`);const m1During2=await motion(0,'Grass video while Particle job active');const m2=await motion(1,'Particle video');
 s=await seek(2,.93);await page.waitForTimeout(700);s=await read();if(s.videos.some(v=>!v.activated||v.paused||v.playFailures||v.status!=='live'))throw new Error(`All videos not live ${JSON.stringify(s.videos)}`);const m3=await motion(2,'Glitch video');const detail=s.jobsDetail;if(detail.some((j,i)=>i<3&&(j.sourceFrame||0)<2))throw new Error(`Unified sourceCanvas frame pump did not advance ${JSON.stringify(detail)}`);
 await page.screenshot({path:'artifacts/v3-three-live-video-engines.png',fullPage:true});
 await page.click('#save-project');await page.waitForTimeout(250);await setMethod(2,'roller');await page.click('#load-project');await page.waitForFunction(()=>window.__PYLW_V3__?.jobsDetail?.[2]?.method==='glitch',{timeout:20000});
 await page.click('#restart');await page.waitForTimeout(300);const restarted=await read();if(restarted.videos.some(v=>v.activated||!v.paused))throw new Error(`Restart did not reset live videos ${JSON.stringify(restarted.videos)}`);
 if(errors.length)throw new Error(`Browser errors: ${errors.join(' | ')}`);
 const report={url,methods,engineButtons,engineSignatures,motion:{grass:m1,grassWhileParticles:m1During2,particles:m2,glitch:m3},jobsDetail:restarted.jobsDetail,errors};fs.writeFileSync('artifacts/v3-report.json',JSON.stringify(report,null,2));console.log('V3 QA PASS',JSON.stringify(report,null,2));
}finally{await browser.close()}
