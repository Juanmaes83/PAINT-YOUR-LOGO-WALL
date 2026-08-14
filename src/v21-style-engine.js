const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const seeded=n=>{const x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)};

export const STYLE_PROFILES={
  brush:{label:'Brush Painter',tool:'brush',crew:'aya',reveal:'horizontal',narrative:['mixing paint','loading brush','laying base strokes','working edges','finishing details','stepping back'],accent:'#d9a25a'},
  roller:{label:'Mural Roller',tool:'roller',crew:'aya',reveal:'vertical',narrative:['loading roller','first coverage','cross rolling','edge coverage','final pass','inspection'],accent:'#d2a465'},
  spray:{label:'Graffiti / Spray',tool:'spray',crew:'foxie',reveal:'particles',narrative:['shaking can','testing nozzle','spraying outline','filling body','adding drips','signature check'],accent:'#ff7a48'},
  charcoal:{label:'Charcoal Artist',tool:'charcoal',crew:'mimo',reveal:'stroke',narrative:['blocking gesture','finding contours','building values','smudging shadows','lifting highlights','dusting surface'],accent:'#c7c0b5'},
  ink:{label:'Manga / Ink',tool:'pen',crew:'lumi',reveal:'contour',narrative:['rough sketch','clean contour','solid blacks','screentones','speed lines','final ink check'],accent:'#f0e9dc'},
  digital:{label:'Digital Designer',tool:'stylus',crew:'byte',reveal:'blocks',narrative:['building grid','placing vectors','aligning shapes','masking layers','rendering motion','activating artwork'],accent:'#74c8ff'},
  expressionist:{label:'Expressionist',tool:'widebrush',crew:'mimo',reveal:'radial',narrative:['choosing color','first strike','layering gestures','splattering paint','scraping accents','final burst'],accent:'#ff5d67'},
  hyperreal:{label:'Hyperrealist',tool:'detailbrush',crew:'noa',reveal:'center',narrative:['tonal block-in','soft modelling','color glazing','texture pass','micro details','final highlight'],accent:'#d9b894'}
};

function circle(g,x,y,r,a=1){g.globalAlpha=a;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()}
function line(g,x1,y1,x2,y2,w,a=1){g.globalAlpha=a;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}

// Spray behavior adapts the MIT dripping-spray donor concepts: central deposit,
// radial splatter, accumulation threshold and downward drips.
function sprayMask(g,p,size,edge,W,H){
  const steps=Math.floor(22+p*150);g.fillStyle='#fff';g.strokeStyle='#fff';
  for(let i=0;i<steps;i++){
    const t=i/Math.max(1,steps-1),x=70+t*(W-140),y=H*.22+Math.sin(t*14)*H*.22+Math.sin(t*4.2)*H*.12;
    circle(g,x,y,size*.42,.84);
    const splat=Math.round(4+edge*18);
    for(let s=0;s<splat;s++){
      const a=seeded(i*97+s*11)*Math.PI*2,r=seeded(i*41+s*13)*(18+edge*70),rr=Math.max(1,size*.13*(1-r/(90+edge*30)));
      circle(g,x+Math.cos(a)*r,y+Math.sin(a)*r,rr,.35+seeded(s+i)*.5);
    }
    if(i%17===0 && t<p*.96){const len=(20+edge*125)*seeded(i+3);line(g,x,y,x+seeded(i+9)*5-2.5,Math.min(H-12,y+len),Math.max(2,size*.08),.65)}
  }
}

function brushMask(g,p,size,edge,W,H){
  const rows=8,full=p*rows;g.strokeStyle='#fff';g.lineCap='round';
  for(let r=0;r<Math.ceil(full);r++){
    const f=clamp(full-r),rev=r%2===1,y=(r+.5)/rows*H;
    for(let b=-2;b<=2;b++){
      const jitter=(seeded(r*31+b*7)-.5)*edge*20;
      line(g,rev?W-60:60,y+b*size*.12+jitter,rev?60:60+(W-120)*f,y+b*size*.12-jitter,size*.25,.72+seeded(r+b)*.25)
    }
  }
}
function rollerMask(g,p,size,edge,W,H){const cols=6,full=p*cols;g.fillStyle='#fff';for(let c=0;c<Math.ceil(full);c++){const f=clamp(full-c),x=(c+.5)/cols*W,w=W/cols*.76;g.globalAlpha=.9;g.fillRect(x-w/2,H*(1-f),w,H*f);for(let n=0;n<12;n++){g.globalAlpha=.15+edge*.2;g.fillRect(x-w/2+seeded(n+c)*w,H*(1-f),1+seeded(n*4)*3,H*f)}}}
function charcoalMask(g,p,size,edge,W,H){g.strokeStyle='#fff';g.fillStyle='#fff';const strokes=Math.floor(8+p*110);for(let i=0;i<strokes;i++){const a=seeded(i*7),x=40+a*(W-80),y=35+seeded(i*13)*(H-70),len=20+seeded(i*19)*130;line(g,x,y,Math.min(W-25,x+len),y+(seeded(i*23)-.5)*38,2+seeded(i*29)*Math.max(3,size*.18),.25+seeded(i)*.6);for(let d=0;d<4;d++)circle(g,x+(seeded(i+d*9)-.5)*35,y+(seeded(i+d*17)-.5)*35,1+seeded(i+d)*3,.15+.2*edge)}}
function mangaMask(g,p,size,edge,W,H){g.strokeStyle='#fff';g.fillStyle='#fff';const pass=p*5;if(pass>0){const f=clamp(pass);for(let i=0;i<22;i++){const y=35+i*(H-70)/21;line(g,40,y,40+(W-80)*f,y+Math.sin(i)*8,2.2,1)}}if(pass>1){const f=clamp(pass-1);for(let i=0;i<16;i++){const x=55+i*(W-110)/15;line(g,x,40,x,H*f,5,.7)}}if(pass>2){const f=clamp(pass-2);for(let i=0;i<190*f;i++){const x=seeded(i*5)*W,y=seeded(i*17)*H;circle(g,x,y,1.2,.5)}}if(pass>3){const f=clamp(pass-3);for(let i=0;i<28*f;i++){const y=(i/28)*H;line(g,W*.5,H*.5,W,y,1,.4)}}if(pass>4){g.globalAlpha=clamp(pass-4)*.45;g.fillRect(0,0,W,H)}}
function digitalMask(g,p,size,edge,W,H){g.fillStyle='#fff';const grid=12,amount=Math.floor(p*grid*6);for(let i=0;i<amount;i++){const x=(i%grid)*W/grid,y=Math.floor(i/grid)*H/6;g.globalAlpha=.75+.2*seeded(i);g.fillRect(x+2,y+2,W/grid-4,H/6-4)}g.strokeStyle='#fff';for(let i=0;i<Math.floor(p*18);i++){const x=seeded(i*5)*W,y=seeded(i*11)*H;line(g,W/2,H/2,x,y,1,.25)}}
function expressionistMask(g,p,size,edge,W,H){g.fillStyle='#fff';g.strokeStyle='#fff';const strokes=Math.floor(4+p*34);for(let i=0;i<strokes;i++){const x=seeded(i*3)*W,y=seeded(i*7)*H,a=seeded(i*13)*Math.PI*2,l=80+seeded(i*17)*250;line(g,x,y,x+Math.cos(a)*l,y+Math.sin(a)*l,size*(.3+seeded(i)*.55),.55+.35*seeded(i));for(let s=0;s<8;s++)circle(g,x+(seeded(i*31+s)-.5)*150,y+(seeded(i*47+s)-.5)*90,2+seeded(i+s)*7,.35)}}
function hyperrealMask(g,p,size,edge,W,H){g.fillStyle='#fff';const cx=W/2,cy=H/2,max=Math.hypot(W,H)*.55,r=max*clamp(p*.85);g.globalAlpha=.82;circle(g,cx,cy,r,1);const details=Math.floor(clamp((p-.55)/.45)*180);for(let i=0;i<details;i++){const a=seeded(i*7)*Math.PI*2,rr=Math.sqrt(seeded(i*13))*max;circle(g,cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,2+seeded(i)*7,.3+.5*seeded(i*19))}}

export function drawTechniqueMask(canvas,{progress=0,method='brush',size=42,edge=.34}={}){
  const g=canvas.getContext('2d'),W=canvas.width,H=canvas.height,p=clamp(progress);g.clearRect(0,0,W,H);g.save();
  ({brush:brushMask,roller:rollerMask,spray:sprayMask,charcoal:charcoalMask,ink:mangaMask,digital:digitalMask,expressionist:expressionistMask,hyperreal:hyperrealMask}[method]||brushMask)(g,p,size,edge,W,H);g.restore();g.globalAlpha=1;
}

export function narrativeBeat(method,creationProgress){const a=STYLE_PROFILES[method]?.narrative||STYLE_PROFILES.brush.narrative;return a[Math.min(a.length-1,Math.floor(clamp(creationProgress)*a.length))]}
export function toolPoint(method,p,W=1024,H=512){p=clamp(p);if(method==='spray')return{x:70+p*(W-140),y:H*.22+Math.sin(p*14)*H*.22+Math.sin(p*4.2)*H*.12};if(method==='ink')return{x:40+p*(W-80),y:35+((Math.floor(p*22)%22)/21)*(H-70)};if(method==='digital')return{x:(Math.floor(p*72)%12+.5)*W/12,y:(Math.floor(p*72/12)+.5)*H/6};if(method==='hyperreal')return{x:W/2+Math.cos(p*28)*p*W*.36,y:H/2+Math.sin(p*28)*p*H*.36};if(method==='charcoal'||method==='expressionist')return{x:seeded(Math.floor(p*100)*7)*W,y:seeded(Math.floor(p*100)*13)*H};return{x:60+p*(W-120),y:H*(.18+.64*((Math.floor(p*8)%8)+.5)/8)}}
