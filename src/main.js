import './style.css';
import './v21.css';
import './v22.css';
import './v23.css';
import './v3.css';
import {bootV23} from './v23-runtime.js';

const LEGACY_SETTINGS_KEY='paint-your-logo-wall-v23-settings',V3_SETTINGS_KEY='paint-your-logo-wall-v3-effects-v2-settings';
const storageGet=Storage.prototype.getItem,storageSet=Storage.prototype.setItem,storageRemove=Storage.prototype.removeItem;
Storage.prototype.getItem=function(key){return storageGet.call(this,key===LEGACY_SETTINGS_KEY?V3_SETTINGS_KEY:key)};
Storage.prototype.setItem=function(key,value){return storageSet.call(this,key===LEGACY_SETTINGS_KEY?V3_SETTINGS_KEY:key,value)};
Storage.prototype.removeItem=function(key){return storageRemove.call(this,key===LEGACY_SETTINGS_KEY?V3_SETTINGS_KEY:key)};

const V3_ENGINES=[
 ['grass','Grass / Organic','Escaparates donor · pixel sampled blades'],
 ['particles','Particle Rebuild','Escaparates donor · gather / rebuild'],
 ['liquid','Liquid Distortion','LiquidDistort donor · refract / swirl / ripple'],
 ['pixel','Pixel / Voxel','PixelTransition donor · reconstruction'],
 ['glitch','Glitch / Signal','signal / scanline / channel shift'],
 ['shapeMatrix','Shape Matrix / Dither','Dither donor · luminance-driven shape reconstruction'],
 ['energyShield','Energy Shield / Hex','Force Shield donor · hex materialization / scan glow'],
 ['hologram','Holographic Volume','Hologram donor · depth layers / interference'],
 ['smear','Temporal Smear / Trails','ImageDragging donor · slice drag / visual echoes'],
 ['audioReactive','Audio Reactive Distortion','AudioBasedImageDistortion donor · analyser-driven bands']
];
const methodGrid=document.querySelector('#method-grid');for(const[method,label,copy]of V3_ENGINES){if(methodGrid&&!methodGrid.querySelector(`[data-method="${method}"]`)){const button=document.createElement('button');button.type='button';button.dataset.method=method;button.className='engine-method';button.innerHTML=`<b>${label}</b><span>${copy}</span><em>V2 EFFECT ENGINE</em>`;methodGrid.appendChild(button)}}

document.title='Paint Your Logo Wall — Effects V2';const stageShell=document.querySelector('#stage-shell');if(stageShell)stageShell.setAttribute('aria-label','Paint Your Logo Wall Effects V2');const topVersion=document.querySelector('.stage-topline strong');if(topVersion)topVersion.textContent='PAINT YOUR LOGO WALL / EFFECTS V2';const panelEyebrow=document.querySelector('.panel-header .eyebrow');if(panelEyebrow)panelEyebrow.textContent='EDIT + STORY / EFFECTS V2';const versionBadge=document.querySelector('.version-badge');if(versionBadge)versionBadge.textContent='V2';const loading=document.querySelector('#loading');if(loading)loading.textContent='Preparing Effects V2 · original + 5 spectacular engines…';const techniqueHeading=[...document.querySelectorAll('.control-section h2')].find(h=>h.textContent.includes('04 · Technique'));if(techniqueHeading)techniqueHeading.textContent='04 · Technique / Effect Engine';const processNote=document.querySelector('.process-note');if(processNote)processNote.insertAdjacentHTML('beforeend','<br><span class="v3-engine-note"><b>EFFECTS V2:</b> all previous engines preserved + Shape Matrix, Energy Shield, Holographic Volume, Temporal Smear and Audio Reactive.</span>');
bootV23();
window.__PYLW_V3_BASELINE__={version:'effects-v2',source:'frozen agent/logo-crew-v3-original-effects @ cdc14c2736ee497457da933d03a185c08c02b415',mediaPipeline:'sourceCanvas + edit preview + story activation',engines:V3_ENGINES.map(x=>x[0])};
function mirrorDebug(){if(window.__PYLW_V23__)window.__PYLW_V3__={...window.__PYLW_V23__,version:'effects-v2',effectEngines:V3_ENGINES.map(x=>x[0]),jobsDetail:(window.__PYLW_JOB_MANAGER__?.jobs||[]).map(j=>({id:j.id,name:j.name,type:j.type,method:j.method,mediaStatus:j.mediaStatus,activated:!!j.activated,previewing:!!j.previewing,effectFrames:j.effectFrames||0,sourceFrame:j.sourceFrame||0,progress:j.progress,lastEffect:j.lastEffect||null,x:j.x}))};requestAnimationFrame(mirrorDebug)}requestAnimationFrame(mirrorDebug);
const status=document.querySelector('#status');if(status)status.textContent='EFFECTS V2 READY · previous engines preserved + 5 new transformations';const heroText=document.querySelector('#add-text-job-hero'),panelText=document.querySelector('#add-text-job');if(heroText&&panelText)heroText.addEventListener('click',()=>panelText.click());
