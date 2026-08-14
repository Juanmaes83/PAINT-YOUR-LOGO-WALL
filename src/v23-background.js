import * as THREE from 'three';
const wait=(target,event,timeout=10000)=>new Promise((resolve,reject)=>{const done=()=>{clearTimeout(timer);resolve()};const fail=()=>{clearTimeout(timer);reject(new Error(`Background media failed: ${event}`))};const timer=setTimeout(fail,timeout);target.addEventListener(event,done,{once:true});target.addEventListener('error',fail,{once:true})});
export class BackgroundController{
  constructor(scene){this.scene=scene;this.texture=null;this.media=null;this.url=null;this.fileBlob=null;this.type='preset';this.name='';}
  disposeMedia(){if(this.media?.pause)this.media.pause();if(this.texture?.dispose)this.texture.dispose();if(this.url)URL.revokeObjectURL(this.url);this.texture=null;this.media=null;this.url=null;this.fileBlob=null;this.name='';}
  async setFile(file){this.disposeMedia();this.fileBlob=file;this.name=file.name||'custom background';this.url=URL.createObjectURL(file);if(file.type.startsWith('video/')){const v=document.createElement('video');v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.preload='auto';v.src=this.url;v.load();if(v.readyState<2)await wait(v,'loadeddata');await v.play().catch(()=>{});this.media=v;this.texture=new THREE.VideoTexture(v);this.type='video'}else{const img=new Image();img.decoding='async';img.src=this.url;try{await img.decode()}catch{await wait(img,'load')}this.media=img;this.texture=new THREE.Texture(img);this.texture.needsUpdate=true;this.type='image'}this.texture.colorSpace=THREE.SRGBColorSpace;this.scene.background=this.texture;this.scene.fog=null;return this.snapshot()}
  useCustom(){if(this.texture){this.scene.background=this.texture;this.scene.fog=null;return true}return false}
  clearToPreset(){this.disposeMedia();this.type='preset'}
  snapshot(){return{type:this.type,name:this.name,fileBlob:this.fileBlob||null}}
  async restore(snapshot){if(snapshot?.fileBlob)return this.setFile(snapshot.fileBlob);this.clearToPreset();return this.snapshot()}
}
