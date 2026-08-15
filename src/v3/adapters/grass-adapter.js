import {GRASS_DONOR_BLOB,GRASS_DONOR_PATH,renderGrassOriginalCore} from '../donors/grass/grass-original-core.js';

const staticCache=new WeakMap(),liveCache=new WeakMap();
const probe=document.createElement('canvas');probe.width=8;probe.height=4;
const probeCtx=probe.getContext('2d',{willReadFrequently:true});

function sourceSignature(source){
 probeCtx.clearRect(0,0,8,4);probeCtx.drawImage(source,0,0,8,4);
 const d=probeCtx.getImageData(0,0,8,4).data;let h=2166136261;
 for(let i=0;i<d.length;i+=4){h^=d[i];h=Math.imul(h,16777619);h^=d[i+1];h=Math.imul(h,16777619);h^=d[i+2];h=Math.imul(h,16777619);h^=d[i+3];h=Math.imul(h,16777619)}
 return h>>>0;
}
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}

export const GRASS_ADAPTER_INFO=Object.freeze({
 id:'grass',
 label:'Grass — Escaparates Pro original',
 donorRepository:'Juanmaes83/escaparates-pro',
 donorRef:'master',
 donorPath:GRASS_DONOR_PATH,
 donorBlob:GRASS_DONOR_BLOB,
 algorithm:'source-faithful-extraction',
 stillInput:'512x256 → donor 1024x512',
 liveVideoInput:'96x48 → donor 192x96 → fitted to wall @ up to 12 donor renders/s',
 supportsImage:true,
 supportsVideo:true
});

/** Thin runtime adapter. The visual algorithm lives in grass-original-core.js. */
export function renderGrassAdapter(out,source,{progress=1,time=0,options={}}={}){
 const live=!!options.live;
 const bladeDensity=Math.max(1,Math.min(10,Math.round(options.grassBladeDensity??5)));
 let rendered;
 if(live){
  let entry=liveCache.get(out);const wrapped=entry&&time<entry.lastTime;
  if(!entry){entry={canvas:mk(out.width,out.height),lastTime:-Infinity,bladeDensity};liveCache.set(out,entry)}
  if(wrapped||entry.bladeDensity!==bladeDensity||time-entry.lastTime>=1/12){
   renderGrassOriginalCore(entry.canvas,source,{bladeDensity,inputWidth:96,inputHeight:48,seed:42});
   entry.lastTime=time;entry.bladeDensity=bladeDensity;
  }
  rendered=entry.canvas;
 }else{
  const signature=sourceSignature(source);let entry=staticCache.get(source);
  if(!entry||entry.signature!==signature||entry.bladeDensity!==bladeDensity){
   entry={signature,bladeDensity,canvas:mk(out.width,out.height)};
   renderGrassOriginalCore(entry.canvas,source,{bladeDensity,inputWidth:512,inputHeight:256,seed:42});
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
