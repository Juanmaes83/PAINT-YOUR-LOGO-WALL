import './style.css';
import './v21.css';
import './v22.css';
import './v23.css';
import {bootV23} from './v23-runtime.js';
bootV23();
const heroText=document.querySelector('#add-text-job-hero');
const panelText=document.querySelector('#add-text-job');
if(heroText&&panelText)heroText.addEventListener('click',()=>panelText.click());
