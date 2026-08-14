const wait=(target,event,timeout=8000)=>new Promise((resolve,reject)=>{let done=false;const ok=()=>{if(done)return;done=true;clearTimeout(timer);target.removeEventListener(event,ok);target.removeEventListener('error',bad);resolve()};const bad=()=>{if(done)return;done=true;clearTimeout(timer);reject(new Error(`Media failed while waiting for ${event}`))};const timer=setTimeout(()=>bad(),timeout);target.addEventListener(event,ok,{once:true});target.addEventListener('error',bad,{once:true})});

export const isVideoFile=file=>file?.type?.startsWith('video/')||/\.(mp4|webm|mov|m4v)$/i.test(file?.name||'');
export const isImageFile=file=>file?.type?.startsWith('image/')||/\.(png|jpe?g|webp|gif|svg)$/i.test(file?.name||'');

export async function prepareImage(file){
  const url=URL.createObjectURL(file);const img=new Image();img.decoding='async';img.src=url;
  try{await img.decode()}catch{await wait(img,'load')}
  return{type:'image',media:img,url,status:'ready',fileBlob:file,posterMedia:img,duration:0,width:img.naturalWidth,height:img.naturalHeight,cleanup(){URL.revokeObjectURL(url)}};
}

export async function prepareVideo(file){
  const url=URL.createObjectURL(file);const v=document.createElement('video');
  v.muted=true;v.defaultMuted=true;v.playsInline=true;v.preload='auto';v.loop=true;v.crossOrigin='anonymous';v.src=url;v.load();
  if(v.readyState<1)await wait(v,'loadedmetadata',12000);
  if(v.readyState<2){try{await wait(v,'loadeddata',12000)}catch{await wait(v,'canplay',12000)}}
  const poster=document.createElement('canvas');poster.width=1024;poster.height=512;
  const seek=Math.min(Math.max(.04,(v.duration||1)*.025),Math.max(.04,(v.duration||1)-.05));
  try{v.currentTime=seek;await wait(v,'seeked',5000)}catch{}
  const g=poster.getContext('2d');g.fillStyle='#111';g.fillRect(0,0,poster.width,poster.height);
  if(v.videoWidth&&v.videoHeight){const s=Math.min(poster.width/v.videoWidth,poster.height/v.videoHeight),w=v.videoWidth*s,h=v.videoHeight*s;g.drawImage(v,(poster.width-w)/2,(poster.height-h)/2,w,h)}
  v.pause();v.currentTime=0;
  return{type:'video',media:v,url,status:'ready',fileBlob:file,posterMedia:poster,duration:Number.isFinite(v.duration)?v.duration:0,width:v.videoWidth,height:v.videoHeight,activated:false,activationCount:0,playFailures:0,cleanup(){v.pause();URL.revokeObjectURL(url)}};
}

export async function prepareMedia(file){
  if(isVideoFile(file))return prepareVideo(file);
  if(isImageFile(file))return prepareImage(file);
  throw new Error(`Unsupported media: ${file?.name||'unknown file'}`);
}

export async function activateVideo(job,{restart=true}={}){
  if(job?.type!=='video'||!job.media)return false;
  if(job.mediaStatus==='error')return false;
  try{
    if(restart&&!job.activated)job.media.currentTime=0;
    job.activated=true;job.activationCount=(job.activationCount||0)+1;
    await job.media.play();job.mediaStatus='live';return true;
  }catch(error){job.playFailures=(job.playFailures||0)+1;job.mediaStatus='play-error';job.mediaError=String(error?.message||error);return false}
}

export function resetVideo(job){if(job?.type!=='video'||!job.media)return;job.media.pause();try{job.media.currentTime=0}catch{}job.activated=false;job.mediaStatus='ready'}
export function pauseVideo(job){if(job?.type==='video'&&job.media)job.media.pause()}
export function mediaSnapshot(job){return{type:job.type,status:job.mediaStatus||'ready',readyState:job.media?.readyState??4,currentTime:job.media?.currentTime||0,paused:job.media?.paused??true,activated:!!job.activated,activationCount:job.activationCount||0,playFailures:job.playFailures||0,name:job.name}}
