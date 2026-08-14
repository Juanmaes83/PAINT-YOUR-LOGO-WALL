import * as THREE from 'three';
import {STYLE_PROFILES,drawTechniqueMask} from './v21-style-engine.js';
import {prepareMedia,resetVideo} from './v22-media.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=t=>t*t*(3-2*t);
export const METHODS=STYLE_PROFILES;
export const mkCanvas=(w=1024,h=512)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
export function drawFit(ctx,media,W,H,fit='contain'){
  const w=media.videoWidth||media.naturalWidth||media.width||W,h=media.videoHeight||media.naturalHeight||media.height||H;
  const s=fit==='cover'?Math.max(W/w,H/h):Math.min(W/w,H/h),dw=w*s,dh=h*s;
  ctx.clearRect(0,0,W,H);ctx.drawImage(media,(W-dw)/2,(H-dh)/2,dw,dh);
}
export function demoCanvas(i=0){const c=mkCanvas(),g=c.getContext('2d'),p=[['#17222e','#e05d49'],['#21372d','#d5a14c'],['#27232e','#efe7db'],['#163847','#ef815e'],['#4d2c29','#ead4a7']][i%5];g.fillStyle=p[0];g.fillRect(0,0,c.width,c.height);g.fillStyle='#f4eee4';g.font='700 110px Inter';g.fillText(['NORTH','FIELD','MONO','STUDIO','SIGNAL'][i%5],75,285);g.fillStyle=p[1];g.fillRect(80,330,690,22);return c}

export class JobManager{
  constructor(scene){this.scene=scene;this.jobs=[];this.uid=1;this.layoutMode='gallery'}
  create({name='Untitled',source=null,media=null,type='image',fileBlob=null,mediaStatus='ready',posterMedia=null,crew=null}={}){
    const sourceCanvas=source||demoCanvas(this.jobs.length),mask=mkCanvas(),out=mkCanvas(),temp=mkCanvas(),texture=new THREE.CanvasTexture(out);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.15,1.08),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));mesh.position.set(0,.95,-.16);this.scene.add(mesh);
    const method='brush',job={id:this.uid++,name,type,media,fileBlob,mediaStatus,posterMedia,source:sourceCanvas,mask,out,temp,texture,mesh,scale:1,height:0,xOffset:0,rotation:0,duration:10,fit:'contain',living:true,method,reveal:STYLE_PROFILES[method].reveal,crew:crew||STYLE_PROFILES[method].crew,progress:0,baseY:.95,activated:false,activationCount:0,playFailures:0,activationDelay:.5,mediaError:null};this.jobs.push(job);this.layout();return job;
  }
  layout(mode=this.layoutMode){this.layoutMode=mode;const n=Math.max(this.jobs.length,1);this.jobs.forEach((j,i)=>{let x=0,y=j.baseY+j.height;if(mode==='grid'){const cols=Math.ceil(Math.sqrt(n)),r=Math.floor(i/cols),c=i%cols;x=(c-(cols-1)/2)*2.45;y=1.65-r*1.45+j.height}else if(mode==='hero'){x=i===0?0:(i-(n)/2)*1.8;y=i===0?1.25:0.15+j.height}else if(mode==='staggered'){x=(i-(n-1)/2)*2.15;y=.75+(i%2)*1.05+j.height}else if(mode==='mural'){x=(i-(n-1)/2)*1.72;y=.95+Math.sin(i*1.7)*.35+j.height}else{const span=Math.min(9.4,Math.max(0,(n-1)*2.25));x=n===1?0:-span/2+i*(span/Math.max(1,n-1));y=j.baseY+j.height}j.x=x+j.xOffset;j.mesh.position.set(j.x,y,-.16);j.mesh.scale.setScalar(mode==='hero'?(i===0?j.scale*1.18:j.scale*.82):j.scale);j.mesh.rotation.z=THREE.MathUtils.degToRad(j.rotation)})}
  delete(i){const j=this.jobs[i];if(!j)return;if(j.media?.pause)j.media.pause();j._cleanup?.();this.scene.remove(j.mesh);j.texture.dispose();this.jobs.splice(i,1);this.layout()}
  async duplicate(i){const src=this.jobs[i];if(!src)return null;let j;if(src.fileBlob)j=await this.fromFile(src.fileBlob);else{const c=mkCanvas();c.getContext('2d').drawImage(src.source,0,0);j=this.create({name:`${src.name} copy`,source:c,type:'image'})}Object.assign(j,{name:`${src.name} copy`,scale:src.scale,height:src.height,xOffset:src.xOffset,rotation:src.rotation,duration:src.duration,fit:src.fit,living:src.living,method:src.method,reveal:src.reveal,crew:src.crew,activationDelay:src.activationDelay});this.layout();return j}
  move(i,d){const ni=i+d;if(ni<0||ni>=this.jobs.length)return i;[this.jobs[i],this.jobs[ni]]=[this.jobs[ni],this.jobs[i]];this.layout();return ni}
  clear(){while(this.jobs.length)this.delete(this.jobs.length-1)}
  resetPlayback(){this.jobs.forEach(j=>{j.progress=0;j.activated=false;j.activationCount=0;j.playFailures=0;if(j.type==='video')resetVideo(j)})}
  totalDuration(){return Math.max(1,this.jobs.reduce((a,j)=>a+j.duration,0))}
  resolveTime(t){let acc=0;for(let i=0;i<this.jobs.length;i++){if(t<acc+this.jobs[i].duration)return{i,local:(t-acc)/this.jobs[i].duration,start:acc};acc+=this.jobs[i].duration}return{i:Math.max(0,this.jobs.length-1),local:.999,start:Math.max(0,acc-(this.jobs.at(-1)?.duration||0))}}
  drawMedia(job){if(job.type!=='video'||!job.media||!job.activated||job.media.readyState<2)return;drawFit(job.source.getContext('2d'),job.media,1024,512,job.fit)}
  paint(job,p,{size=42,edge=.34,wet=.22}={}){p=clamp(p);job.progress=p;this.drawMedia(job);drawTechniqueMask(job.mask,{progress:p,method:job.method,size,edge});const mg=job.mask.getContext('2d');const completion=clamp((p-.88)/.12);if(completion>0){mg.save();mg.globalAlpha=ease(completion);mg.fillStyle='#fff';mg.fillRect(0,0,job.mask.width,job.mask.height);mg.restore()}const t=job.temp.getContext('2d');t.clearRect(0,0,1024,512);t.drawImage(job.source,0,0);t.globalCompositeOperation='destination-in';t.drawImage(job.mask,0,0);t.globalCompositeOperation='source-over';const o=job.out.getContext('2d');o.clearRect(0,0,1024,512);o.globalAlpha=.82+wet*.18;o.drawImage(job.temp,0,0);o.globalAlpha=1;job.texture.needsUpdate=true}
  async fromFile(file){const prepared=await prepareMedia(file);const c=mkCanvas();drawFit(c.getContext('2d'),prepared.posterMedia,1024,512,'contain');const j=this.create({name:file.name,type:prepared.type,media:prepared.media,fileBlob:prepared.fileBlob,mediaStatus:prepared.status,posterMedia:prepared.posterMedia,source:c});j._cleanup=prepared.cleanup;j.mediaDuration=prepared.duration;return j}
  async restore(config){if(!config.fileBlob)return null;const j=await this.fromFile(config.fileBlob);Object.assign(j,{name:config.name,scale:config.scale,height:config.height,xOffset:config.xOffset,rotation:config.rotation,duration:config.duration,fit:config.fit,living:config.living,method:config.method,reveal:config.reveal,crew:config.crew||STYLE_PROFILES[config.method]?.crew||'aya',activationDelay:config.activationDelay??.5});this.layout();return j}
}
