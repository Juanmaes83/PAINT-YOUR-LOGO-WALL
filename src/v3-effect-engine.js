import {V3_EFFECT_METHODS as BASE_METHODS,renderV3Effect as renderBaseEffect,effectEngineSnapshot as baseSnapshot,effectToolPoint as baseToolPoint} from './v3-effect-engine-base.js';
import {renderShapeMatrixAdapter,shapeMatrixSnapshot,renderHologramAdapter,hologramSnapshot,renderSmearAdapter,smearSnapshot,renderAudioReactiveAdapter,audioReactiveSnapshot} from './v3/adapters/spectacular-v2-adapters.js';
import {renderEnergyShieldAdapter,energyShieldSnapshot} from './v3/adapters/energy-shield-adapter.js';
import {audioOptionsForSource} from './v3/adapters/audio-analysis.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const EXTRA={shapeMatrix:renderShapeMatrixAdapter,energyShield:renderEnergyShieldAdapter,hologram:renderHologramAdapter,smear:renderSmearAdapter,audioReactive:renderAudioReactiveAdapter};
const SNAP={shapeMatrix:shapeMatrixSnapshot,energyShield:energyShieldSnapshot,hologram:hologramSnapshot,smear:smearSnapshot,audioReactive:audioReactiveSnapshot};
export const V3_EFFECT_METHODS=new Set([...BASE_METHODS,...Object.keys(EXTRA)]);
export function renderV3Effect(out,source,{method='particles',progress=1,time=0,intensity=.3,size=42,edge=.45,options={}}={}){if(!EXTRA[method])return renderBaseEffect(out,source,{method,progress,time,intensity,size,edge,options});const merged=method==='audioReactive'?{...options,...audioOptionsForSource(source,time)}:options;EXTRA[method](out,source,{progress:clamp(progress),time:Number.isFinite(time)?time:0,intensity:clamp(intensity),size,edge:clamp(edge),options:merged});return true}
export function effectEngineSnapshot(method){return SNAP[method]?SNAP[method]():baseSnapshot(method)}
export function effectToolPoint(method,p,W=1024,H=512){p=clamp(p);if(!EXTRA[method])return baseToolPoint(method,p,W,H);if(method==='shapeMatrix')return{x:W*(.08+.84*p),y:H*(.18+.64*((Math.floor(p*9)%9)/8))};if(method==='energyShield')return{x:W*(.12+.76*p),y:H*(.5+.26*Math.sin(p*Math.PI*3))};if(method==='hologram')return{x:W*(.5+.36*Math.cos(p*Math.PI*2)),y:H*(.5+.32*Math.sin(p*Math.PI*2))};if(method==='smear')return{x:W*(.08+.84*p),y:H*(.18+.64*p)};return{x:W*(.08+.84*p),y:H*(.5+.3*Math.sin(p*Math.PI*6))}}
