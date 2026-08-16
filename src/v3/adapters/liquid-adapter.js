import {LIQUID_DONOR_REPOSITORY,LIQUID_DONOR_REF,LIQUID_DONOR_PATH,LIQUID_DONOR_BLOB,LIQUID_DEFAULTS,renderLiquidOriginalCore} from '../donors/liquid/liquid-distort-original-core.js';

export const LIQUID_ADAPTER_INFO=Object.freeze({id:'liquid',label:'Liquid Distort — original library',donorRepository:LIQUID_DONOR_REPOSITORY,donorRef:LIQUID_DONOR_REF,donorPath:LIQUID_DONOR_PATH,donorBlob:LIQUID_DONOR_BLOB,algorithm:'source-faithful-extraction',defaults:LIQUID_DEFAULTS,supportsImage:true,supportsVideo:true});

export function renderLiquidAdapter(out,source,{progress=1,time=0,intensity=.3,edge=.45,options={}}={}){
 const p=Math.max(0,Math.min(1,progress));if(p<=0){out.getContext('2d').clearRect(0,0,out.width,out.height);return true}
 const W=out.width,H=out.height,cx=Number(options.liquidX??(W*(.5+Math.sin(time*.65)*.28))),cy=Number(options.liquidY??(H*(.5+Math.cos(time*.53)*.22)));
 const mode=options.liquidMode||LIQUID_DEFAULTS.mode,shape=options.liquidShape||LIQUID_DEFAULTS.shape,falloff=options.liquidFalloff||LIQUID_DEFAULTS.falloff;
 renderLiquidOriginalCore(out,source,{cx,cy,options:{...LIQUID_DEFAULTS,mode,shape,falloff,radius:Number(options.liquidRadius??(125+150*p)),strength:Number(options.liquidStrength??(42+intensity*70)),frequency:Number(options.liquidFrequency??(2.5+edge*4)),resolution:Number(options.liquidResolution??.15)}});
 return true;
}
export function liquidAdapterSnapshot(){return{...LIQUID_ADAPTER_INFO,engine:'original-liquiddistorteverything',live:true}}
