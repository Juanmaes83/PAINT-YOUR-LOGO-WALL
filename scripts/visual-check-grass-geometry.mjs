import {chromium} from 'playwright';
import fs from 'node:fs';

const url=process.env.PYLW_URL||'http://127.0.0.1:4178/PAINT-YOUR-LOGO-WALL/v3/';
fs.mkdirSync('artifacts',{recursive:true});

const fixture=`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="800" viewBox="0 0 400 800">
<rect width="200" height="400" x="0" y="0" fill="#ffffff"/>
<rect width="200" height="400" x="200" y="0" fill="#fff36a"/>
<rect width="200" height="400" x="0" y="400" fill="#6affff"/>
<rect width="200" height="400" x="200" y="400" fill="#9cff6a"/>
</svg>`;

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1720,height:1020}});
const errors=[];
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
page.on('pageerror',e=>errors.push(String(e)));

function assert(condition,message){if(!condition)throw new Error(message)}

try{
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__PYLW_V3__&&window.__PYLW_JOB_MANAGER__);
  await page.setInputFiles('#asset-upload',{name:'grass-quadrants-portrait.svg',mimeType:'image/svg+xml',buffer:Buffer.from(fixture)});
  await page.waitForFunction(()=>window.__PYLW_JOB_MANAGER__?.jobs?.length===1,{timeout:15000});
  await page.locator('[data-method="grass"]').click();
  await page.waitForTimeout(1600);

  const metrics=await page.evaluate(()=>{
    const j=window.__PYLW_JOB_MANAGER__.jobs[0];
    const c=j.out,d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,W=c.width,H=c.height;
    const regions={left:[0,.20,0,1],right:[.80,1,0,1],tl:[0,.5,0,.5],tr:[.5,1,0,.5],bl:[0,.5,.5,1],br:[.5,1,.5,1]};
    const out={width:W,height:H,sourceWidth:j.media?.naturalWidth||0,sourceHeight:j.media?.naturalHeight||0,sourceCanvasWidth:j.source.width,sourceCanvasHeight:j.source.height,effect:j.lastEffect};
    for(const [name,[x0,x1,y0,y1]] of Object.entries(regions)){
      let active=0,luma=0,total=0;
      const sx=Math.floor(W*x0),ex=Math.floor(W*x1),sy=Math.floor(H*y0),ey=Math.floor(H*y1);
      for(let y=sy;y<ey;y+=2)for(let x=sx;x<ex;x+=2){const i=(y*W+x)*4,a=d[i+3];total++;if(a>8){active++;luma+=(d[i]*.2126+d[i+1]*.7152+d[i+2]*.0722)}}
      out[name]={active,activeRatio:active/Math.max(1,total),meanActiveLuma:luma/Math.max(1,active)};
    }
    return out;
  });

  fs.writeFileSync('artifacts/grass-quadrant-metrics.json',JSON.stringify({url,metrics,errors},null,2));
  await page.screenshot({path:'artifacts/grass-quadrant-regression.png',fullPage:true});

  assert(metrics.sourceWidth===400&&metrics.sourceHeight===800,`fixture intrinsic geometry lost before test: ${JSON.stringify(metrics)}`);
  assert(metrics.effect?.engine==='original-escaparates-pro',`Grass donor engine changed unexpectedly: ${JSON.stringify(metrics.effect)}`);
  for(const q of ['tl','tr','bl','br']) assert(metrics[q].active>1500,`${q} quadrant nearly blank: ${JSON.stringify(metrics[q])}`);
  assert(metrics.left.meanActiveLuma>18,`left edge is dominated by padded/black source instead of fixture content: ${JSON.stringify(metrics.left)}`);
  assert(metrics.right.meanActiveLuma>18,`right edge is dominated by padded/black source instead of fixture content: ${JSON.stringify(metrics.right)}`);
  assert(errors.length===0,`browser errors: ${errors.join(' | ')}`);
  console.log('GRASS GEOMETRY QUADRANT PASS',JSON.stringify(metrics,null,2));
} finally {
  await browser.close();
}
