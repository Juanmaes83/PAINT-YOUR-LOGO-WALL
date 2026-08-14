const DB='paint-your-logo-wall-v22',STORE='projects',KEY='current';
function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function tx(mode,fn){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,mode),s=t.objectStore(STORE);let req;try{req=fn(s)}catch(e){db.close();reject(e);return}t.oncomplete=()=>{const value=req?.result;db.close();resolve(value)};t.onerror=()=>{db.close();reject(t.error)};t.onabort=()=>{db.close();reject(t.error)}})}
export async function saveProjectSnapshot(snapshot){await tx('readwrite',s=>s.put({...snapshot,savedAt:new Date().toISOString()},KEY));return true}
export async function loadProjectSnapshot(){return tx('readonly',s=>s.get(KEY))}
export async function clearProjectSnapshot(){await tx('readwrite',s=>s.delete(KEY));return true}
export function serializeJob(job){return{id:job.id,name:job.name,type:job.type,scale:job.scale,height:job.height,xOffset:job.xOffset,rotation:job.rotation,duration:job.duration,fit:job.fit,living:job.living,method:job.method,reveal:job.reveal,crew:job.crew||null,activationDelay:job.activationDelay??0.5,fileBlob:job.fileBlob||null}}
