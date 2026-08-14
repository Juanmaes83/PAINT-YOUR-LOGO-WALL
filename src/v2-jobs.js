import * as THREE from 'three';
import {drawRevealMask} from './v2-masks.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const METHODS={brush:{label:'Brush',reveal:'horizontal',crew:'aya'},roller:{label:'Roller',reveal:'horizontal',crew:'aya'},spray:{label:'Spray',reveal:'particles',crew:'foxie'},charcoal:{label:'Charcoal',reveal:'stroke',crew:'mimo'},ink:{label:'Ink / Manga',reveal:'contour',crew:'lumi'},digital:{label:'Digital',reveal:'blocks',crew:'byte'}};
export const mkCanvas=(w=1024,h=512)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
export function drawFit(ctx,media,W,H,fit='contain'){
  const w=media.videoWidth||media.naturalWidth||media.width||W,h=media.videoHeight||media.naturalHeight||media.height||H;
  const s=fit==='cover'?Math.max(W/w,H/h):Math.min(W/w,H/h),dw=w*s,dh=h*s;
  ctx.clearRect(0,0,W,H);ctx.drawImage(media,(W-dw)/2,(H-dh)/2,dw,dh);
}
export function demoCanvas(i=0){const c=mkCanvas(),g=c.getContext('2d'),p=[['#17222e','#e05d49'],['#21372d','#d5a14c'],['#27232e','#efe7db'],['#163847','#ef815e'],['#4d2c29','#ead4a7']][i%5];g.fillStyle=p[0];g.font='700 122px Inter';g.fillText(['NORTH','FIELD','MONO','STUDIO','SIGNAL'][i%5],75,295);g.fillStyle=p[1];g.fillRect(80,335,680,22);return c}
export class JobManager{
  constructor(scene){this.scene=scene;this.jobs=[];this.uid=1}
  create({name='Untitled',source=null,media=null,type='image'}={}){
    const sourceCanvas=source||demoCanvas(this.jobs.length),mask=mkCanvas(),out=mkCanvas(),temp=mkCanvas(),texture=new THREE.CanvasTexture(out);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2.15,1.08),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));mesh.position.set(0,.95,-.16);this.scene.add(mesh);
    const method='brush',job={id:this.uid++,name,type,media,source:sourceCanvas,mask,out,temp,texture,mesh,scale:1,height:0,rotation:0,duration:8,fit:'contain',living:true,method,reveal:METHODS[method].reveal,progress:0,baseY:.95};this.jobs.push(job);this.layout();return job;
  }
  layout(){const n=Math.max(this.jobs.length,1),span=Math.min(9.4,Math.max(0,(n-1)*2.25));this.jobs.forEach((j,i)=>{const x=n===1?0:-span/2+i*(span/Math.max(1,n-1));j.x=x;j.mesh.position.set(x,j.baseY+j.height,-.16);j.mesh.scale.setScalar(j.scale);j.mesh.rotation.z=THREE.MathUtils.degToRad(j.rotation)})}
  delete(i){const j=this.jobs[i];if(!j)return;if(j.media?.tagName==='VIDEO'){j.media.pause();URL.revokeObjectURL(j.media.src)}this.scene.remove(j.mesh);this.jobs.splice(i,1);this.layout()}
  duplicate(i){const src=this.jobs[i];if(!src)return null;const c=mkCanvas();c.getContext('2d').drawImage(src.source,0,0);const j=this.create({name:`${src.name} copy`,source:c,type:'image'});Object.assign(j,{scale:src.scale,height:src.height,rotation:src.rotation,duration:src.duration,fit:src.fit,living:src.living,method:src.method,reveal:src.reveal});this.layout();return j}
  move(i,d){const ni=i+d;if(ni<0||ni>=this.jobs.length)return i;[this.jobs[i],this.jobs[ni]]=[this.jobs[ni],this.jobs[i]];this.layout();return ni}
  totalDuration(){return Math.max(1,this.jobs.reduce((a,j)=>a+j.duration,0))}
  resolveTime(t){let acc=0;for(let i=0;i<this.jobs.length;i++){if(t<acc+this.jobs[i].duration)return{i,local:(t-acc)/this.jobs[i].duration,start:acc};acc+=this.jobs[i].duration}return{i:Math.max(0,this.jobs.length-1),local:.999,start:0}}
  drawMedia(job){if(job.type!=='video'||!job.media||job.media.readyState<2)return;drawFit(job.source.getContext('2d'),job.media,1024,512,job.fit)}
  paint(job,p,{size=42,edge=.34,wet=.22}={}){p=clamp(p);job.progress=p;this.drawMedia(job);drawRevealMask(job.mask,{progress:p,reveal:job.reveal,method:job.method,size,edge});const t=job.temp.getContext('2d');t.clearRect(0,0,1024,512);t.drawImage(job.source,0,0);t.globalCompositeOperation='destination-in';t.drawImage(job.mask,0,0);t.globalCompositeOperation='source-over';const o=job.out.getContext('2d');o.clearRect(0,0,1024,512);o.globalAlpha=.84+wet*.16;o.drawImage(job.temp,0,0);o.globalAlpha=1;job.texture.needsUpdate=true}
  async fromFile(file){if(file.type.startsWith('video/')){const v=document.createElement('video');v.muted=true;v.loop=true;v.playsInline=true;v.preload='auto';v.src=URL.createObjectURL(file);await new Promise((res,rej)=>{v.onloadeddata=res;v.onerror=rej});const c=mkCanvas();drawFit(c.getContext('2d'),v,1024,512,'contain');return this.create({name:file.name,type:'video',media:v,source:c})}const img=new Image();img.src=URL.createObjectURL(file);await img.decode();const c=mkCanvas();drawFit(c.getContext('2d'),img,1024,512,'contain');URL.revokeObjectURL(img.src);return this.create({name:file.name,type:'image',source:c})}
}
