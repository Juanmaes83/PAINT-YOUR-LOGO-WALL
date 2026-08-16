// SOURCE-FAITHFUL CANVAS ADAPTATION — Juanmaes83/PixelTransition demo1.
// Canonical demo controller: js/demo1/index.js
// blob deaf8c491a3cbbe325128a711a18f15af58bfb4a (4,538 bytes)
// Canonical cell engine: js/demo1/overlay.js
// blob 1f41e22d989e4bc1774a69a93b4f0fe94815e0ee (3,894 bytes)
// Original behavior preserved: 8x14 grid, vertical scaleY cells, opacity,
// transform origin and row-based stagger. DOM/GSAP execution is mapped to canvas pixels.

export const PIXEL_DONOR_REPOSITORY='Juanmaes83/PixelTransition';
export const PIXEL_DONOR_REF='main';
export const PIXEL_DONOR_PATH='js/demo1/index.js + js/demo1/overlay.js';
export const PIXEL_DONOR_CONTROLLER_BLOB='deaf8c491a3cbbe325128a711a18f15af58bfb4a';
export const PIXEL_DONOR_OVERLAY_BLOB='1f41e22d989e4bc1774a69a93b4f0fe94815e0ee';
export const PIXEL_DEMO1=Object.freeze({rows:8,columns:14,duration:.4,staggerEach:.03,randomRows:5,showOrigin:'50% 0%',hideOrigin:'50% 100%',showEase:'power3.inOut',hideEase:'power2'});

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
function easePower3InOut(t){t=clamp(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function rand01(n){let x=(n+1)*0x9e3779b1;x^=x>>>16;x=Math.imul(x,0x21f0aaad);x^=x>>>15;x=Math.imul(x,0x735a2d97);x^=x>>>15;return(x>>>0)/4294967296}

export function createPixelTransitionCells(options={}){
 const rows=options.rows??PIXEL_DEMO1.rows,columns=options.columns??PIXEL_DEMO1.columns,cells=[];
 for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
  const index=row*columns+column;
  // demo1 stagger: .03 * (row + gsap.utils.random(0,5)). Seeded equivalent keeps its topology reproducible.
  cells.push({row,column,index,delay:PIXEL_DEMO1.staggerEach*(row+rand01(index*31+17)*PIXEL_DEMO1.randomRows)});
 }
 return{rows,columns,cells};
}

export function renderPixelTransitionOriginalCore(out,source,{progress=1,phase='show',options={}}={}){
 const ctx=out.getContext('2d'),W=out.width,H=out.height,grid=createPixelTransitionCells(options),cw=W/grid.columns,ch=H/grid.rows,p=clamp(progress),duration=Number(options.duration??PIXEL_DEMO1.duration),maxDelay=Math.max(...grid.cells.map(c=>c.delay)),timeline=duration+maxDelay,t=p*timeline;
 ctx.clearRect(0,0,W,H);
 for(const cell of grid.cells){
  const local=clamp((t-cell.delay)/duration),scaled=easePower3InOut(local),scaleY=phase==='hide'?1-scaled:scaled,opacity=scaleY;if(opacity<=.001)continue;
  const x=cell.column*cw,y=cell.row*ch,h=Math.max(.5,ch*scaleY),sy=phase==='hide'?y:y,dy=phase==='hide'?y:y; // origins resolved below
  const origin=phase==='hide'?'bottom':'top';const destY=origin==='bottom'?y+ch-h:y;
  ctx.save();ctx.globalAlpha=opacity;
  // Fill the animated cell with exactly the corresponding source-image region.
  ctx.drawImage(source,x,y,cw+1,ch+1,x,destY,cw+1,h);
  ctx.restore();
 }
 return out;
}
