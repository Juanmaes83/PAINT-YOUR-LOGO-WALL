import {PIXEL_DONOR_REPOSITORY,PIXEL_DONOR_REF,PIXEL_DONOR_PATH,PIXEL_DONOR_CONTROLLER_BLOB,PIXEL_DONOR_OVERLAY_BLOB,PIXEL_DEMO1,renderPixelTransitionOriginalCore} from '../donors/pixel/pixel-transition-original-core.js';

export const PIXEL_ADAPTER_INFO=Object.freeze({
 id:'pixel',
 label:'PixelTransition — original demo1 grid',
 donorRepository:PIXEL_DONOR_REPOSITORY,
 donorRef:PIXEL_DONOR_REF,
 donorPath:PIXEL_DONOR_PATH,
 donorControllerBlob:PIXEL_DONOR_CONTROLLER_BLOB,
 donorOverlayBlob:PIXEL_DONOR_OVERLAY_BLOB,
 algorithm:'source-faithful-canvas-adaptation',
 rows:PIXEL_DEMO1.rows,
 columns:PIXEL_DEMO1.columns,
 duration:PIXEL_DEMO1.duration,
 supportsImage:true,
 supportsVideo:true,
 true3DVoxel:false
});

export function renderPixelAdapter(out,source,{progress=1,time=0,options={}}={}){
 const live=!!options.live;
 // Story creation uses its native reveal progress. Edit/live final state remains fully assembled,
 // while current video pixels continue flowing through the same 8x14 source-cell grid.
 const p=live?1:progress;
 renderPixelTransitionOriginalCore(out,source,{progress:p,phase:options.pixelPhase||'show',options:{rows:Number(options.pixelRows??PIXEL_DEMO1.rows),columns:Number(options.pixelColumns??PIXEL_DEMO1.columns),duration:Number(options.pixelDuration??PIXEL_DEMO1.duration)}});
 return true;
}

export function pixelAdapterSnapshot(){return{...PIXEL_ADAPTER_INFO,engine:'original-pixeltransition',live:true}}
