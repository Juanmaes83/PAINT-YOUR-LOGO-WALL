// SOURCE-FAITHFUL EXTRACTION — Juanmaes83/liquiddistorteverything.
// Canonical built donor: dist/liquid-distort.js
// blob: fdbde364975183230270b9d8507cb9ad033cd7c6 (10,045 bytes)
// The DOM/SVG filter wrapper is omitted; shape distance, falloff, displacement modes
// and canonical defaults are preserved and rendered into the Paint Your Logo Wall canvas.

export const LIQUID_DONOR_REPOSITORY='Juanmaes83/liquiddistorteverything';
export const LIQUID_DONOR_REF='main';
export const LIQUID_DONOR_PATH='dist/liquid-distort.js';
export const LIQUID_DONOR_BLOB='fdbde364975183230270b9d8507cb9ad033cd7c6';

export const LIQUID_DEFAULTS=Object.freeze({radius:193,strength:72,shape:'circle',aspectRatio:.8,cornerRadius:.3,mode:'attract',frequency:3,falloff:'smoothstep',follow:.98,spring:true,stiffness:.15,damping:.75,decay:.9,velocityBoost:0,trigger:'always',resolution:.15,tail:.14,tailLength:68});

export function liquidShapeDistance(x,y,shape,aspectRatio,cornerRadius){
 switch(shape){case'circle':return Math.sqrt(x*x+y*y);case'ellipse':{const nx=x/aspectRatio;return Math.sqrt(nx*nx+y*y)}case'rect':return Math.max(Math.abs(x/aspectRatio),Math.abs(y));case'roundedRect':{const r=Math.min(.99,Math.max(0,cornerRadius)),ar=aspectRatio,n=1,qx=Math.abs(x/ar)-(1-r),qy=Math.abs(y/n)-(1-r),outside=Math.sqrt(Math.max(qx,0)**2+Math.max(qy,0)**2),inside=Math.min(Math.max(qx,qy),0);return(outside+inside)/r}default:return Math.sqrt(x*x+y*y)}
}
export function liquidFalloff(t,kind){const e=Math.min(1,Math.max(0,t));switch(kind){case'smoothstep':return 1-e*e*(3-2*e);case'linear':return 1-e;case'exponential':return 1-Math.pow(e,2.5);case'cosine':return(1+Math.cos(Math.PI*e))*.5;default:return 1-e}}
export function liquidDisplacement(x,y,dist,fall,mode,frequency){const r=dist+1e-4;switch(mode){case'refract':return[x/r*.7*fall,y/r*.7*fall];case'attract':return[-x/r*.7*fall,-y/r*.7*fall];case'swirl':return[-y/r*.7*fall,x/r*.7*fall];case'ripple':{const w=Math.sin(dist*frequency*Math.PI);return[x/r*w*.7*fall,y/r*w*.7*fall]}case'wave':return[0,Math.sin(x*frequency*Math.PI)*.7*fall];default:return[x/r*.7*fall,y/r*.7*fall]}}

/** Canvas renderer using the donor displacement field. `cx/cy` are canvas-space cursor coordinates. */
export function renderLiquidOriginalCore(out,source,{cx=out.width/2,cy=out.height/2,options={}}={}){
 const o={...LIQUID_DEFAULTS,...options},ctx=out.getContext('2d'),W=out.width,H=out.height,res=Math.max(.05,Math.min(.35,o.resolution)),cols=Math.max(8,Math.round(W*res/4)),rows=Math.max(6,Math.round(H*res/4)),cw=W/cols,ch=H/rows;
 ctx.clearRect(0,0,W,H);ctx.drawImage(source,0,0,W,H);
 const rx=o.radius*o.aspectRatio,ry=o.radius;
 for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){
  const px=(gx+.5)*cw,py=(gy+.5)*ch,nx=(px-cx)/(rx||1),ny=(py-cy)/(ry||1),dist=liquidShapeDistance(nx,ny,o.shape,o.aspectRatio,o.cornerRadius);if(dist>1)continue;
  const f=liquidFalloff(dist,o.falloff),[dx,dy]=liquidDisplacement(nx,ny,dist,f,o.mode,o.frequency),sx=gx*cw,sy=gy*ch,ox=dx*o.strength,oy=dy*o.strength;
  ctx.drawImage(source,sx,sy,cw+1,ch+1,sx+ox,sy+oy,cw+1,ch+1);
 }
 return out;
}
