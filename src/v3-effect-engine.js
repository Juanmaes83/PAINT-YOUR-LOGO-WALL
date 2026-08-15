import {renderGrassAdapter,grassAdapterSnapshot} from './v3/adapters/grass-adapter.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const fract=v=>v-Math.floor(v);
const noise=n=>fract(Math.sin(n*12.9898+78.233)*43758.5453);

// Remaining V3 engines are temporary approximations and are replaced one-by-one.
// Grass is now routed to the source-faithful Escaparates Pro adapter below.
const GRASS_PALETTE=[
 [255,255,255],[225,240,210],[200,230,180],[180,220,160],[165,210,140],[150,200,120],[135,190,105],[120,180,90],
 [105,170,75],[90,160,65],[75,145,55],[65,130,50],[55,115,45],[48,100,40],[42,85,35],[37,75,31],[32,65,26],
 [28,55,22],[24,45,19],[21,38,16],[18,32,13],[15,26,10],[12,20,8],[9,15,6],[5,7,3],[3,5,2],[2,3,1],[0,0,0]
];
const SAMPLE_CACHE=new Map(),PIXEL_ORDER_CACHE=new Map();
function sample(source,w,h){const key=`${w}x${h}`;let c=SAMPLE_CACHE.get(key);if(!c){c=document.createElement('canvas');c.width=w;c.height=h;SAMPLE_CACHE.set(key,c)}const g=c.getContext('2d',{willReadFrequently:true});g.clearRect(0,0,w,h);g.drawImage(source,0,0,w,h);return{w,h,data:g.getImageData(0,0,w,h).data}}
function clear(out){out.getContext('2d').clearRect(0,0,out.width,out.height)}
function closestGrass(r,g,b){let best=GRASS_PALETTE[0],bd=Infinity;for(const c of GRASS_PALETTE){const d=Math.abs(c[0]-r)+Math.abs(c[1]-g)+Math.abs(c[2]-b);if(d<bd){bd=d;best=c}}return best}
function rgba(d,i,a=1){return`rgba(${d[i]},${d[i+1]},${d[i+2]},${(d[i+3]/255)*a})`}

// Legacy approximation retained only as rollback/reference. It is NOT registered.
function grassLegacy(out,source,{progress,time,intensity,edge}){
 clear(out);if(progress<=0)return;const g=out.getContext('2d'),W=out.width,H=out.height,s=sample(source,72,36),density=2+Math.round(intensity*2),rows=s.h,cols=s.w,total=rows*cols,limit=Math.floor(total*clamp(progress));g.save();g.lineCap='round';
 for(let n=0;n<limit;n++){const x=n%cols,y=(n/cols)|0,i=(y*cols+x)*4,a=s.data[i+3]/255;if(a<.06)continue;const base=closestGrass(s.data[i],s.data[i+1],s.data[i+2]),px=(x+.5)/cols*W,py=(y+.95)/rows*H,brightness=(s.data[i]*10+s.data[i+1]*100+s.data[i+2]*100)/(210*255);
  for(let k=0;k<density;k++){const seed=n*17+k*41,jx=(noise(seed)-.5)*(2+edge*9),jy=(noise(seed+4)-.5)*(2+edge*5),len=4+brightness*20+noise(seed+9)*(8+intensity*30),rot=(noise(seed+11)-.5)*1.25+Math.sin(time*1.7+n*.013)*(.04+edge*.08),cv=noise(seed+19)*26,rr=Math.min(255,base[0]+cv),gg=Math.min(255,base[1]+cv),bb=Math.min(255,base[2]+cv);g.save();g.translate(px+jx,py+jy);g.rotate(rot);g.globalAlpha=.32+noise(seed+23)*.55;g.strokeStyle=`rgb(${rr|0},${gg|0},${bb|0})`;g.lineWidth=.7+noise(seed+27)*(1.3+intensity);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.42,-1-edge*4,len,0);g.stroke();g.restore()}}
 g.restore();
}
void grassLegacy;

function particles(out,source,{progress,time,intensity,edge}){
 clear(out);if(progress<=0)return;const g=out.getContext('2d'),W=out.width,H=out.height,s=sample(source,96,48),gap=2,total=Math.ceil(s.w/gap)*Math.ceil(s.h/gap),limit=Math.floor(total*clamp(progress));let n=0;g.save();
 for(let y=0;y<s.h;y+=gap){for(let x=0;x<s.w;x+=gap){if(n>=limit)break;const i=(y*s.w+x)*4,a=s.data[i+3]/255,seed=x*97+y*131+n*7;n++;if(a<.08)continue;const tx=(x+.5)/s.w*W,ty=(y+.5)/s.h*H,edgePick=noise(seed),travel=1-clamp(progress);let sx,sy;if(edgePick<.25){sx=noise(seed+1)*W;sy=-45}else if(edgePick<.5){sx=noise(seed+1)*W;sy=H+45}else if(edgePick<.75){sx=-45;sy=noise(seed+1)*H}else{sx=W+45;sy=noise(seed+1)*H}const spring=1-Math.pow(travel,2.2),wander=(2+edge*18)*Math.sin(time*1.6+seed*.07)*(1-travel*.6),px=sx+(tx-sx)*spring+wander,py=sy+(ty-sy)*spring+Math.cos(time*1.3+seed*.05)*(2+intensity*6),size=1.4+intensity*4+noise(seed+2)*2.5;g.globalAlpha=.5+a*.48;g.fillStyle=`rgb(${s.data[i]},${s.data[i+1]},${s.data[i+2]})`;g.beginPath();g.roundRect(px-size/2,py-size/2,size,size,size>4?1.8:1);g.fill()}if(n>=limit)break}g.restore();
}

function falloffWeight(dist){const t=clamp(1-dist);return t*t*(3-2*t)}
function displacement(ndx,ndy,dist,falloff,mode,frequency){const sd=dist+.0001;switch(mode){case'attract':return[-ndx/sd*.7*falloff,-ndy/sd*.7*falloff];case'swirl':return[-ndy/sd*.7*falloff,ndx/sd*.7*falloff];case'ripple':{const w=Math.sin(dist*frequency*Math.PI);return[ndx/sd*w*.7*falloff,ndy/sd*w*.7*falloff]}case'wave':return[0,Math.sin(ndx*frequency*Math.PI)*.7*falloff];default:return[ndx/sd*.7*falloff,ndy/sd*.7*falloff]}}
function liquid(out,source,{progress,time,intensity,edge,options={}}){
 clear(out);if(progress<=0)return;const W=out.width,H=out.height,g=out.getContext('2d'),mode=options.liquidMode||['refract','swirl','ripple','wave'][Math.min(3,Math.floor(intensity*4))],frequency=3+edge*9,amp=9+intensity*42,cx=.5+Math.sin(time*.55)*.12,cy=.5+Math.cos(time*.43)*.08,radius=.18+.42*clamp(progress),cols=42,rows=24,sw=W/cols+1,sh=H/rows+1;g.save();g.drawImage(source,0,0,W,H);
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const u=(x+.5)/cols,v=(y+.5)/rows,ndx=(u-cx)/radius,ndy=(v-cy)/radius,dist=Math.hypot(ndx,ndy);if(dist>1)continue;const f=falloffWeight(dist),[dx,dy]=displacement(ndx,ndy,dist,f,mode,frequency),sx=x*W/cols,sy=y*H/rows;g.drawImage(source,sx,sy,sw,sh,sx+dx*amp,sy+dy*amp,sw+1,sh+1)}
 g.globalCompositeOperation='screen';g.globalAlpha=.08+.16*intensity;for(let k=0;k<7;k++){const yy=(k+.5)/7*H+Math.sin(time*1.4+k)*8;g.fillStyle='rgba(180,235,255,.45)';g.fillRect(0,yy,W,1)}g.restore();
}

function pixelOrder(W,H,block){const key=`${W}:${H}:${block}`;let cached=PIXEL_ORDER_CACHE.get(key);if(cached)return cached;const cols=Math.ceil(W/block),rows=Math.ceil(H/block),cells=[];for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const dx=x-cols/2,dy=y-rows/2;cells.push({x,y,k:Math.hypot(dx,dy)+noise(x*37+y*53)*3})}cells.sort((a,b)=>a.k-b.k);cached={cols,rows,cells};PIXEL_ORDER_CACHE.set(key,cached);return cached}
function pixel(out,source,{progress,time,intensity,edge}){
 clear(out);if(progress<=0)return;const g=out.getContext('2d'),W=out.width,H=out.height,s=sample(source,96,48),block=Math.max(7,Math.round(18-edge*8)),{cols,rows,cells}=pixelOrder(W,H,block),limit=Math.floor(cells.length*clamp(progress));g.save();
 for(let n=0;n<limit;n++){const c=cells[n],sx=Math.min(s.w-1,Math.max(0,Math.floor((c.x+.5)/cols*s.w))),sy=Math.min(s.h-1,Math.max(0,Math.floor((c.y+.5)/rows*s.h))),i=(sy*s.w+sx)*4,a=s.data[i+3]/255;if(a<.06)continue;const px=c.x*block,py=c.y*block,depth=2+intensity*9+Math.sin(time*1.2+n*.07)*1.5;g.fillStyle=`rgba(0,0,0,${.16+.16*intensity})`;g.fillRect(px+depth,py+depth,block-1,block-1);g.fillStyle=rgba(s.data,i,a);g.fillRect(px,py,block-1,block-1);g.globalAlpha=.18+.18*intensity;g.fillStyle='#fff';g.fillRect(px,py,block-1,1);g.globalAlpha=1}g.restore();
}

function glitch(out,source,{progress,time,intensity,edge}){
 clear(out);if(progress<=0)return;const g=out.getContext('2d'),W=out.width,H=out.height,reveal=Math.floor(H*clamp(progress));g.save();g.beginPath();g.rect(0,0,W,reveal);g.clip();g.drawImage(source,0,0,W,H);const slices=16+Math.round(intensity*38),amp=8+edge*54,frame=Math.floor(time*14);for(let i=0;i<slices;i++){const y=(noise(i*19+frame)*reveal)|0,h=2+(noise(i*23+frame)*26)|0,dx=(noise(i*31+frame)-.5)*amp;g.drawImage(source,0,y,W,h,dx,y,W,h)}g.globalCompositeOperation='screen';g.globalAlpha=.18+.16*intensity;const split=3+Math.round(edge*10);g.drawImage(source,0,0,W,H,split,0,W,H);g.globalCompositeOperation='source-over';g.globalAlpha=.24;for(let y=0;y<reveal;y+=4){g.fillStyle=y%8?'rgba(0,220,255,.12)':'rgba(255,0,88,.10)';g.fillRect(0,y,W,1)}g.restore();
}

const ENGINES={grass:renderGrassAdapter,particles,liquid,pixel,glitch};
export const V3_EFFECT_METHODS=new Set(Object.keys(ENGINES));
export function renderV3Effect(out,source,{method='particles',progress=1,time=0,intensity=.3,size=42,edge=.45,options={}}={}){const fn=ENGINES[method];if(!fn)return false;fn(out,source,{progress:clamp(progress),time:Number.isFinite(time)?time:0,intensity:clamp(intensity),size,edge:clamp(edge),options});return true}
export function effectEngineSnapshot(method){if(method==='grass')return grassAdapterSnapshot();return{method,engine:ENGINES[method]?'temporary-v3-engine':'legacy-technique',live:!!ENGINES[method]}}
export function effectToolPoint(method,p,W=1024,H=512){p=clamp(p);if(method==='grass')return{x:80+p*(W-160),y:H*(.78-.5*Math.sin(p*Math.PI))};if(method==='particles')return{x:W*(.5+.38*Math.cos(p*Math.PI*2)),y:H*(.5+.32*Math.sin(p*Math.PI*2))};if(method==='liquid')return{x:W*(.15+.7*p),y:H*(.5+.2*Math.sin(p*Math.PI*4))};if(method==='pixel')return{x:W*(.15+.7*p),y:H*(.2+.6*((Math.floor(p*7)%7)/6))};if(method==='glitch')return{x:W*(.1+.8*p),y:H*(.15+.7*noise(Math.floor(p*40)))};return{x:W*p,y:H*.5}}
