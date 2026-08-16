import {GRASS_DONOR_BLOB,GRASS_DONOR_PATH,renderGrassOriginalCore} from '../donors/grass/grass-original-core.js';

const staticCache=new WeakMap(),liveCache=new WeakMap(),geometryCache=new WeakMap();
const probe=document.createElement('canvas');probe.width=8;probe.height=4;
const probeCtx=probe.getContext('2d',{willReadFrequently:true});

function sourceSignature(source){
 probeCtx.clearRect(0,0,8,4);probeCtx.drawImage(source,0,0,8,4);
 const d=probeCtx.getImageData(0,0,8,4).data;let h=2166136261;
 for(let i=0;i<d.length;i+=4){h^=d[i];h=Math.imul(h,16777619);h^=d[i+1];h=Math.imul(h,16777619);h^=d[i+2];h=Math.imul(h,16777619);h^=d[i+3];h=Math.imul(h,16777619)}
 return h>>>0;
}
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}

function transparentContentBounds(source){
 if(!source?.getContext||!source.width||!source.height)return null;
 let cached=geometryCache.get(source);
 if(cached?.bounds)return cached.bounds;
 const g=source.getContext('2d',{willReadFrequently:true}),W=source.width,H=source.height;
 let data;try{data=g.getImageData(0,0,W,H).data}catch{return null}
 let minX=W,minY=H,maxX=-1,maxY=-1;
 for(let y=0;y<H;y+=2){for(let x=0;x<W;x+=2){if(data[(y*W+x)*4+3]>8){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y}}}
 if(maxX<minX||maxY<minY)return null;
 minX=Math.max(0,minX-2);minY=Math.max(0,minY-2);maxX=Math.min(W-1,maxX+2);maxY=Math.min(H-1,maxY+2);
 const bounds={x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,trimmed:minX>3||minY>3||maxX<W-4||maxY<H-4};
 geometryCache.set(source,{bounds,canvas:cached?.canvas});
 return bounds;
}

/**
 * Jobs are composed into a fixed 1024x512 wall canvas with `contain` before
 * effects run. For portrait/non-2:1 assets that introduces transparent side or
 * top/bottom padding. The original Grass algorithm ignores source alpha, maps
 * transparent padding to black, and therefore turns the real artwork into a
 * narrow central strip. Trim only that transparent contain-padding before
 * donor sampling; the donor palette/PRNG/blade geometry remain untouched.
 */
function geometrySource(source){
 const bounds=transparentContentBounds(source);
 if(!bounds?.trimmed)return source;
 let entry=geometryCache.get(source);if(!entry){entry={bounds,canvas:null};geometryCache.set(source,entry)}
 if(!entry.canvas||entry.canvas.width!==bounds.w||entry.canvas.height!==bounds.h)entry.canvas=mk(bounds.w,bounds.h);
 const g=entry.canvas.getContext('2d');g.clearRect(0,0,bounds.w,bounds.h);g.drawImage(source,bounds.x,bounds.y,bounds.w,bounds.h,0,0,bounds.w,bounds.h);
 return entry.canvas;
}

export const GRASS_ADAPTER_INFO=Object.freeze({
 id:'grass',
 label:'Grass — Escaparates Pro original',
 donorRepository:'Juanmaes83/escaparates-pro',
 donorRef:'master',
 donorPath:GRASS_DONOR_PATH,
 donorBlob:GRASS_DONOR_BLOB,
 algorithm:'source-faithful-extraction',
 geometryFix:'trim-transparent-contain-padding-v1',
 stillInput:'content bounds → 512x256 → donor 1024x512',
 liveVideoInput:'content bounds → 96x48 → donor 192x96 → fitted to wall @ up to 12 donor renders/s',
 supportsImage:true,
 supportsVideo:true
});

/** Thin runtime adapter. The visual algorithm lives in grass-original-core.js. */
export function renderGrassAdapter(out,source,{progress=1,time=0,options={}}={}){
 const live=!!options.live,prepared=geometrySource(source);
 const bladeDensity=Math.max(1,Math.min(10,Math.round(options.grassBladeDensity??5)));
 let rendered;
 if(live){
  let entry=liveCache.get(out);const wrapped=entry&&time<entry.lastTime;
  if(!entry){entry={canvas:mk(out.width,out.height),lastTime:-Infinity,bladeDensity};liveCache.set(out,entry)}
  if(wrapped||entry.bladeDensity!==bladeDensity||time-entry.lastTime>=1/12){
   renderGrassOriginalCore(entry.canvas,prepared,{bladeDensity,inputWidth:96,inputHeight:48,seed:42});
   entry.lastTime=time;entry.bladeDensity=bladeDensity;
  }
  rendered=entry.canvas;
 }else{
  const signature=sourceSignature(prepared);let entry=staticCache.get(source);
  if(!entry||entry.signature!==signature||entry.bladeDensity!==bladeDensity){
   entry={signature,bladeDensity,canvas:mk(out.width,out.height)};
   renderGrassOriginalCore(entry.canvas,prepared,{bladeDensity,inputWidth:512,inputHeight:256,seed:42});
   staticCache.set(source,entry);
  }
  rendered=entry.canvas;
 }
 const g=out.getContext('2d');g.clearRect(0,0,out.width,out.height);
 const p=Math.max(0,Math.min(1,progress));
 if(p<=0)return true;
 g.save();g.beginPath();g.rect(0,0,out.width*p,out.height);g.clip();g.drawImage(rendered,0,0,out.width,out.height);g.restore();
 return true;
}

export function grassAdapterSnapshot(){return{...GRASS_ADAPTER_INFO,engine:'original-escaparates-pro',live:true}}
