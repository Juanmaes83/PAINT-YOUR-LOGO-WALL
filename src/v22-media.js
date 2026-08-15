const wait=(target,event,timeout=12000)=>new Promise((resolve,reject)=>{let done=false;const finish=(ok,err)=>{if(done)return;done=true;clearTimeout(timer);target.removeEventListener(event,onOk);target.removeEventListener('error',onBad);ok?resolve():reject(err||new Error(`Media failed while waiting for ${event}`))};const onOk=()=>finish(true),onBad=()=>finish(false,new Error(`Media failed while waiting for ${event}`));const timer=setTimeout(onBad,timeout);target.addEventListener(event,onOk,{once:true});target.addEventListener('error',onBad,{once:true})});

export const isVideoFile=file=>file?.type?.startsWith('video/')||/\.(mp4|webm|mov|m4v)$/i.test(file?.name||'');
export const isImageFile=file=>file?.type?.startsWith('image/')||/\.(png|jpe?g|webp|gif|svg)$/i.test(file?.name||'');

export async function prepareImage(file){const url=URL.createObjectURL(file);const img=new Image();img.decoding='async';img.src=url;try{await img.decode()}catch{await wait(img,'load')}return{type:'image',media:img,url,status:'ready',fileBlob:file,posterMedia:img,duration:0,width:img.naturalWidth,height:img.naturalHeight,cleanup(){URL.revokeObjectURL(url)}}}

export async function prepareVideo(file){
 const url=URL.createObjectURL(file),v=document.createElement('video');v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='auto';v.loop=true;v.src=url;v.load();
 try{if(v.readyState<1)await wait(v,'loadedmetadata',15000);if(v.readyState<2){try{await wait(v,'loadeddata',15000)}catch{await wait(v,'canplay',15000)}}}catch(error){URL.revokeObjectURL(url);throw new Error(`Browser cannot decode ${file.name}. ${error.message}`)}
 if(!v.videoWidth||!v.videoHeight){URL.revokeObjectURL(url);throw new Error(`Video decoded without a usable frame: ${file.name}`)}
 const poster=document.createElement('canvas');poster.width=1024;poster.height=512;const seek=Math.min(Math.max(.04,(v.duration||1)*.025),Math.max(.04,(v.duration||1)-.05));try{v.currentTime=seek;await wait(v,'seeked',6000)}catch{}
 const g=poster.getContext('2d');g.fillStyle='#111';g.fillRect(0,0,poster.width,poster.height);const s=Math.min(poster.width/v.videoWidth,poster.height/v.videoHeight),w=v.videoWidth*s,h=v.videoHeight*s;g.drawImage(v,(poster.width-w)/2,(poster.height-h)/2,w,h);v.pause();try{v.currentTime=0}catch{}
 return{type:'video',media:v,url,status:'ready',fileBlob:file,posterMedia:poster,duration:Number.isFinite(v.duration)?v.duration:0,width:v.videoWidth,height:v.videoHeight,activated:false,previewing:false,activationCount:0,playFailures:0,cleanup(){v.pause();URL.revokeObjectURL(url)}};
}
export async function prepareMedia(file){if(isVideoFile(file))return prepareVideo(file);if(isImageFile(file))return prepareImage(file);throw new Error(`Unsupported media: ${file?.name||'unknown file'}`)}

async function safePlay(job,status){if(job?.type!=='video'||!job.media||job.mediaStatus==='error')return false;try{await job.media.play();job.mediaStatus=status;return true}catch(error){job.playFailures=(job.playFailures||0)+1;job.mediaStatus='play-error';job.mediaError=String(error?.message||error);return false}}
export async function startVideoPreview(job){if(job?.type!=='video'||!job.media)return false;job.previewing=true;job.activated=false;return safePlay(job,'preview')}
export function stopVideoPreview(job,{poster=true}={}){if(job?.type!=='video'||!job.media)return;job.previewing=false;job.media.pause();if(poster){try{job.media.currentTime=0}catch{}}if(!job.activated)job.mediaStatus='ready'}
export async function activateVideo(job,{restart=true}={}){if(job?.type!=='video'||!job.media||job.mediaStatus==='error')return false;job.previewing=false;if(restart&&!job.activated){try{job.media.currentTime=0}catch{}}job.activated=true;job.activationCount=(job.activationCount||0)+1;return safePlay(job,'live')}
export function resetVideo(job){if(job?.type!=='video'||!job.media)return;job.media.pause();try{job.media.currentTime=0}catch{}job.activated=false;job.previewing=false;job.mediaStatus='ready'}
export function pauseVideo(job){if(job?.type==='video'&&job.media)job.media.pause()}
export function mediaSnapshot(job){return{type:job.type,status:job.mediaStatus||'ready',readyState:job.media?.readyState??4,currentTime:job.media?.currentTime||0,paused:job.media?.paused??true,activated:!!job.activated,previewing:!!job.previewing,activationCount:job.activationCount||0,playFailures:job.playFailures||0,name:job.name,error:job.mediaError||null,width:job.media?.videoWidth||job.media?.naturalWidth||0,height:job.media?.videoHeight||job.media?.naturalHeight||0}}
