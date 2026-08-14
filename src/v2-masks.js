export const REVEALS=['horizontal','vertical','radial','contour','stroke','stencil','particles','blocks','center','edges'];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
export function drawRevealMask(canvas,{progress=0,reveal='horizontal',method='brush',size=42,edge=.34}={}){
  const p=clamp(progress),m=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
  m.clearRect(0,0,W,H);m.fillStyle='#fff';m.strokeStyle='#fff';m.lineCap=method==='roller'?'butt':'round';m.lineJoin='round';
  if(reveal==='horizontal'){
    const rows=method==='roller'?6:9,full=p*rows;m.lineWidth=size*(method==='roller'?3.5:2.2);
    for(let r=0;r<Math.ceil(full);r++){const f=clamp(full-r),rev=r%2,y=(r+.5)/rows*H,j=Math.sin((r+1)*12.73)*edge*15;m.beginPath();m.moveTo(rev?W-64:64,y+j);m.lineTo(lerp(rev?W-64:64,rev?64:W-64,f),y-j*.3);m.stroke()}
  }else if(reveal==='vertical')m.fillRect(0,0,W*p,H);
  else if(reveal==='radial'){m.beginPath();m.arc(W/2,H/2,Math.hypot(W/2,H/2)*p,0,Math.PI*2);m.fill()}
  else if(reveal==='center')m.fillRect(W/2-W/2*p,0,W*p,H);
  else if(reveal==='edges'){const w=W/2*p;m.fillRect(0,0,w,H);m.fillRect(W-w,0,w,H)}
  else if(reveal==='blocks'){const cols=12,rows=6,total=cols*rows,count=Math.floor(total*p);for(let k=0;k<count;k++){const n=(k*37)%total,x=(n%cols)*W/cols,y=Math.floor(n/cols)*H/rows;m.fillRect(x,y,W/cols+2,H/rows+2)}}
  else if(reveal==='particles'){const count=Math.floor(900*p);for(let i=0;i<count;i++){const x=(Math.sin(i*91.17)*.5+.5)*W,y=(Math.sin(i*47.31+2)*.5+.5)*H,r=6+(i%7)*2;m.beginPath();m.arc(x,y,r,0,Math.PI*2);m.fill()}}
  else if(reveal==='stencil'){const bands=10,full=p*bands;for(let i=0;i<Math.ceil(full);i++){const f=clamp(full-i);m.fillRect(i%2?0:W*(1-f),i*H/bands,W*f,H/bands+2)}}
  else if(reveal==='contour'){m.lineWidth=10+size*.3;const loops=8,full=p*loops;for(let i=0;i<Math.ceil(full);i++){const f=clamp(full-i),pad=30+i*28;m.strokeRect(pad,pad*.45,(W-pad*2)*f,H-pad*.9)}}
  else {m.lineWidth=size*1.25;const pts=80,count=Math.floor(pts*p);for(let k=0;k<5;k++){m.beginPath();for(let i=0;i<count;i++){const x=40+(i/(pts-1))*(W-80),y=H/2+Math.sin(i*.72+k)*H*.29*Math.cos(i*.19);i?m.lineTo(x,y):m.moveTo(x,y)}m.stroke()}}
}
