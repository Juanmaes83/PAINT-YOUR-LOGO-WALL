import './style.css';
import './v21.css';
import './v22.css';
import './v23.css';
import {bootV23} from './v23-runtime.js';

// V3 is cloned from the stable V2.3 runtime, but it must never share V2.3 browser state.
const LEGACY_SETTINGS_KEY='paint-your-logo-wall-v23-settings';
const V3_SETTINGS_KEY='paint-your-logo-wall-v3-settings';
const storageGet=Storage.prototype.getItem;
const storageSet=Storage.prototype.setItem;
const storageRemove=Storage.prototype.removeItem;
Storage.prototype.getItem=function(key){return storageGet.call(this,key===LEGACY_SETTINGS_KEY?V3_SETTINGS_KEY:key)};
Storage.prototype.setItem=function(key,value){return storageSet.call(this,key===LEGACY_SETTINGS_KEY?V3_SETTINGS_KEY:key,value)};
Storage.prototype.removeItem=function(key){return storageRemove.call(this,key===LEGACY_SETTINGS_KEY?V3_SETTINGS_KEY:key)};

// Keep the proven V2.3 runtime as the V3 baseline while presenting an isolated V3 product shell.
document.title='Paint Your Logo Wall — V3';
const stageShell=document.querySelector('#stage-shell');
if(stageShell)stageShell.setAttribute('aria-label','Paint Your Logo Wall V3');
const topVersion=document.querySelector('.stage-topline strong');
if(topVersion)topVersion.textContent='PAINT YOUR LOGO WALL / V3';
const panelEyebrow=document.querySelector('.panel-header .eyebrow');
if(panelEyebrow)panelEyebrow.textContent='CREATIVE ENGINES / V3';
const versionBadge=document.querySelector('.version-badge');
if(versionBadge)versionBadge.textContent='V3';
const loading=document.querySelector('#loading');
if(loading)loading.textContent='Preparing Paint Your Logo Wall V3…';
const status=document.querySelector('#status');
if(status)status.textContent='V3 baseline · cloned from approved V2.3';

bootV23();
window.__PYLW_V3_BASELINE__={version:'3.0.0',source:'V2.3 stable runtime'};

const heroText=document.querySelector('#add-text-job-hero');
const panelText=document.querySelector('#add-text-job');
if(heroText&&panelText)heroText.addEventListener('click',()=>panelText.click());
