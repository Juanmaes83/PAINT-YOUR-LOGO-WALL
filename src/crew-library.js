import * as THREE from 'three';

export const CREW_TEMPLATES={
  aya:{name:'AYA · Studio Painter',kind:'human',skin:0x6c4032,primary:0xd9534f,secondary:0x223b70,accent:0xe5bd64,hair:0x17151a,shoe:0xf2e9dc,slim:.88,head:.45,upper:.76,lower:.68,leg:1.0,personality:'balanced'},
  noa:{name:'NOA · Editorial Painter',kind:'editorial',skin:0xb8755b,primary:0x242329,secondary:0xe9e0d1,accent:0xd6b177,hair:0x251a16,shoe:0x161616,slim:.70,head:.39,upper:.84,lower:.76,leg:1.12,personality:'elegant'},
  mimo:{name:'MIMO · Expressionist Mascot',kind:'mascot',skin:0xf2a85f,primary:0x6f58b5,secondary:0x2d3158,accent:0xffe4a3,hair:0x5c3c88,shoe:0xf6e7cd,slim:1.10,head:.58,upper:.63,lower:.58,leg:.78,personality:'bouncy'},
  foxie:{name:'FOXIE · Street Artist',kind:'fox',skin:0xd87035,primary:0x22494a,secondary:0x50382d,accent:0xffd8a3,hair:0x7a2f1f,shoe:0x30251f,slim:.82,head:.47,upper:.75,lower:.70,leg:.98,personality:'alert'},
  lumi:{name:'LUMI · Fantasy Illustrator',kind:'sprite',skin:0xd9c8ff,primary:0x6453a6,secondary:0x94d9cb,accent:0xffe99a,hair:0xdfe8ff,shoe:0x8c78bd,slim:.67,head:.43,upper:.78,lower:.74,leg:.88,personality:'floating'},
  byte:{name:'BYTE · Digital Maker',kind:'robot',skin:0xbfc4ca,primary:0x2a2e38,secondary:0x31d9c5,accent:0xffcf4c,hair:0x191c22,shoe:0x181b20,slim:.80,head:.44,upper:.72,lower:.66,leg:.92,personality:'mechanical'}
};

const mat=(color,rough=.62,metal=.02,extra={})=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,...extra});
function addMesh(parent,geo,material,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1]){const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.rotation.set(...rot);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function limb(parent,length,radius,material){const g=new THREE.Group();parent.add(g);addMesh(g,new THREE.CapsuleGeometry(radius,Math.max(.02,length-radius*2),8,16),material,[length/2,0,0],[0,0,-Math.PI/2]);return g}
function eye(parent,x,y,z){addMesh(parent,new THREE.SphereGeometry(.085,12,9),mat(0xf7f1ea,.34),[x,y,z],[0,0,0],[1,.72,.46]);addMesh(parent,new THREE.SphereGeometry(.037,10,8),mat(0x241d19,.3),[x,y,z+.048]);}

export function createCrewRig(spec){
  const root=new THREE.Group();root.name=`PYLW_${spec.kind.toUpperCase()}_ROOT`;
  const mats={skin:mat(spec.skin,.68,spec.kind==='robot'?.55:.02),primary:mat(spec.primary,spec.kind==='robot'?.35:.66,spec.kind==='robot'?.55:.02),secondary:mat(spec.secondary,.58),accent:mat(spec.accent,.38,.12),hair:mat(spec.hair,.74),shoe:mat(spec.shoe,.55)};
  const pelvis=new THREE.Group();pelvis.position.y=-.12;root.add(pelvis);
  const torso=new THREE.Group();torso.position.set(0,.72,0);pelvis.add(torso);
  addMesh(torso,spec.kind==='robot'?new THREE.BoxGeometry(.86,1.35,.60):new THREE.CapsuleGeometry(.53,1.05,10,20),mats.primary,[0,.45,0],[0,0,0],[spec.slim,1,spec.kind==='robot'?.85:.62]);
  const neck=new THREE.Group();neck.position.set(0,1.53,0);torso.add(neck);addMesh(neck,new THREE.CylinderGeometry(.17,.19,.25,14),mats.skin,[0,.07,0]);
  const head=new THREE.Group();head.position.set(0,.46,0);neck.add(head);addMesh(head,spec.kind==='robot'?new THREE.BoxGeometry(.78,.72,.70):new THREE.SphereGeometry(spec.head,22,16),spec.kind==='robot'?mats.primary:mats.skin,[0,0,0],[0,0,0],spec.kind==='robot'?[1,1,1]:[.94,1.05,.90]);
  if(spec.kind!=='robot'&&spec.kind!=='sprite')addMesh(head,new THREE.SphereGeometry(spec.head*1.02,20,14),mats.hair,[0,.13,-.08],[0,0,0],[1,.88,.73]);
  if(spec.kind==='robot'){
    addMesh(head,new THREE.BoxGeometry(.60,.42,.06),mat(0x111722,.28,.2,{emissive:0x06151b,emissiveIntensity:.8}),[0,.01,.42]);
    addMesh(head,new THREE.BoxGeometry(.09,.055,.035),mat(spec.secondary,.28,.2,{emissive:spec.secondary,emissiveIntensity:2}),[-.16,.07,.47]);addMesh(head,new THREE.BoxGeometry(.09,.055,.035),mat(spec.secondary,.28,.2,{emissive:spec.secondary,emissiveIntensity:2}),[.16,.07,.47]);
  }else{eye(head,-.18,.07,.405);eye(head,.18,.07,.405);}
  const shoulderR=new THREE.Group();shoulderR.position.set(.46,1.22,.02);torso.add(shoulderR);limb(shoulderR,spec.upper,.13,mats.primary);const elbowR=new THREE.Group();elbowR.position.x=spec.upper;shoulderR.add(elbowR);limb(elbowR,spec.lower,.105,mats.skin);const handR=addMesh(elbowR,new THREE.SphereGeometry(.145,14,10),mats.skin,[spec.lower+.035,0,0],[0,0,0],[1.12,.78,.72]);
  const shoulderL=new THREE.Group();shoulderL.position.set(-.46,1.22,-.04);torso.add(shoulderL);limb(shoulderL,spec.upper*.93,.13,mats.primary);const elbowL=new THREE.Group();elbowL.position.x=spec.upper*.93;shoulderL.add(elbowL);limb(elbowL,spec.lower*.90,.105,mats.skin);addMesh(elbowL,new THREE.SphereGeometry(.14,14,10),mats.skin,[spec.lower*.90+.03,0,0]);
  const hipR=new THREE.Group();hipR.position.set(.25,-.13,0);pelvis.add(hipR);limb(hipR,spec.leg,.16,mats.secondary);const kneeR=new THREE.Group();kneeR.position.x=spec.leg;hipR.add(kneeR);limb(kneeR,spec.leg*.88,.135,mats.secondary);addMesh(kneeR,new THREE.CapsuleGeometry(.15,.27,6,12),mats.shoe,[spec.leg*.88+.08,-.04,.11],[Math.PI/2,0,-Math.PI/2],[1.25,.84,.82]);
  const hipL=new THREE.Group();hipL.position.set(-.25,-.13,-.03);pelvis.add(hipL);limb(hipL,spec.leg,.16,mats.secondary);const kneeL=new THREE.Group();kneeL.position.x=spec.leg;hipL.add(kneeL);limb(kneeL,spec.leg*.88,.135,mats.secondary);addMesh(kneeL,new THREE.CapsuleGeometry(.15,.27,6,12),mats.shoe,[spec.leg*.88+.08,-.04,.11],[Math.PI/2,0,-Math.PI/2],[1.25,.84,.82]);
  hipR.rotation.z=-Math.PI/2-.05;hipL.rotation.z=-Math.PI/2+.07;
  if(spec.kind==='editorial'){addMesh(head,new THREE.BoxGeometry(.80,.10,.50),mats.accent,[0,.39,-.02]);}
  if(spec.kind==='mascot'){addMesh(head,new THREE.SphereGeometry(.19,14,10),mats.hair,[-.31,.42,-.02],[0,0,0],[.75,1.55,.65]);addMesh(head,new THREE.SphereGeometry(.19,14,10),mats.hair,[.31,.42,-.02],[0,0,0],[.75,1.55,.65]);}
  if(spec.kind==='fox'){addMesh(head,new THREE.ConeGeometry(.20,.52,4),mats.skin,[-.28,.48,-.02]);addMesh(head,new THREE.ConeGeometry(.20,.52,4),mats.skin,[.28,.48,-.02]);}
  if(spec.kind==='sprite'){const wing=mat(0xb8f4e9,.2,0,{transparent:true,opacity:.45,side:THREE.DoubleSide,emissive:0x4d9f96,emissiveIntensity:.25});addMesh(torso,new THREE.CircleGeometry(.65,24,0,Math.PI),wing,[-.48,.72,-.23],[0,.45,.55],[.62,1.35,1]);addMesh(torso,new THREE.CircleGeometry(.65,24,0,Math.PI),wing,[.48,.72,-.23],[0,-.45,-.55],[.62,1.35,1]);}
  const toolPivot=new THREE.Group();toolPivot.position.set(spec.lower+.18,-.05,.03);elbowR.add(toolPivot);const handle=addMesh(toolPivot,new THREE.CylinderGeometry(.025,.025,.52,10),mat(0x8c6744,.6),[.07,-.16,0],[0,0,-.35]);const brushHead=addMesh(toolPivot,new THREE.BoxGeometry(.19,.18,.08),mats.accent,[.14,-.39,0],[0,0,-.35]);
  return{root,spec,pelvis,torso,head,shoulderR,elbowR,handR,shoulderL,elbowL,hipR,kneeR,hipL,kneeL,toolPivot,handle,brushHead};
}

export function animateCrew(rig,{phase,progress,time,motion=1}){
  const paint=phase==='painting',inspect=phase==='inspecting',walk=phase==='walking to job'||phase==='moving to next job';
  rig.torso.rotation.z=(paint?-.12-Math.sin(progress*Math.PI*5)*.025:inspect?.08:0)*motion;
  rig.head.rotation.z=inspect?.12:paint?.06:0;
  rig.shoulderR.rotation.z=(paint?-.45+Math.sin(progress*Math.PI*8)*.22:-.12)*motion;
  rig.elbowR.rotation.z=(paint?-.65+Math.cos(progress*Math.PI*8)*.18:-.35)*motion;
  rig.shoulderL.rotation.z=(paint?.22:.08)*motion;
  rig.hipR.rotation.z=-Math.PI/2+(walk?Math.sin(time*7)*.14:0)*motion;
  rig.hipL.rotation.z=-Math.PI/2-(walk?Math.sin(time*7)*.14:0)*motion;
  rig.root.position.y+=(rig.spec.personality==='bouncy'?Math.sin(time*6)*.025:rig.spec.personality==='floating'?Math.sin(time*2.2)*.04:0)*motion;
}