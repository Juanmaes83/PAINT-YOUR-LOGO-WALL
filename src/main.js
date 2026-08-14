import './style.css';
import './v21.css';
import './v22.css';
import './v23.css';
import {bootV23} from './v23-runtime.js';
bootV23();
queueMicrotask(()=>{const buttons=[...document.querySelectorAll('#add-text-job')];if(buttons.length>1)buttons.slice(1).forEach(button=>button.addEventListener('click',()=>buttons[0].click()))});
