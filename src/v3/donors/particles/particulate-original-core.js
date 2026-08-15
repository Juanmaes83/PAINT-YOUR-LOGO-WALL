// SOURCE-FAITHFUL EXTRACTION — Escaparates Pro Particulate Image Pro.
// Canonical donor:
// Juanmaes83/escaparates-pro@master
// labs/source-experiences/particulate-image-pro/source-script.js
// donor blob: 2ab38ec69d91c94bd5e63cecf19fa1a11d8b7654
//
// DOM, palette UI, clipboard, file picker and global event handling are removed.
// Particle construction, spring/wander/friction, blow/magnet/freeze interaction,
// edge spawning, target density, rounded pixel geometry and trail background are preserved.

export const PARTICULATE_DONOR_BLOB='2ab38ec69d91c94bd5e63cecf19fa1a11d8b7654';
export const PARTICULATE_DONOR_PATH='labs/source-experiences/particulate-image-pro/source-script.js';

export class ParticulateParticle{
 constructor(x,y,originX,originY,r,g,b,size,random=Math.random){
  this.x=x;this.y=y;this.originX=originX;this.originY=originY;
  this.r=r;this.g=g;this.b=b;this.size=size;this.baseSize=size;
  this.vx=0;this.vy=0;this.friction=.92+random()*.04;
  this.springStrength=.008+random()*.008;
  this.wanderAngle=random()*Math.PI*2;this.wanderSpeed=.02+random()*.02;
  this.opacity=0;this.targetOpacity=1;
 }
 update({mode='blow',mx=0,my=0,isPointerDown=false}={}){
  this.opacity+=(this.targetOpacity-this.opacity)*.05;
  if(mode==='freeze'){this.vx*=.95;this.vy*=.95;this.x+=this.vx;this.y+=this.vy;return}
  const dx=this.originX-this.x,dy=this.originY-this.y;this.vx+=dx*this.springStrength;this.vy+=dy*this.springStrength;
  this.wanderAngle+=this.wanderSpeed;this.vx+=Math.cos(this.wanderAngle)*.05;this.vy+=Math.sin(this.wanderAngle)*.05;
  if(isPointerDown||mode==='magnet'){
   const mdx=this.x-mx,mdy=this.y-my,dist=Math.sqrt(mdx*mdx+mdy*mdy),radius=mode==='blow'?140:mode==='magnet'?200:0;
   if(dist<radius&&dist>0){const force=(radius-dist)/radius,angle=Math.atan2(mdy,mdx);
    if(mode==='blow'&&isPointerDown){const power=force*force*8;this.vx+=Math.cos(angle)*power;this.vy+=Math.sin(angle)*power;this.size=this.baseSize*(1+force*.8)}
    else if(mode==='magnet'){const power=force*2;this.vx-=Math.cos(angle)*power;this.vy-=Math.sin(angle)*power;this.size=this.baseSize*(1-force*.3)}
   }else this.size+=(this.baseSize-this.size)*.1;
  }else this.size+=(this.baseSize-this.size)*.1;
  this.vx*=this.friction;this.vy*=this.friction;this.x+=this.vx;this.y+=this.vy;
 }
 draw(ctx){ctx.globalAlpha=this.opacity;ctx.fillStyle=`rgb(${this.r},${this.g},${this.b})`;const s=Math.max(1,this.size),half=s/2,rad=s>4?2:1;ctx.beginPath();ctx.moveTo(this.x-half+rad,this.y-half);ctx.lineTo(this.x+half-rad,this.y-half);ctx.quadraticCurveTo(this.x+half,this.y-half,this.x+half,this.y-half+rad);ctx.lineTo(this.x+half,this.y+half-rad);ctx.quadraticCurveTo(this.x+half,this.y+half,this.x+half-rad,this.y+half);ctx.lineTo(this.x-half+rad,this.y+half);ctx.quadraticCurveTo(this.x-half,this.y+half,this.x-half,this.y+half-rad);ctx.lineTo(this.x-half,this.y-half+rad);ctx.quadraticCurveTo(this.x-half,this.y-half,this.x-half+rad,this.y-half);ctx.fill();ctx.globalAlpha=1}
}

function fitSource(source,W,H){
 const sw=source.videoWidth||source.naturalWidth||source.width||W,sh=source.videoHeight||source.naturalHeight||source.height||H;
 const scale=Math.min((W*.7)/sw,(H*.65)/sh,1),iw=Math.max(1,Math.floor(sw*scale)),ih=Math.max(1,Math.floor(sh*scale)),ox=Math.floor((W-iw)/2),oy=Math.floor((H-ih)/2);
 const c=document.createElement('canvas');c.width=iw;c.height=ih;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(source,0,0,iw,ih);return{canvas:c,data:g.getImageData(0,0,iw,ih).data,iw,ih,ox,oy}
}

export function createParticulateOriginalState(source,W,H,{random=Math.random,maxParticles=8000,minParticles=2000}={}){
 const {data,iw,ih,ox,oy}=fitSource(source,W,H),targetParticles=Math.min(maxParticles,Math.max(minParticles,(iw*ih)/20)),gap=Math.max(2,Math.floor(Math.sqrt((iw*ih)/targetParticles))),pSize=gap*.95,particles=[];
 for(let y=0;y<ih;y+=gap)for(let x=0;x<iw;x+=gap){const i=(y*iw+x)*4,r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];if(a<128)continue;const px=ox+x,py=oy+y,edge=random();let sx,sy;if(edge<.25){sx=random()*W;sy=-50}else if(edge<.5){sx=random()*W;sy=H+50}else if(edge<.75){sx=-50;sy=random()*H}else{sx=W+50;sy=random()*H}const p=new ParticulateParticle(sx,sy,px,py,r,g,b,pSize,random);p.vx=(px-sx)*.01+(random()-.5)*2;p.vy=(py-sy)*.01+(random()-.5)*2;particles.push(p)}
 return{particles,W,H,iw,ih,ox,oy,gap,pSize,mode:'blow',mx:W/2,my:H/2,isPointerDown:false,lastSourceUpdate:0};
}

// Live-media adaptation: retain the original particle dynamics and topology while
// refreshing each particle's RGB from the current frame at its original image sample.
export function updateParticulateSourceColors(state,source){
 const c=document.createElement('canvas');c.width=state.iw;c.height=state.ih;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(source,0,0,state.iw,state.ih);const data=g.getImageData(0,0,state.iw,state.ih).data;
 for(const p of state.particles){const x=Math.max(0,Math.min(state.iw-1,Math.round(p.originX-state.ox))),y=Math.max(0,Math.min(state.ih-1,Math.round(p.originY-state.oy))),i=(y*state.iw+x)*4;if(data[i+3]>=128){p.r=data[i];p.g=data[i+1];p.b=data[i+2]}}
}

export function renderParticulateOriginalFrame(out,state,{mode=state.mode,mx=state.mx,my=state.my,isPointerDown=state.isPointerDown,steps=1}={}){
 const ctx=out.getContext('2d');ctx.fillStyle='rgba(8, 8, 12, 0.25)';ctx.fillRect(0,0,out.width,out.height);
 for(let step=0;step<steps;step++)for(const p of state.particles)p.update({mode,mx,my,isPointerDown});
 for(const p of state.particles)p.draw(ctx);return out;
}

export function explodeParticulate(state,random=Math.random){for(const p of state.particles){const angle=random()*Math.PI*2,power=5+random()*15;p.vx+=Math.cos(angle)*power;p.vy+=Math.sin(angle)*power}}
export function reassembleParticulate(state){for(const p of state.particles)p.springStrength=.05}
