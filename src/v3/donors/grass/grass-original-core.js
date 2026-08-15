// SOURCE-FAITHFUL EXTRACTION — DO NOT "IMPROVE" THE VISUAL ALGORITHM HERE.
// Canonical donor:
// Juanmaes83/escaparates-pro@master
// labs/source-experiences/grass-image-processing-pro/source-script.js
// donor blob: 91b6441f8cb31f6ff79f14a8cc0d4ab375c929a1
//
// The donor was a DOM/Tweakpane application. This file extracts its rendering core
// without changing palette, quantisation, PRNG, pixel mapping, blade geometry,
// colour variation, alpha, rotation or length formulas. Only I/O is adapted so
// Paint Your Logo Wall can supply a canvas instead of a file input.

export const GRASS_DONOR_BLOB='91b6441f8cb31f6ff79f14a8cc0d4ab375c929a1';
export const GRASS_DONOR_PATH='labs/source-experiences/grass-image-processing-pro/source-script.js';

export const grassPalette=[
 [255,255,255],[225,240,210],[200,230,180],[180,220,160],[165,210,140],[150,200,120],[135,190,105],[120,180,90],
 [105,170,75],[90,160,65],[75,145,55],[65,130,50],[55,115,45],[48,100,40],[42,85,35],[37,75,31],[32,65,26],
 [28,55,22],[24,45,19],[21,38,16],[18,32,13],[15,26,10],[12,20,8],[9,15,6],[5,7,3],[3,5,2],[2,3,1],[0,0,0]
];

function mulberry32(seed){
 return function(){
  seed=(seed+0x6d2b79f5)>>>0;
  let t=Math.imul(seed^(seed>>>15),1|seed);
  t=(t+Math.imul(t^(t>>>7),61|t))^t;
  return ((t^(t>>>14))>>>0)/4294967296;
 };
}

const QUANTIZE_SHIFT=4;
const QUANTIZE_MASK=0xf0;
const quantize=value=>(value&QUANTIZE_MASK)>>QUANTIZE_SHIFT;
const LUT=new Uint8Array(64*64*64);
const grassPaletteLength=grassPalette.length;

function findClosestGreenIndex(r,g,b){
 let closestIndex=0,minDiff=Infinity,color,diff;
 for(let i=0;i<grassPaletteLength;i++){
  color=grassPalette[i];
  diff=Math.abs(color[0]-r)+Math.abs(color[1]-g)+Math.abs(color[2]-b);
  closestIndex=diff<minDiff?((minDiff=diff),i):closestIndex;
 }
 return closestIndex;
}

function buildLUT(){
 for(let r=0;r<256;r+=16)for(let g=0;g<256;g+=16)for(let b=0;b<256;b+=16){
  const index=(quantize(r)<<12)|(quantize(g)<<6)|quantize(b);
  LUT[index]=findClosestGreenIndex(r,g,b);
 }
}
buildLUT();

function findClosestColor(red,green,blue){
 const index=(quantize(red)<<12)|(quantize(green)<<6)|quantize(blue);
 return grassPalette[LUT[index]];
}

function drawBladeOptimized(ctx,x,y,length,rotation,alpha,color){
 ctx.save();
 ctx.setTransform(1,0,0,1,x,y);
 ctx.rotate((rotation*Math.PI)/180);
 ctx.globalAlpha=alpha;
 ctx.strokeStyle=`rgb(${color[0]|0}, ${color[1]|0}, ${color[2]|0})`;
 ctx.lineWidth=1;
 ctx.beginPath();
 ctx.moveTo(0,0);
 ctx.lineTo(length,0);
 ctx.stroke();
 ctx.restore();
}

/**
 * Render the original Less Rain / Grass Image Processing visual algorithm.
 * `inputWidth`/`inputHeight` define the donor input resolution. The donor's
 * output is exactly 2× that size; it is then fitted into `out` by the adapter.
 */
export function renderGrassOriginalCore(out,source,{bladeDensity=5,inputWidth=512,inputHeight=256,seed=42}={}){
 const iw=Math.max(1,Math.round(inputWidth));
 const ih=Math.max(1,Math.round(inputHeight));
 const donorW=iw*2,donorH=ih*2;
 const input=document.createElement('canvas');
 input.width=iw;input.height=ih;
 const inputCtx=input.getContext('2d',{willReadFrequently:true});
 inputCtx.clearRect(0,0,iw,ih);
 inputCtx.drawImage(source,0,0,iw,ih);
 const imageData=inputCtx.getImageData(0,0,iw,ih);
 const data=new Uint8ClampedArray(imageData.data.buffer);

 const donor=document.createElement('canvas');
 donor.width=donorW;donor.height=donorH;
 const ctx=donor.getContext('2d');
 ctx.clearRect(0,0,donorW,donorH);

 const prng=mulberry32(seed);
 const finalColorBuffer=new Uint8ClampedArray(3);
 const imgDataSize=iw*ih*4;
 const stepX=iw/donorW;
 const stepY=ih/donorH;
 const maxIndex=(donorW*donorH)/2;

 function processPixel(index){
  if(index>=imgDataSize)return;
  const y=(index/donorW)|0;
  const x=index-y*donorW;
  const srcX=(x*stepX*2)|0;
  const srcY=(y*stepY*2)|0;
  const pixelIndex=(srcY*iw+srcX)*4;
  const red=data[pixelIndex],green=data[pixelIndex+1],blue=data[pixelIndex+2];
  const percent=((red*10+green*100+blue*100)/(6*255))|0;
  const baseColor=findClosestColor(red,green,blue);
  const randomIndex=prng();
  const randomX=(randomIndex-.5)*10;
  const randomY=(prng()-.5)*10;
  const drawX=x*2-percent*.2+10+randomX;
  const drawY=y*2+percent*.1+randomY;
  const rotation=randomIndex*50+percent*46*.5;
  const alpha=prng()*.5;
  for(let i=0;i<bladeDensity;i++){
   const randI=prng();
   const offsetX=(randI-.5)*5;
   const offsetY=(prng()-.5)*5;
   const baseLength=percent*.5;
   const extraRandomLength=prng()*75;
   const length=baseLength+extraRandomLength*(prng()>.5?1:.5);
   const colorVariation=prng()*30;
   finalColorBuffer[0]=Math.min(255,baseColor[0]+colorVariation)|0;
   finalColorBuffer[1]=Math.min(255,baseColor[1]+colorVariation)|0;
   finalColorBuffer[2]=Math.min(255,baseColor[2]+colorVariation)|0;
   drawBladeOptimized(ctx,drawX+offsetX,drawY+offsetY,length,rotation+(prng()-.5)*20,alpha,finalColorBuffer);
  }
 }

 // The original processes sequential indices in groups of four; the sequence
 // below is byte-for-byte equivalent in ordering while avoiding RAF coupling.
 for(let index=0;index<maxIndex;index+=4){
  processPixel(index);processPixel(index+1);processPixel(index+2);processPixel(index+3);
 }

 const g=out.getContext('2d');
 g.clearRect(0,0,out.width,out.height);
 g.drawImage(donor,0,0,out.width,out.height);
 return out;
}
