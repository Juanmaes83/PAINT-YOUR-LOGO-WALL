const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const fract=v=>v-Math.floor(v);
const noise=n=>fract(Math.sin(n*12.9898+78.233)*43758.5453);

function sampleSurface(out,source,w=128,h=64){
  let c=out.__v3sample;if(!c){c=document.createElement('canvas');out.__v3sample=c}c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.clearRect(0,0,w,h);g.drawImage(source,0,0,w,h);return{w,h,data:g.getImageData(0,0,w,h).data};
}
function rgba(s,x,y,a=1){const ix=Math.max(0,Math.min(s.w-1,x|0)),iy=Math.max(0,Math.min(s.h-1,y|0)),i=(iy*s.w+ix)*4;return`rgba(${s.data[i]},${s.data[i+1]},${s.data[i+2]},${(s.data[i+3]/255)*a})`}
function lum(s,x,y){const ix=Math.max(0,Math.min(s.w-1,x|0)),iy=Math.max(0,Math.min(s.h-1,y|0)),i=(iy*s.w+ix)*4;return(s.data[i]*.2126+s.data[i+1]*.7152+s.data[i+2]*.0722)/255}
function clear(c){c.getContext('2d').clearRect(0,0,c.width,c.height)}

function grass(out,source,{progress,time,intensity,edge}){
  const g=out.getContext('2d'),W=out.width,H=out.height,s=sampleSurface(out,source,112,56);clear(out);g.save();g.lineCap='round';const cols=84,rows=34,total=cols*rows,limit=Math.floor(total*clamp(progress));
  for(let i=0;i<limit;i++){const x=i%cols,y=Math.floor(i/cols),sx=Math.floor(x/(cols-1)*(s.w-1)),sy=Math.floor(y/(rows-1)*(s.h-1));const alpha=s.data[(sy*s.w+sx)*4+3]/255;if(alpha<.04)continue;const px=(x+.5)/cols*W,py=(y+.78)/rows*H;const l=lum(s,sx,sy),h=4+(6+intensity*17)*(0.45+l*.75),wind=Math.sin(time*2.1+x*.31+y*.17)*(.8+edge*3.2),j=(noise(i*7.1)-.5)*5;g.strokeStyle=rgba(s,sx,sy,.83);g.lineWidth=.65+intensity*1.4;g.beginPath();g.moveTo(px+j,py);g.quadraticCurveTo(px+wind*.45,py-h*.55,px+wind,py-h);g.stroke();if(i%5===0){g.strokeStyle=rgba(s,sx,sy,.34);g.lineWidth=.55;g.beginPath();g.moveTo(px+2,py);g.quadraticCurveTo(px-wind*.25,py-h*.4,px-wind*.65,py-h*.74);g.stroke()}}
  g.restore();
}
function particles(out,source,{progress,time,intensity,edge}){
  const g=out.getContext('2d'),W=out.width,H=out.height,s=sampleSurface(out,source,96,48);clear(out);g.save();const stride=2,total=Math.ceil(s.w/stride)*Math.ceil(s.h/stride),limit=Math.floor(total*clamp(progress));let n=0;for(let y=0;y<s.h;y+=stride){for(let x=0;x<s.w;x+=stride){if(n++>=limit)break;const i=(y*s.w+x)*4,a=s.data[i+3]/255;if(a<.05)continue;const tx=(x+.5)/s.w*W,ty=(y+.5)/s.h*H,seed=x*97+y*131,spread=(1-progress)*(80+edge*190),orbit=(.8+intensity*3.8),px=tx+(noise(seed)-.5)*spread+Math.sin(time*1.9+seed)*orbit,py=ty+(noise(seed+9)-.5)*spread+Math.cos(time*1.6+seed*.3)*orbit,r=1.2+intensity*2.5+noise(seed+3)*2.2;g.fillStyle=`rgba(${s.data[i]},${s.data[i+1]},${s.data[i+2]},${a*.92})`;g.beginPath();g.arc(px,py,r,0,Math.PI*2);g.fill()}if(n>=limit)break}g.restore();
}
function liquid(out,source,{progress,time,intensity,edge}){
  const g=out.getContext('2d'),W=out.width,H=out.height;clear(out);g.save();const strip=6,maxY=Math.max(strip,Math.floor(H*clamp(progress)));for(let y=0;y<maxY;y+=strip){const wave=Math.sin(y*.045+time*2.2)*((4+intensity*20)*(.45+edge)),wave2=Math.sin(y*.013-time*1.1)*(2+edge*8);g.globalAlpha=.98;g.drawImage(source,0,y,W,strip,wave+wave2,y+Math.sin(time*1.4+y*.02)*(1+intensity*3),W,strip+1)}g.globalCompositeOperation='screen';g.globalAlpha=.08+.12*intensity;for(let y=8;y<maxY;y+=34){g.fillStyle='#bfeaff';g.fillRect(0,y+Math.sin(time*2+y*.03)*4,W,1)}g.restore();
}
function pixel(out,source,{progress,time,intensity,edge}){
  const g=out.getContext('2d'),W=out.width,H=out.height,s=sampleSurface(out,source,64,32);clear(out);g.save();const block=Math.round(11+edge*16),cols=Math.ceil(W/block),rows=Math.ceil(H/block),order=[];for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const dx=x-cols/2,dy=y-rows/2;order.push({x,y,k:Math.hypot(dx,dy)+noise(x*31+y*47)*2})}order.sort((a,b)=>a.k-b.k);const limit=Math.floor(order.length*clamp(progress));for(let n=0;n<limit;n++){const {x,y}=order[n],sx=Math.floor((x+.5)/cols*s.w),sy=Math.floor((y+.5)/rows*s.h),i=(Math.min(s.h-1,sy)*s.w+Math.min(s.w-1,sx))*4,a=s.data[i+3]/255;if(a<.04)continue;const px=x*block,py=y*block,depth=2+intensity*8+Math.sin(time*1.7+n*.08)*1.2;g.fillStyle=`rgba(0,0,0,${.12+.12*intensity})`;g.fillRect(px+depth,py+depth,block-1,block-1);g.fillStyle=`rgba(${s.data[i]},${s.data[i+1]},${s.data[i+2]},${a})`;g.fillRect(px,py,block-1,block-1);g.globalAlpha=.16+.12*intensity;g.fillStyle='#fff';g.fillRect(px,py,block-1,1);g.globalAlpha=1}g.restore();
}
function glitch(out,source,{progress,time,intensity,edge}){
  const g=out.getContext('2d'),W=out.width,H=out.height;clear(out);g.save();const reveal=Math.max(1,Math.floor(H*clamp(progress)));g.beginPath();g.rect(0,0,W,reveal);g.clip();g.drawImage(source,0,0);const slices=10+Math.floor(intensity*18),amp=6+edge*38;for(let i=0;i<slices;i++){const y=Math.floor(noise(i*19+Math.floor(time*8))*H),h=2+Math.floor(noise(i*23)*22),dx=(noise(i*31+Math.floor(time*13))-.5)*amp;g.drawImage(source,0,y,W,h,dx,y,W,h)}g.globalCompositeOperation='screen';g.globalAlpha=.17+.14*intensity;const split=2+Math.round(edge*8);g.drawImage(source,0,0,W,H,split,0,W,H);g.fillStyle='rgba(255,0,88,.22)';for(let i=0;i<5;i++){const y=(noise(i*7+Math.floor(time*5))*H)|0;g.fillRect(0,y,W,1+(i%2))}g.fillStyle='rgba(0,220,255,.16)';for(let y=0;y<reveal;y+=4)g.fillRect(0,y,W,1);g.restore();
}

const ENGINES={grass,particles,liquid,pixel,glitch};
export const V3_EFFECT_METHODS=new Set(Object.keys(ENGINES));
export function renderV3Effect(out,source,{method='particles',progress=1,time=0,intensity=.3,size=42,edge=.45}={}){const fn=ENGINES[method];if(!fn)return false;fn(out,source,{progress:clamp(progress),time:Number.isFinite(time)?time:0,intensity:clamp(intensity),size,edge:clamp(edge)});return true}
export function effectEngineSnapshot(method){return{method,engine:ENGINES[method]?'native-v3-canvas-engine':'legacy-technique',live:!!ENGINES[method]}}
