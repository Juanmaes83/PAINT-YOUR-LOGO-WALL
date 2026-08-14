import './style.css';
import './v21.css';
import './v22.css';
import {bootV22} from './v22-runtime.js';
bootV22();
const duration=document.querySelector('#job-duration');
if(duration)duration.max='14';
