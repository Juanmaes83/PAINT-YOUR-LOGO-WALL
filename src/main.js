import './style.css';
import './v21.css';
import './v22.css';
import './v23.css';
import './v3.css';
import {bootV23} from './v23-runtime.js';

// V3 remains browser-state isolated from the frozen V2.3 build.
const LEGACY_SETTINGS_KEY='paint-your-logo-wall-v23-settings';
const V3_SETTINGS_KEY='paint-your-logo-wall-v3-settings';
const storageGet=Storage.prototype.getItem;
const storageSet=Storage.prototype.setItem;
const storageRemove=Storage.prototype.removeItem;
Storage.prototype.getItem=function(key){return storageGet.call(this,key===LEGACY_SETTINGS_KEY?V3_SETTINGS_KEY:key)};
Storage.prototype.setItem=function(key,value){return storageSet.call(this,key===LEGACY_SETTINGS_KEY?V3_SETTINGS_KEY:key,value)};
Storage.prototype.removeItem=function(key){return storageRemove.call(this,key===LEGACY_SETTINGS_KEY?V3_SETTINGS_KEY:key)};

const V3_ENGINES=[
  ['grass','Grass / Organic','pixel-sampled blades'],
  ['particles','Particle Rebuild','color particles · assemble'],
  ['liquid','Liquid Distortion','flow bands · refraction'],
  ['pixel','Pixel / Voxel','blocks · extrusion'],
  ['glitch','Glitch / Signal','scanlines · RGB shifts']
];
const methodGrid=document.querySelector('#method-grid');
for(const [method,label,copy] of V3_ENGINES){
  if(methodGrid&&!methodGrid.querySelector(`[data-method="${method}"]`)){
    const button=document.createElement('button');button.type='button';button.dataset.method=method;button.className='engine-method';button.innerHTML=`<b>${label}</b><span>${copy}</span><em>V3 ENGINE</em>`;methodGrid.appendChild(button);
  }
}

document.title='Paint Your Logo Wall — V3 Creative Engines';
const stageShell=document.querySelector('#stage-shell');if(stageShell)stageShell.setAttribute('aria-label','Paint Your Logo Wall V3 Creative Engines');
const topVersion=document.querySelector('.stage-topline strong');if(topVersion)topVersion.textContent='PAINT YOUR LOGO WALL / V3';
const panelEyebrow=document.querySelector('.panel-header .eyebrow');if(panelEyebrow)panelEyebrow.textContent='CREATIVE ENGINES / V3';
const versionBadge=document.querySelector('.version-badge');if(versionBadge)versionBadge.textContent='V3';
const loading=document.querySelector('#loading');if(loading)loading.textContent='Preparing V3 media + effect engines…';
const techniqueHeading=[...document.querySelectorAll('.control-section h2')].find(h=>h.textContent.includes('04 · Technique'));if(techniqueHeading)techniqueHeading.textContent='04 · Technique / Effect Engine';
const processNote=document.querySelector('.process-note');if(processNote)processNote.insertAdjacentHTML('beforeend','<br><span class="v3-engine-note">V3 effect engines use the same sourceCanvas for image and live video frames.</span>');

bootV23();
window.__PYLW_V3_BASELINE__={version:'3.0.0',source:'V2.3 stable host',mediaPipeline:'unified-sourceCanvas',engines:V3_ENGINES.map(x=>x[0])};

function mirrorDebug(){if(window.__PYLW_V23__)window.__PYLW_V3__={...window.__PYLW_V23__,version:'3.0.0',effectEngines:V3_ENGINES.map(x=>x[0]),jobsDetail:(window.__PYLW_JOB_MANAGER__?.jobs||[]).map(j=>({id:j.id,name:j.name,type:j.type,method:j.method,mediaStatus:j.mediaStatus,effectFrames:j.effectFrames||0,sourceFrame:j.sourceFrame||0,lastEffect:j.lastEffect||null}))};requestAnimationFrame(mirrorDebug)}requestAnimationFrame(mirrorDebug);

const status=document.querySelector('#status');if(status)status.textContent='V3 READY · unified video pipeline + five creative effect engines';
const heroText=document.querySelector('#add-text-job-hero');const panelText=document.querySelector('#add-text-job');if(heroText&&panelText)heroText.addEventListener('click',()=>panelText.click());
