import {STYLE_PROFILES as BASE_STYLE_PROFILES,drawTechniqueMask,narrativeBeat as baseNarrativeBeat,toolPoint as baseToolPoint} from './v21-style-engine.js';
import {V3_EFFECT_METHODS,effectToolPoint} from './v3-effect-engine.js';

const V3_PROFILES={
 grass:{label:'Grass / Organic',tool:'detailbrush',crew:'noa',reveal:'organic',narrative:['sampling source colors','planting first blades','growing color fields','building organic density','catching the light','living surface ready'],accent:'#7fc66a',engine:'grass'},
 particles:{label:'Particle Rebuild',tool:'stylus',crew:'byte',reveal:'particles',narrative:['sampling the artwork','seeding particles','pulling color into place','tightening the cloud','locking the silhouette','particle artwork live'],accent:'#75d7ff',engine:'particles'},
 liquid:{label:'Liquid Distortion',tool:'widebrush',crew:'mimo',reveal:'liquid',narrative:['wetting the surface','forming the distortion field','pushing the flow','folding the image','stabilising the refraction','liquid artwork live'],accent:'#70c9ff',engine:'liquid'},
 pixel:{label:'Pixel / Voxel',tool:'stylus',crew:'byte',reveal:'blocks',narrative:['sampling the grid','placing first voxels','building pixel structure','extruding the image','locking the mosaic','voxel artwork live'],accent:'#ffbe64',engine:'pixel'},
 glitch:{label:'Glitch / Signal',tool:'stylus',crew:'byte',reveal:'signal',narrative:['capturing the signal','breaking first scanlines','splitting channels','shifting data blocks','stabilising the interference','glitch artwork live'],accent:'#ff67bd',engine:'glitch'}
};
export const STYLE_PROFILES={...BASE_STYLE_PROFILES,...V3_PROFILES};
export {drawTechniqueMask};
export function narrativeBeat(method,p){const a=STYLE_PROFILES[method]?.narrative;if(!a)return baseNarrativeBeat(method,p);return a[Math.min(a.length-1,Math.floor(Math.max(0,Math.min(1,p))*a.length))]}
export function toolPoint(method,p,W=1024,H=512){return V3_EFFECT_METHODS.has(method)?effectToolPoint(method,p,W,H):baseToolPoint(method,p,W,H)}
export {V3_EFFECT_METHODS};
