import {PARTICULATE_DONOR_BLOB,PARTICULATE_DONOR_PATH,createParticulateOriginalState,updateParticulateSourceColors,renderParticulateOriginalFrame} from '../donors/particles/particulate-original-core.js';

const cache=new WeakMap();
function seeded(seed=1337){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function signature(source){const c=document.createElement('canvas');c.width=8;c.height=4;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(source,0,0,8,4);const d=g.getImageData(0,0,8,4).data;let h=2166136261;for(let i=0;i<d.length;i+=4){h^=d[i];h=Math.imul(h,16777619);h^=d[i+1];h=Math.imul(h,16777619);h^=d[i+2];h=Math.imul(h,16777619)}return h>>>0}
function newEntry(out,source){const state=createParticulateOriginalState(source,out.width,out.height,{random:seeded(20260816),maxParticles:8000,minParticles:2000});const warmCtx=out.getContext('2d');warmCtx.clearRect(0,0,out.width,out.height);for(let i=0;i<150;i++)for(const p of state.particles)p.update({mode:'blow',mx:state.mx,my:state.my,isPointerDown:false});return{state,lastSignature:signature(source),lastColorUpdate:-Infinity,frames:0}}

export const PARTICLES_ADAPTER_INFO=Object.freeze({
 id:'particles',label:'Particles — Escaparates Pro Particulate original',donorRepository:'Juanmaes83/escaparates-pro',donorRef:'master',donorPath:PARTICULATE_DONOR_PATH,donorBlob:PARTICULATE_DONOR_BLOB,algorithm:'source-faithful-extraction',particleCap:8000,particleFloor:2000,modes:['blow','magnet','freeze'],supportsImage:true,supportsVideo:true
});

/** Thin adapter. Particle construction/physics/drawing live in the extracted donor core. */
export function renderParticlesAdapter(out,source,{progress=1,time=0,options={}}={}){
 let entry=cache.get(out);const live=!!options.live;
 if(!entry){entry=newEntry(out,source);cache.set(out,entry)}
 const sig=signature(source);
 if(!live&&sig!==entry.lastSignature){entry=newEntry(out,source);cache.set(out,entry)}
 else if(live&&(time-entry.lastColorUpdate>.08||sig!==entry.lastSignature)){updateParticulateSourceColors(entry.state,source);entry.lastColorUpdate=time;entry.lastSignature=sig}
 const state=entry.state,p=Math.max(0,Math.min(1,progress));
 if(p<=0){out.getContext('2d').clearRect(0,0,out.width,out.height);return true}
 const mode=options.particleMode||'blow';
 // Preserve the donor physics. Progress controls assembly pressure rather than replacing it with a clip mask.
 const boost=p<1?Math.max(1,Math.round(1+(1-p)*3)):1;
 renderParticulateOriginalFrame(out,state,{mode,mx:Number(options.particleX??state.mx),my:Number(options.particleY??state.my),isPointerDown:!!options.particlePointer,steps:boost});
 entry.frames++;
 return true;
}

export function particlesAdapterSnapshot(){return{...PARTICLES_ADAPTER_INFO,engine:'original-escaparates-pro',live:true}}
