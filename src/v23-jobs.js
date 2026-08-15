import * as THREE from 'three';
import {STYLE_PROFILES,drawTechniqueMask,V3_EFFECT_METHODS} from './v3-profile-extension.js';
import {renderV3Effect,effectEngineSnapshot} from './v3-effect-engine.js';
import {prepareMedia,resetVideo} from './v22-media.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=t=>t*t*(3-2*t);
export const METHODS=STYLE_PROFILES;
export const mkCanvas=(w=1024,h=512)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
const STORY_ORIGIN=-3.1,STORY_SPACING=3.15;

export function drawFit(ctx,media,W,H,fit='contain'){
 const w=media.videoWidth||media.naturalWidth||media.width||W,h=media.videoHeight||media.naturalHeight||media.height||H;if(!w||!h)return;
 const s=fit==='cover'?Math.max(W/w,H/h):Math.min(W/w,H/h),dw=w*s,dh=h*s;ctx.clearRect(0,0,W,H);ctx.drawImage(media,(W-dw)/2,(H-dh)/2,dw,dh);
}
export function demoCanvas(i=0){const c=mkCanvas(),g=c.getContext('2d'),p=[['#17222e','#e05d49'],['#21372d','#d5a14c'],['#27232e','#efe7db'],['#163847','#ef815e'],['#4d2c29','#ead4a7']][i%5];g.fillStyle=p[0];g.fillRect(0,0,c.width,c.height);g.fillStyle='#f4eee4';g.font='700 110px Inter, Arial';g.fillText(['NORTH','FIELD','MONO','STUDIO','SIGNAL'][i%5],75,285);g.fillStyle=p[1];g.fillRect(80,330,690,22);return c}
export function renderTextCanvas(canvas,cfg={}){const g=canvas.getContext('2d'),W=canvas.width,H=canvas.height,text=String(cfg.text||'YOUR TEXT'),font=cfg.font||'Georgia',weight=cfg.weight||700,size=Number(cfg.size||112),color=cfg.color||'#f4eee4',align=cfg.align||'center';g.clearRect(0,0,W,H);g.fillStyle=color;g.textAlign=align;g.textBaseline='middle';g.font=`${weight} ${size}px ${font}`;const x=align==='left'?70:align==='right'?W-70:W/2,lines=text.split(/\n/),lh=size*1.08;lines.forEach((line,i)=>g.fillText(line,x,H/2+(i-(lines.length-1)/2)*lh))}
function edgeBlend(ctx,W,H){const grad=ctx.createLinearGradient(0,0,W,0);grad.addColorStop(0,'rgba(255,255,255,.72)');grad.addColorStop(.025,'#fff');grad.addColorStop(.975,'#fff');grad.addColorStop(1,'rgba(255,255,255,.72)');ctx.globalCompositeOperation='destination-in';ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over'}

export class JobManager{
 constructor(scene){this.scene=scene;this.jobs=[];this.uid=1;this.layoutMode='gallery';window.__PYLW_JOB_MANAGER__=this}
 create({name='Untitled',source=null,media=null,type='image',fileBlob=null,mediaStatus='ready',posterMedia=null,crew='aya',textConfig=null}={}){
  const sourceCanvas=source||demoCanvas(this.jobs.length),mask=mkCanvas(),effect=mkCanvas(),out=mkCanvas(),temp=mkCanvas(),texture=new THREE.CanvasTexture(out);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;
  const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,opacity:.99});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.45,1.225),material);mesh.position.set(0,.95,-.14);mesh.renderOrder=2;this.scene.add(mesh);
  const method='brush',job={id:this.uid++,name,type,media,fileBlob,mediaStatus,posterMedia,source:sourceCanvas,mask,effect,out,temp,texture,mesh,scale:1.16,height:0,xOffset:0,rotation:0,duration:10,fit:'contain',living:true,method,reveal:STYLE_PROFILES[method].reveal,crew:crew||'aya',progress:0,baseY:.95,activated:false,previewing:false,activationCount:0,playFailures:0,activationDelay:.5,mediaError:null,textConfig,effectFrames:0,sourceFrame:0,lastEffect:effectEngineSnapshot(method),frozenEffectTime:0};this.jobs.push(job);this.layout();return job;
 }
 createText(textConfig={}){const c=mkCanvas(),cfg={text:'YOUR TEXT',font:'Georgia',weight:700,size:112,color:'#f4eee4',align:'center',...textConfig};renderTextCanvas(c,cfg);return this.create({name:cfg.text||'Text',source:c,type:'text',crew:'aya',textConfig:cfg})}
 updateText(job,patch){if(!job||job.type!=='text')return;Object.assign(job.textConfig,patch);job.name=job.textConfig.text||'Text';renderTextCanvas(job.source,job.textConfig);this.preview(job,{size:42,edge:.35,wet:.2})}
 layout(mode=this.layoutMode){
  this.layoutMode=mode;const n=Math.max(this.jobs.length,1);this.jobs.forEach((j,i)=>{let x=0,y=j.baseY+j.height,scale=j.scale;
   if(mode==='grid'){const cols=Math.ceil(Math.sqrt(n)),r=Math.floor(i/cols),c=i%cols;x=(c-(cols-1)/2)*2.8;y=1.75-r*1.55+j.height}
   else if(mode==='hero'){x=i===0?0:(i-1)*2.25+2.7;y=i===0?1.25:.05+j.height;scale=i===0?j.scale*1.22:j.scale*.88}
   else if(mode==='staggered'){x=STORY_ORIGIN+i*STORY_SPACING;y=.82+(i%2)*.8+j.height}
   else if(mode==='mural'){x=STORY_ORIGIN+i*STORY_SPACING;y=.95+Math.sin(i*1.7)*.28+j.height}
   else{x=STORY_ORIGIN+i*STORY_SPACING;y=j.baseY+j.height}
   j.x=x+j.xOffset;j.mesh.position.set(j.x,y,-.14);j.mesh.scale.setScalar(scale);j.mesh.rotation.z=THREE.MathUtils.degToRad(j.rotation);
  });
 }
 delete(i){const j=this.jobs[i];if(!j)return;if(j.media?.pause)j.media.pause();j._cleanup?.();this.scene.remove(j.mesh);j.texture.dispose();this.jobs.splice(i,1);this.layout()}
 async duplicate(i){const src=this.jobs[i];if(!src)return null;let j;if(src.type==='text')j=this.createText({...src.textConfig});else if(src.fileBlob)j=await this.fromFile(src.fileBlob);else{const c=mkCanvas();c.getContext('2d').drawImage(src.source,0,0);j=this.create({name:`${src.name} copy`,source:c,type:'image',crew:src.crew})}Object.assign(j,{name:`${src.name} copy`,scale:src.scale,height:src.height,xOffset:src.xOffset,rotation:src.rotation,duration:src.duration,fit:src.fit,living:src.living,method:src.method,reveal:src.reveal,crew:src.crew,activationDelay:src.activationDelay});this.layout();return j}
 move(i,d){const ni=i+d;if(ni<0||ni>=this.jobs.length)return i;[this.jobs[i],this.jobs[ni]]=[this.jobs[ni],this.jobs[i]];this.layout();return ni}
 clear(){while(this.jobs.length)this.delete(this.jobs.length-1)}
 resetPlayback(){this.jobs.forEach(j=>{j.progress=0;j.activated=false;j.previewing=false;j.activationCount=0;j.playFailures=0;j.effectFrames=0;j.sourceFrame=0;j.frozenEffectTime=0;if(j.type==='video')resetVideo(j);this.compose(j,0,{forceFinal:false})})}
 totalDuration(){return Math.max(1,this.jobs.reduce((a,j)=>a+j.duration,0))}
 resolveTime(t){let acc=0;for(let i=0;i<this.jobs.length;i++){if(t<acc+this.jobs[i].duration)return{i,local:(t-acc)/this.jobs[i].duration,start:acc};acc+=this.jobs[i].duration}return{i:Math.max(0,this.jobs.length-1),local:.999,start:Math.max(0,acc-(this.jobs.at(-1)?.duration||0))}}
 drawPoster(job){if(job.type!=='video'||!job.posterMedia)return false;drawFit(job.source.getContext('2d'),job.posterMedia,1024,512,job.fit);return true}
 drawMedia(job){if(job.type!=='video'||!job.media||(job.media.readyState<2)||(!job.activated&&!job.previewing))return false;drawFit(job.source.getContext('2d'),job.media,1024,512,job.fit);job.sourceFrame=(job.sourceFrame||0)+1;return true}
 compose(job,p,{size=42,edge=.34,wet=.22,forceFinal=false,preserveProgress=false,preview=false}={}){
  const prior=job.progress;p=clamp(p);if(!preserveProgress)job.progress=p;if(job.type==='video'){if(job.activated||job.previewing)this.drawMedia(job);else this.drawPoster(job)}
  const o=job.out.getContext('2d');if(p<=0&&!preview){o.clearRect(0,0,1024,512);job.texture.needsUpdate=true;if(preserveProgress)job.progress=prior;return}
  const finalP=forceFinal||preview?1:p,t=job.temp.getContext('2d');t.clearRect(0,0,1024,512);
  if(V3_EFFECT_METHODS.has(job.method)){
   const live=job.type==='video'&&(job.activated||job.previewing),time=live?Number(job.media?.currentTime||0):(forceFinal?(job.frozenEffectTime||0):Number(performance.now()/1000));if(forceFinal&&!live&&!job.frozenEffectTime)job.frozenEffectTime=time;
   renderV3Effect(job.effect,job.source,{method:job.method,progress:finalP,time,intensity:wet,size,edge,options:{...(job.effectOptions||{}),live}});t.drawImage(job.effect,0,0);job.effectFrames=(job.effectFrames||0)+1;job.lastEffect=effectEngineSnapshot(job.method);
  }else{
   drawTechniqueMask(job.mask,{progress:finalP,method:job.method,size,edge});const mg=job.mask.getContext('2d'),completion=forceFinal||preview?1:clamp((p-.86)/.14);if(completion>0){mg.save();mg.globalAlpha=ease(completion);mg.fillStyle='#fff';mg.fillRect(0,0,job.mask.width,job.mask.height);mg.restore()}t.drawImage(job.source,0,0);t.globalCompositeOperation='destination-in';t.drawImage(job.mask,0,0);t.globalCompositeOperation='source-over';edgeBlend(t,1024,512);job.lastEffect=effectEngineSnapshot(job.method);
  }
  o.clearRect(0,0,1024,512);o.globalAlpha=.92+wet*.07;o.drawImage(job.temp,0,0);o.globalAlpha=1;job.texture.needsUpdate=true;if(preserveProgress)job.progress=prior;
 }
 paint(job,p,opts={}){this.compose(job,p,opts)}
 preview(job,opts={}){if(!job)return;this.compose(job,1,{...opts,preview:true,forceFinal:true,preserveProgress:true})}
 refreshLiveVideos(opts={}){let changed=0;for(const j of this.jobs){if(j.type==='video'&&(j.activated||j.previewing)&&j.media?.readyState>=2&&!j.media.paused){this.compose(j,1,{...opts,forceFinal:true,preserveProgress:true,preview:j.previewing});changed++}}return changed}
 async fromFile(file){const prepared=await prepareMedia(file),c=mkCanvas();drawFit(c.getContext('2d'),prepared.posterMedia,1024,512,'contain');const j=this.create({name:file.name,type:prepared.type,media:prepared.media,fileBlob:prepared.fileBlob,mediaStatus:prepared.status,posterMedia:prepared.posterMedia,source:c,crew:'aya'});j._cleanup=prepared.cleanup;j.mediaDuration=prepared.duration;return j}
 async restore(config){let j;if(config.type==='text')j=this.createText(config.textConfig||{text:config.name});else if(config.fileBlob)j=await this.fromFile(config.fileBlob);else return null;Object.assign(j,{name:config.name,scale:config.scale,height:config.height,xOffset:config.xOffset,rotation:config.rotation,duration:config.duration,fit:config.fit,living:config.living,method:STYLE_PROFILES[config.method]?config.method:'brush',reveal:config.reveal,crew:config.crew||'aya',activationDelay:config.activationDelay??.5,textConfig:config.textConfig||j.textConfig,effectOptions:config.effectOptions||{}});if(j.type==='text')renderTextCanvas(j.source,j.textConfig);this.layout();return j}
}