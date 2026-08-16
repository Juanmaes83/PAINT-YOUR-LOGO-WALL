const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const fract=v=>v-Math.floor(v);
const noise=n=>fract(Math.sin(n*12.9898+78.233)*43758.5453);
const CROP_CACHE=new WeakMap(),SAMPLE_CACHE=new Map();

function clear(out){out.getContext('2d').clearRect(0,0,out.width,out.height)}
function cropTransparentPadding(source){
 if(!source?.getContext||!source.width||!source.height)return source;
 let rec=CROP_CACHE.get(source);if(!rec){
  const g=source.getContext('2d',{willReadFrequently:true}),W=source.width,H=source.height,d=g.getImageData(0,0,W,H).data;let minX=W,minY=H,maxX=-1,maxY=-1;
  for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2)if(d[(y*W+x)*4+3]>8){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}
  if(maxX<0){rec={trimmed:false};CROP_CACHE.set(source,rec);return source}
  minX=Math.max(0,minX-3);minY=Math.max(0,minY-3);maxX=Math.min(W-1,maxX+3);maxY=Math.min(H-1,maxY+3);
  const trimmed=minX>3||minY>3||maxX<W-4||maxY<H-4,c=document.createElement('canvas');c.width=Math.max(1,maxX-minX+1);c.height=Math.max(1,maxY-minY+1);rec={trimmed,minX,minY,w:c.width,h:c.height,c};CROP_CACHE.set(source,rec);
 }
 if(!rec.trimmed)return source;const g=rec.c.getContext('2d');g.clearRect(0,0,rec.w,rec.h);g.drawImage(source,rec.minX,rec.minY,rec.w,rec.h,0,0,rec.w,rec.h);return rec.c;
}
function sample(source,w=96,h=48){
 const src=cropTransparentPadding(source),key=`${w}x${h}`;let c=SAMPLE_CACHE.get(key);if(!c){c=document.createElement('canvas');c.width=w;c.height=h;SAMPLE_CACHE.set(key,c)}const g=c.getContext('2d',{willReadFrequently:true});g.clearRect(0,0,w,h);g.drawImage(src,0,0,w,h);return{w,h,data:g.getImageData(0,0,w,h).data,canvas:c};
}
function drawContained(g,source,W,H){const src=cropTransparentPadding(source),sw=src.videoWidth||src.naturalWidth||src.width,sh=src.videoHeight||src.naturalHeight||src.height,s=Math.min(W/sw,H/sh),dw=sw*s,dh=sh*s;g.drawImage(src,(W-dw)/2,(H-dh)/2,dw,dh)}
function rgba(d,i,a=1){return`rgba(${d[i]},${d[i+1]},${d[i+2]},${clamp((d[i+3]/255)*a)})`}

export function renderShapeMatrixAdapter(out,source,{progress=1,time=0,intensity=.3,edge=.45}={}){
 clear(out);if(progress<=0)return;const g=out.getContext('2d'),W=out.width,H=out.height,s=sample(source,72,36),cw=W/s.w,ch=H/s.h,shape=Math.min(4,Math.floor(edge*5)),phase=time*(.4+intensity*1.1);g.save();g.translate(cw/2,ch/2);
 for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const i=(y*s.w+x)*4,a=s.data[i+3]/255;if(a<.05)continue;const order=(x+y*.72)/(s.w+s.h*.72);if(order>clamp(progress)*1.08)continue;const l=(s.data[i]*.299+s.data[i+1]*.587+s.data[i+2]*.114)/255,px=x*cw,py=y*ch,pulse=.88+.12*Math.sin(phase+x*.19+y*.13),r=Math.min(cw,ch)*(.12+.42*l)*(1+intensity*.5)*pulse;g.fillStyle=rgba(s.data,i,.28+.72*l);g.strokeStyle=rgba(s.data,i,.72);g.lineWidth=.6+edge*1.8;g.beginPath();const kind=(shape+x+y)%5;
  if(kind===0)g.arc(px,py,r,0,Math.PI*2);else if(kind===1)g.rect(px-r,py-r,r*2,r*2);else if(kind===2){g.moveTo(px,py-r*1.3);g.lineTo(px+r*1.12,py+r);g.lineTo(px-r*1.12,py+r);g.closePath()}else if(kind===3){for(let k=0;k<6;k++){const a0=Math.PI/3*k-Math.PI/6,qx=px+Math.cos(a0)*r,qy=py+Math.sin(a0)*r;k?g.lineTo(qx,qy):g.moveTo(qx,qy)}g.closePath()}else{for(let k=0;k<10;k++){const rr=k%2?r*.43:r,a0=-Math.PI/2+k*Math.PI/5,qx=px+Math.cos(a0)*rr,qy=py+Math.sin(a0)*rr;k?g.lineTo(qx,qy):g.moveTo(qx,qy)}g.closePath()}g.fill();if(edge>.35)g.stroke();}
 g.restore();
}
export function shapeMatrixSnapshot(){return{method:'shapeMatrix',engine:'derived-video-dither-ascii-shape-matrix',donorRepo:'Juanmaes83/Video-Dither-ASCII-Effect-Pro',donorPath:'index.html',geometryFix:'trim-transparent-contain-padding-v1',live:true}}

export function renderEnergyShieldAdapter(out,source,{progress=1,time=0,intensity=.3,edge=.45}={}){
 clear(out);if(progress<=0)return;const g=out.getContext('2d'),W=out.width,H=out.height,src=cropTransparentPadding(source),hex=22+Math.round((1-edge)*18),hx=hex*1.5,hy=Math.sqrt(3)*hex,cols=Math.ceil(W/hx)+2,rows=Math.ceil(H/hy)+2,front=clamp(progress*1.16),flash=(Math.sin(time*2.8)+1)*.5;
 g.save();g.globalAlpha=.28+.32*intensity;g.filter=`saturate(${.2+intensity*.6}) contrast(1.18)`;drawContained(g,src,W,H);g.filter='none';g.globalCompositeOperation='screen';g.fillStyle=`rgba(30,215,255,${.12+.12*intensity})`;g.fillRect(0,0,W,H);g.shadowColor='rgba(90,240,255,.9)';g.shadowBlur=5+intensity*16;
 for(let row=-1;row<rows;row++)for(let col=-1;col<cols;col++){const cx=col*hx+(row%2?hx*.5:0),cy=row*hy*.5+hex,seed=row*131+col*79,dissolve=noise(seed*1.7);if(dissolve>front+.08*Math.sin(time+seed))continue;const pulse=.18+.4*noise(seed+Math.floor(time*3))+.18*flash,lumaX=clamp(Math.floor(cx/W*71),0,71),lumaY=clamp(Math.floor(cy/H*35),0,35),ss=sample(source,72,36),ii=(lumaY*72+lumaX)*4,lum=(ss.data[ii]+ss.data[ii+1]*2+ss.data[ii+2])/1020;if(ss.data[ii+3]<12)continue;g.strokeStyle=`rgba(${70+ss.data[ii]*.28},${190+ss.data[ii+1]*.24},255,${clamp(.16+pulse+lum*.25)})`;g.lineWidth=.7+edge*1.8;g.beginPath();for(let k=0;k<6;k++){const a=Math.PI/3*k,qx=cx+Math.cos(a)*hex,qy=cy+Math.sin(a)*hex;k?g.lineTo(qx,qy):g.moveTo(qx,qy)}g.closePath();g.stroke();}
 const scan=(time*90)%H;g.fillStyle=`rgba(190,255,255,${.22+.28*intensity})`;g.shadowBlur=18;g.fillRect(0,scan,W,1.5+edge*2);g.restore();
}
export function energyShieldSnapshot(){return{method:'energyShield',engine:'derived-force-shield-hex-materialization',donorRepo:'Juanmaes83/flow-shield-effect',features:['hex-grid','noise-dissolve','fresnel-like-glow','scan-front'],geometryFix:'trim-transparent-contain-padding-v1',live:true}}

export function renderHologramAdapter(out,source,{progress=1,time=0,intensity=.3,edge=.45}={}){
 clear(out);if(progress<=0)return;const g=out.getContext('2d'),W=out.width,H=out.height,s=sample(source,96,48),cx=W/2,cy=H/2,layers=3+Math.round(intensity*3),reveal=clamp(progress);g.save();g.globalCompositeOperation='screen';
 for(let z=layers-1;z>=0;z--){const depth=z/(layers-1||1),scale=1+depth*(.015+.055*edge),alpha=(.07+.16*(1-depth))*(.7+intensity);g.save();g.translate(cx,cy);g.scale(scale,scale);g.translate(-cx,-cy);for(let y=0;y<s.h;y+=2)for(let x=0;x<s.w;x+=2){const i=(y*s.w+x)*4,a=s.data[i+3]/255;if(a<.08)continue;const k=(x+y*.6)/(s.w+s.h*.6);if(k>reveal*1.08)continue;const l=(s.data[i]*.3+s.data[i+1]*.59+s.data[i+2]*.11)/255,jitter=Math.sin(time*8+y*.7+x*.11)*(1+edge*4),px=(x+.5)/s.w*W+jitter+depth*4,py=(y+.5)/s.h*H+(noise(x*17+y*29+Math.floor(time*8))-.5)*2.5,r=.6+l*(1.5+intensity*2);g.fillStyle=`rgba(${40+s.data[i]*.18},${150+s.data[i+1]*.38},${210+s.data[i+2]*.18},${alpha*a*(.5+l)})`;g.fillRect(px-r,py-r*.55,r*2,r*1.1)}g.restore()}
 g.shadowColor='rgba(70,220,255,.95)';g.shadowBlur=8+intensity*14;for(let y=0;y<H;y+=4+Math.round((1-edge)*5)){const wobble=Math.sin(time*4+y*.043)*(.25+intensity*.65);g.fillStyle=`rgba(80,230,255,${.025+.055*(.5+.5*wobble)})`;g.fillRect(0,y,W,1)}
 const band=(time*72)%H;g.fillStyle='rgba(210,255,255,.34)';g.fillRect(0,band,W,1.5);g.restore();
}
export function hologramSnapshot(){return{method:'hologram',engine:'derived-hologram-volume-reconstruction',donorRepo:'Juanmaes83/hologram-particles',features:['multi-depth sampling','scanline interference','holographic glow'],geometryFix:'trim-transparent-contain-padding-v1',live:true}}

export function renderSmearAdapter(out,source,{progress=1,time=0,intensity=.3,edge=.45}={}){
 clear(out);if(progress<=0)return;const g=out.getContext('2d'),W=out.width,H=out.height,src=cropTransparentPadding(source),bands=36+Math.round(edge*48),bh=H/bands,amp=8+intensity*72,trail=3+Math.round(intensity*5),reveal=clamp(progress);g.save();
 for(let b=0;b<bands;b++){const y=b*bh,ord=b/bands;if(ord>reveal*1.05)continue;const n=noise(b*31+Math.floor(time*10)),wave=Math.sin(time*2.4+b*.42),dx=(n-.5)*amp+wave*amp*.42;for(let t=trail;t>=0;t--){g.globalAlpha=t===0?.86:(.03+.055*(trail-t));g.drawImage(src,0,y/src.height*src.height,src.width,Math.max(1,bh/src.height*src.height),dx*t*.24,y,W,bh+1)}}
 g.globalAlpha=.2+.18*intensity;g.globalCompositeOperation='screen';for(let k=1;k<=3;k++){const dx=Math.sin(time*1.7+k*2.1)*(4+edge*12)*k;drawContained(g,src,W+dx,H)}g.restore();
}
export function smearSnapshot(){return{method:'smear',engine:'derived-image-drag-temporal-smear',donorRepo:'Juanmaes83/ImageDraggingEffects',features:['slice-drag','temporal-echo','directional-trails'],geometryFix:'trim-transparent-contain-padding-v1',live:true}}

export function renderAudioReactiveAdapter(out,source,{progress=1,time=0,intensity=.3,edge=.45,options={}}={}){
 clear(out);if(progress<=0)return;const g=out.getContext('2d'),W=out.width,H=out.height,src=cropTransparentPadding(source),level=clamp(Number(options.audioLevel)||0),bands=Array.isArray(options.audioBands)?options.audioBands:[],energy=clamp(Math.max(level,.12+.1*Math.sin(time*2.3))),slices=32,sh=H/slices,reveal=clamp(progress);g.save();
 for(let y=0;y<slices;y++){const ord=y/slices;if(ord>reveal*1.06)continue;const b=bands.length?bands[y%bands.length]:energy*(.55+.45*Math.sin(time*3+y*.61)),kick=clamp(Number(b)||0),dx=Math.sin(y*.65+time*(2.4+energy*5))*(4+kick*(35+intensity*95)),scale=1+kick*(.015+.085*intensity),sy=y*sh;g.save();g.translate(W/2,sy+sh/2);g.scale(scale,1+kick*.15);g.translate(-W/2,-(sy+sh/2));g.globalAlpha=.72+.25*kick;g.drawImage(src,0,sy/src.height*src.height,src.width,Math.max(1,sh/src.height*src.height),dx,sy,W,sh+1);g.restore()}
 g.globalCompositeOperation='screen';const pulse=.08+energy*(.18+.35*intensity);g.fillStyle=`rgba(255,74,170,${pulse*.55})`;g.fillRect(0,0,W,H);g.fillStyle=`rgba(44,220,255,${pulse*.48})`;g.fillRect(Math.sin(time*5)*6,0,W,H);g.globalAlpha=.28+.35*energy;for(let x=0;x<W;x+=18){const h=(18+energy*110)*( .35+.65*noise(x*7+Math.floor(time*12)));g.fillStyle='rgba(255,255,255,.22)';g.fillRect(x,H-h,1,h)}g.restore();
}
export function audioReactiveSnapshot(){return{method:'audioReactive',engine:'derived-audio-based-image-distortion',donorRepo:'Juanmaes83/AudioBasedImageDistortion',features:['real-video-analyser','slice-displacement','energy-pulse','spectrum-bars'],audio:'WebAudio AnalyserNode with deterministic fallback',geometryFix:'trim-transparent-contain-padding-v1',live:true}}
