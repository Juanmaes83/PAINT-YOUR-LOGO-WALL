// SOURCE-FAITHFUL EXTRACTION — Juanmaes83/escaparates-pro
// labs/source-experiences/glitchify-image-pro/source-script.js
// canonical blob bfbfdd31060d04ff88c2b05dc9ae82162a12c192 (85,474 bytes)
// This core preserves the donor's default visible chain exactly at the algorithm level:
// Color Shift (enabled) -> Displacement (enabled).
// Wave Deform, Pixel Sort and Data Corruption are donor capabilities but disabled by default.

export const GLITCH_DONOR_REPOSITORY='Juanmaes83/escaparates-pro';
export const GLITCH_DONOR_REF='master';
export const GLITCH_DONOR_PATH='labs/source-experiences/glitchify-image-pro/source-script.js';
export const GLITCH_DONOR_BLOB='bfbfdd31060d04ff88c2b05dc9ae82162a12c192';
export const GLITCH_DONOR_SIZE=85474;

export const GLITCH_DEFAULTS=Object.freeze({
 colorShift:Object.freeze({enableColorShift:true,useUniformShift:true,shiftAmount:Object.freeze({x:20,y:0}),redShift:Object.freeze({x:20,y:0}),greenShift:Object.freeze({x:0,y:0}),blueShift:Object.freeze({x:-20,y:0}),intensity:1}),
 waveDeform:Object.freeze({enableWaveDeform:false,direction:'horizontal',amplitude:10,frequency:.05,phase:0,useNoise:false,seed:0}),
 displacement:Object.freeze({enableDisplacement:true,mode:'horizontal',displacementIntensity:8,displacementSize:18,displacementFrequency:.5,seed:0}),
 pixelSort:Object.freeze({enablePixelSort:false,direction:'horizontal',blockSize:5,frequency:.5,sortType:'shuffle',seed:0}),
 dataCorruption:Object.freeze({enableDataCorruption:false,blockSize:32,corruptionAmount:.01,corruptionMode:'random',seed:0})
});

export function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

export function applyGlitchifyColorShift(inputImageData,output,params=GLITCH_DEFAULTS.colorShift){
 if(!inputImageData||!params.enableColorShift)return inputImageData;
 const width=inputImageData.width,height=inputImageData.height,src=inputImageData.data,dst=output.data,blend=params.intensity;
 const shiftR=params.useUniformShift?params.shiftAmount:params.redShift,shiftG=params.useUniformShift?{x:0,y:0}:params.greenShift,shiftB=params.useUniformShift?{x:-params.shiftAmount.x,y:-params.shiftAmount.y}:params.blueShift;
 const rR={x:Math.round(shiftR.x),y:Math.round(shiftR.y)},rG={x:Math.round(shiftG.x),y:Math.round(shiftG.y)},rB={x:Math.round(shiftB.x),y:Math.round(shiftB.y)},maxX=width-1,maxY=height-1;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)<<2,xR=x+rR.x,yR=y+rR.y,xG=x+rG.x,yG=y+rG.y,xB=x+rB.x,yB=y+rB.y;
  const r=xR>=0&&xR<=maxX&&yR>=0&&yR<=maxY?src[((yR*width+xR)<<2)]:0;
  const g=xG>=0&&xG<=maxX&&yG>=0&&yG<=maxY?src[((yG*width+xG)<<2)+1]:0;
  const b=xB>=0&&xB<=maxX&&yB>=0&&yB<=maxY?src[((yB*width+xB)<<2)+2]:0;
  const rOrig=src[i],gOrig=src[i+1],bOrig=src[i+2],a=src[i+3];
  dst[i]=(blend*r+(1-blend)*rOrig+.5)|0;dst[i+1]=(blend*g+(1-blend)*gOrig+.5)|0;dst[i+2]=(blend*b+(1-blend)*bOrig+.5)|0;dst[i+3]=a;
 }
 return output;
}

export function applyGlitchifyDisplacement(inputImageData,output,params=GLITCH_DEFAULTS.displacement){
 if(!inputImageData||!params.enableDisplacement)return inputImageData;
 const width=inputImageData.width,height=inputImageData.height,src=inputImageData.data,dst=output.data,{mode,displacementIntensity,displacementSize,displacementFrequency,seed=0}=params,rng=mulberry32(seed),maxShift=(mode==='horizontal'?width:height)*(displacementIntensity/100);
 if(mode==='horizontal'){
  for(let y=0;y<height;y+=displacementSize){const apply=rng()<displacementFrequency,amount=apply?Math.floor(rng()*maxShift)*(rng()>.5?1:-1):0,endY=Math.min(y+displacementSize,height);for(let dy=y;dy<endY;dy++)for(let x=0;x<width;x++){const newX=(x+amount+width)%width,srcIdx=((dy*width)+newX)<<2,dstIdx=((dy*width)+x)<<2;dst[dstIdx]=src[srcIdx];dst[dstIdx|1]=src[srcIdx|1];dst[dstIdx|2]=src[srcIdx|2];dst[dstIdx|3]=src[srcIdx|3]}}
 }else{
  for(let x=0;x<width;x+=displacementSize){const apply=rng()<displacementFrequency;let amount=apply?Math.floor(rng()*maxShift)*(rng()>.5?1:-1):0;amount=Math.max(-height,Math.min(height,amount));const endX=Math.min(x+displacementSize,width);for(let dx=x;dx<endX;dx++)for(let y=0;y<height;y++){const newY=((y+amount)%height+height)%height,srcIdx=(newY*width+dx)<<2,dstIdx=(y*width+dx)<<2;dst[dstIdx]=src[srcIdx];dst[dstIdx|1]=src[srcIdx|1];dst[dstIdx|2]=src[srcIdx|2];dst[dstIdx|3]=src[srcIdx|3]}}
 }
 return output;
}

export function processGlitchifyDefault(inputImageData,{colorShift=GLITCH_DEFAULTS.colorShift,displacement=GLITCH_DEFAULTS.displacement}={}){
 const a=new ImageData(inputImageData.width,inputImageData.height),b=new ImageData(inputImageData.width,inputImageData.height);
 const shifted=applyGlitchifyColorShift(inputImageData,a,colorShift);return applyGlitchifyDisplacement(shifted,b,displacement);
}

export function renderGlitchifyOriginalCore(out,source,{workWidth=out.width,workHeight=out.height,progress=1}={}){
 const work=document.createElement('canvas');work.width=workWidth;work.height=workHeight;const wg=work.getContext('2d',{willReadFrequently:true});wg.clearRect(0,0,workWidth,workHeight);wg.drawImage(source,0,0,workWidth,workHeight);const input=wg.getImageData(0,0,workWidth,workHeight),result=processGlitchifyDefault(input);wg.putImageData(result,0,0);
 const g=out.getContext('2d');g.clearRect(0,0,out.width,out.height);const p=Math.max(0,Math.min(1,progress));if(p<=0)return out;g.save();g.beginPath();g.rect(0,0,out.width*p,out.height);g.clip();g.drawImage(work,0,0,out.width,out.height);g.restore();return out;
}
