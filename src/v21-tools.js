import * as THREE from 'three';

const mat=(color,rough=.55,metal=.05)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const mesh=(geo,m)=>{const x=new THREE.Mesh(geo,m);x.castShadow=true;return x};

function brush(){const g=new THREE.Group();const handle=mesh(new THREE.CylinderGeometry(.035,.045,.72,12),mat(0x8a5b35,.7));handle.rotation.z=Math.PI/2;const ferrule=mesh(new THREE.BoxGeometry(.18,.1,.13),mat(0xb9b9b9,.25,.7));ferrule.position.x=.38;const bristles=mesh(new THREE.BoxGeometry(.18,.18,.08),mat(0xcaa66c,.9));bristles.position.x=.49;g.add(handle,ferrule,bristles);return g}
function widebrush(){const g=brush();g.children[1].scale.y=1.7;g.children[2].scale.y=2;return g}
function detailbrush(){const g=new THREE.Group();const h=mesh(new THREE.CylinderGeometry(.018,.025,.78,10),mat(0x4b3425,.6));h.rotation.z=Math.PI/2;const tip=mesh(new THREE.ConeGeometry(.035,.18,10),mat(0x2a201a,.9));tip.rotation.z=-Math.PI/2;tip.position.x=.47;g.add(h,tip);return g}
function roller(){const g=new THREE.Group();const arm=mesh(new THREE.CylinderGeometry(.025,.025,.58,10),mat(0x777777,.3,.7));arm.rotation.z=Math.PI/2;const bend=mesh(new THREE.CylinderGeometry(.02,.02,.28,10),mat(0x777777,.3,.7));bend.position.x=.28;bend.rotation.x=Math.PI/2;const roll=mesh(new THREE.CylinderGeometry(.12,.12,.5,18),mat(0xd8c8a6,.95));roll.rotation.z=Math.PI/2;roll.position.set(.28,.22,0);g.add(arm,bend,roll);return g}
function spray(){const g=new THREE.Group();const can=mesh(new THREE.CylinderGeometry(.09,.09,.38,18),mat(0xe64c3c,.35,.35));const cap=mesh(new THREE.CylinderGeometry(.07,.07,.05,16),mat(0x222222,.45));cap.position.y=.215;const nozzle=mesh(new THREE.BoxGeometry(.035,.04,.07),mat(0xeeeeee,.35));nozzle.position.set(.04,.24,.03);g.add(can,cap,nozzle);g.rotation.z=-.12;return g}
function charcoal(){const g=new THREE.Group();const stick=mesh(new THREE.BoxGeometry(.08,.08,.62),mat(0x24211f,.96));stick.rotation.z=Math.PI/2;const dust=mesh(new THREE.SphereGeometry(.055,10,8),mat(0x3a3531,.95));dust.position.x=.34;g.add(stick,dust);return g}
function pen(){const g=new THREE.Group();const body=mesh(new THREE.CylinderGeometry(.025,.03,.7,12),mat(0x151515,.45));body.rotation.z=Math.PI/2;const tip=mesh(new THREE.ConeGeometry(.025,.12,10),mat(0xeeeeee,.3,.4));tip.rotation.z=-Math.PI/2;tip.position.x=.41;g.add(body,tip);return g}
function stylus(){const g=new THREE.Group();const tablet=mesh(new THREE.BoxGeometry(.58,.38,.035),mat(0x20252b,.25,.25));tablet.position.set(-.12,-.18,.02);tablet.rotation.x=-.3;const styl=mesh(new THREE.CylinderGeometry(.018,.022,.58,10),mat(0xd8dce2,.28,.25));styl.rotation.z=Math.PI/2;styl.position.x=.2;g.add(tablet,styl);return g}

export const TOOL_FACTORIES={brush,widebrush,detailbrush,roller,spray,charcoal,pen,stylus};
export function attachTool(toolPivot,toolName){while(toolPivot.children.length)toolPivot.remove(toolPivot.children[0]);const tool=(TOOL_FACTORIES[toolName]||brush)();tool.scale.setScalar(.85);tool.position.set(.34,0,0);toolPivot.add(tool);return tool}

export function animateTool(tool,toolName,time,phase){if(!tool)return;const working=phase==='creating';tool.rotation.z=(toolName==='spray'?-.12:0)+(working?Math.sin(time*7)*.05:0);if(toolName==='spray'&&working){tool.rotation.x=Math.sin(time*18)*.08;tool.position.y=Math.sin(time*18)*.018}else if(toolName==='charcoal'&&working){tool.position.y=Math.sin(time*11)*.03}else tool.position.y*=.8}
