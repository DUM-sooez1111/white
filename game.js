/* global THREE */
const $=s=>document.querySelector(s), mount=$('#game');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x171916);scene.fog=new THREE.Fog(0x171916,23,56);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,100);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;mount.appendChild(renderer.domElement);

const M={
 dark:new THREE.MeshStandardMaterial({color:0x222420,roughness:.68,metalness:.2}),black:new THREE.MeshStandardMaterial({color:0x10110f,roughness:.3,metalness:.5}),
 paper:new THREE.MeshStandardMaterial({color:0xddd6c5,roughness:.74}),tan:new THREE.MeshStandardMaterial({color:0xc8bea4,roughness:.76}),brown:new THREE.MeshStandardMaterial({color:0x8f654d,roughness:.8}),
 plastic:new THREE.MeshPhysicalMaterial({color:0xddd7c8,roughness:.2,transmission:.08,transparent:true,opacity:.9}),steel:new THREE.MeshStandardMaterial({color:0xc8cdd0,roughness:.15,metalness:.96}),
 pink:new THREE.MeshStandardMaterial({color:0xff2f8b,emissive:0x8e123f,emissiveIntensity:1.2}),red:new THREE.MeshStandardMaterial({color:0xb72e2a,roughness:.65}),green:new THREE.MeshStandardMaterial({color:0x35a56d}),yellow:new THREE.MeshStandardMaterial({color:0xe3cd36})
};
const cube=new THREE.BoxGeometry(1,1,1);
function box(parent,size,pos,mat){const o=new THREE.Mesh(cube,mat);o.scale.set(...size);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function damp(a,b,k,dt){return THREE.MathUtils.lerp(a,b,1-Math.exp(-k*dt))}
function smooth(t){return t*t*(3-2*t)}

scene.add(new THREE.HemisphereLight(0xdfe5d8,0x24221e,1.7));
const sun=new THREE.DirectionalLight(0xfff2d6,3.1);sun.position.set(-10,20,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-28;sun.shadow.camera.right=28;sun.shadow.camera.top=28;sun.shadow.camera.bottom=-28;scene.add(sun);
const accentLight=new THREE.PointLight(0xff2f8b,19,14);scene.add(accentLight);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(48,48),new THREE.MeshStandardMaterial({color:0xbeb6a3,roughness:.92}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
const grid=new THREE.GridHelper(48,24,0x4b4941,0x8d8779);grid.position.y=.012;grid.material.opacity=.27;grid.material.transparent=true;scene.add(grid);
for(const r of[7.5,13.5,20.5]){const ring=new THREE.Mesh(new THREE.RingGeometry(r-.08,r+.08,96),new THREE.MeshBasicMaterial({color:r===13.5?0xb72e2a:0x4b4941,transparent:true,opacity:r===13.5?.65:.3,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.025;scene.add(ring)}
for(let i=-3;i<=3;i++){const a=box(scene,[4.4,2.8,.65],[i*6.7,1.4,-23.3],i%2?M.paper:M.dark);a.rotation.y=i*.035;const b=a.clone();b.position.z=23.3;scene.add(b)}
for(let i=-2;i<=2;i++){box(scene,[.65,2.8,5.2],[-23.3,1.4,i*8.8],i%2?M.dark:M.paper);box(scene,[.65,2.8,5.2],[23.3,1.4,i*8.8],i%2?M.dark:M.paper)}
for(const[x,z]of[[-16,-16],[16,-16],[-16,16],[16,16],[-9,0],[9,0]]){const p=box(scene,[1.1,4.5,1.1],[x,2.25,z],M.dark);p.rotation.y=Math.PI/4;const c=box(scene,[1.5,.25,1.5],[x,4.5,z],M.red);c.rotation.y=Math.PI/4}

function sword(length=3){const r=new THREE.Group();box(r,[.11,.1,length],[0,0,-length/2-.2],M.steel);const t=new THREE.Mesh(new THREE.ConeGeometry(.1,.42,4),M.steel);t.rotation.x=-Math.PI/2;t.position.z=-length-.4;r.add(t);box(r,[.5,.12,.12],[0,0,-.1],M.black);box(r,[.16,.16,.48],[0,0,.18],M.dark);return r}
function gun(){const r=new THREE.Group();box(r,[.8,.62,1.1],[0,0,-.42],M.dark);for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++){const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,1.3,8),M.steel);barrel.rotation.x=Math.PI/2;barrel.position.set(x*.2,y*.18,-1.35);r.add(barrel)}box(r,[.75,.09,.12],[0,.42,-.45],M.paper);box(r,[.75,.09,.12],[0,-.42,-.45],M.paper);return r}
function arm(parent,side,mat,tool){
 const shoulder=new THREE.Group();shoulder.position.set(side*1.12,3.48,0);parent.add(shoulder);box(shoulder,[.64,1.12,.68],[0,-.48,0],mat);
 const fore=new THREE.Group();fore.position.set(0,-.98,0);fore.rotation.x=-.92;fore.rotation.y=Math.PI;shoulder.add(fore);box(fore,[.58,1.05,.62],[0,-.42,0],mat);
 const hand=new THREE.Group();hand.position.set(0,-.94,0);fore.add(hand);box(hand,[.38,.38,.5],[0,0,0],M.dark);tool.position.set(0,0,-.2);tool.rotation.z=side*.035;hand.add(tool);return{shoulder,fore,hand,tool,side};
}
function coreModel(){
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);box(body,[2.15,2.2,1.15],[0,2.75,0],M.black);
 const core=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.28,36),M.pink);core.rotation.x=Math.PI/2;core.position.set(0,2.75,-.66);body.add(core);const ring=new THREE.Mesh(new THREE.TorusGeometry(.58,.07,10,36),M.paper);ring.position.set(0,2.75,-.83);body.add(ring);
 box(body,[.85,.7,.8],[0,4.35,0],M.green);box(body,[.58,.18,.06],[0,4.4,-.43],M.dark);box(body,[.13,.08,.065],[-.19,4.4,-.47],M.pink);box(body,[.13,.08,.065],[.19,4.4,-.47],M.pink);
 const la=arm(body,-1,M.black,sword(2.9)),ra=arm(body,1,M.yellow,sword(2.9));box(ra.shoulder,[.7,.45,.72],[0,.2,0],M.green);
 const ll=new THREE.Group(),rl=new THREE.Group();ll.position.set(-.6,1.45,0);rl.position.set(.6,1.45,0);body.add(ll,rl);box(ll,[.9,2.5,.9],[0,-.7,0],M.plastic);box(rl,[.9,2.5,.9],[0,-.7,0],M.plastic);
 root.userData={body,la,ra,ll,rl,type:'core'};return root;
}
function sentinelModel(){
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);box(body,[2.1,2.25,1.18],[0,2.72,0],M.tan);box(body,[.72,.62,.7],[0,4.3,0],M.plastic);box(body,[.09,.09,.05],[-.18,4.34,-.38],M.black);box(body,[.09,.09,.05],[.18,4.34,-.38],M.black);
 const la=arm(body,-1,M.tan,sword(3.25)),ra=arm(body,1,M.tan,gun());
 const ll=new THREE.Group(),rl=new THREE.Group();ll.position.set(-.58,1.42,0);rl.position.set(.58,1.42,0);body.add(ll,rl);box(ll,[.88,1.55,.88],[0,-.25,0],M.tan);box(ll,[.9,1.15,.92],[0,-1.55,0],M.brown);box(rl,[.88,1.55,.88],[0,-.25,0],M.tan);box(rl,[.9,1.15,.92],[0,-1.55,0],M.brown);
 root.userData={body,la,ra,ll,rl,type:'sentinel'};return root;
}

let hero=null,selectedUnit='core',started=false,menuOpen=true;
function setHero(type){if(hero)scene.remove(hero);selectedUnit=type;hero=type==='core'?coreModel():sentinelModel();hero.scale.setScalar(.72);hero.position.set(0,0,8);hero.rotation.y=0;scene.add(hero);accentLight.color.set(type==='core'?0xff2f8b:0x79b8d2);document.querySelector('.brand b').textContent=type==='core'?'CORE BLADE':'ARCHIVE SENTINEL';document.querySelector('.controls .attack span').textContent=type==='core'?'양날 베기':'검격 + 3연사'}
setHero('core');

const enemies=[],particles=[],shots=[],trails=[],keys=new Set();let health=100,score=0,wave=0,attacking=false,attackTime=0,attackId=0,attackSide=1,fired=false,trailed=false,combo=0,comboTimer=0,over=false,spawnTimer=0;
function makeEnemy(x,z,elite=false){const r=new THREE.Group();r.position.set(x,0,z);r.scale.setScalar(elite?1.15:.82);r.userData={hp:elite?4:2,speed:elite?2.3:2.7,hit:0,attack:Math.random(),dead:false,elite};const ink=new THREE.MeshStandardMaterial({color:elite?0x5a191c:0x33342f,roughness:.82});box(r,[1.5,1.8,.85],[0,2.15,0],ink);box(r,[.68,.62,.62],[0,3.45,0],M.paper);const mark=new THREE.Mesh(new THREE.PlaneGeometry(.38,.09),new THREE.MeshBasicMaterial({color:0xd93335}));mark.position.set(0,3.46,-.32);r.add(mark);const a=new THREE.Group();a.position.set(.95,2.65,0);r.add(a);box(a,[1.2,.35,.38],[.48,0,0],ink);const s=sword(1.9);s.position.set(1.15,0,0);s.rotation.y=-Math.PI/2;a.add(s);r.userData.arm=a;box(r,[.55,1.8,.58],[-.45,.75,0],M.paper);box(r,[.55,1.8,.58],[.45,.75,0],M.paper);scene.add(r);enemies.push(r)}
function spawnWave(){wave++;$('#wave').textContent=String(wave).padStart(2,'0');const b=$('#waveBanner');b.querySelector('strong').textContent=`WAVE ${wave}`;b.classList.add('show');setTimeout(()=>b.classList.remove('show'),1500);const n=Math.min(3+wave*2,13);for(let i=0;i<n;i++){const a=i/n*Math.PI*2+Math.random()*.5,r=16+Math.random()*4;makeEnemy(Math.cos(a)*r,Math.sin(a)*r,wave%3===0&&i===0)}}
function slash(){if(started&&!menuOpen&&!over&&!attacking){attacking=true;attackTime=0;attackId++;attackSide=attackId%2?1:-1;fired=false;trailed=false}}
function swordTrail(side){const color=selectedUnit==='core'?0xff5aa1:0xbcecff,mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.42,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false});const mesh=new THREE.Mesh(new THREE.RingGeometry(2.15,4.25,48,1,-1.05,2.1),mat);mesh.position.copy(hero.position);mesh.position.y=1.75;mesh.rotation.x=-Math.PI/2;mesh.rotation.z=hero.rotation.y+(side>0?-1.05:Math.PI+.95);scene.add(mesh);trails.push({mesh,life:.24,max:.24})}
function burst(pos,color=0xff3b91,n=10){for(let i=0;i<n;i++){const m=new THREE.Mesh(new THREE.TetrahedronGeometry(.08+Math.random()*.12),new THREE.MeshBasicMaterial({color}));m.position.copy(pos);m.position.y+=2;scene.add(m);particles.push({m,v:new THREE.Vector3((Math.random()-.5)*6,Math.random()*5,(Math.random()-.5)*6),life:.55+Math.random()*.35})}}
function hit(e,damage=1){if(e.userData.dead)return;e.userData.hp-=damage;e.userData.hit=.18;burst(e.position,selectedUnit==='core'?0xff3b91:0x86d8ef,7);e.position.add(new THREE.Vector3().subVectors(e.position,hero.position).normalize().multiplyScalar(1.2));if(e.userData.hp<=0){e.userData.dead=true;score++;combo++;comboTimer=1.5;$('#score').textContent=String(score).padStart(2,'0');const c=$('#combo');c.querySelector('strong').textContent=combo;c.classList.add('show');burst(e.position,0xded7c5,18)}}
function shoot(){const dir=new THREE.Vector3(0,0,-1).applyAxisAngle(new THREE.Vector3(0,1,0),hero.rotation.y).normalize();for(let i=-1;i<=1;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,.85),new THREE.MeshBasicMaterial({color:0x8ce5ff}));m.position.copy(hero.position).add(new THREE.Vector3(0,2.25,0)).addScaledVector(dir,1.2);const d=dir.clone().applyAxisAngle(new THREE.Vector3(0,1,0),i*.035);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,-1),d);scene.add(m);shots.push({m,v:d.multiplyScalar(25),life:1.1,hit:new Set()})}}
function damageHero(n){if(over)return;health=Math.max(0,health-n);$('#healthBar').style.width=health+'%';$('#healthText').textContent=Math.ceil(health);const vignette=$('#damageVignette'),panel=document.querySelector('.health-panel');vignette.classList.add('hit');panel.classList.remove('hit');void panel.offsetWidth;panel.classList.add('hit');clearTimeout(damageHero.timer);damageHero.timer=setTimeout(()=>vignette.classList.remove('hit'),90);if(!health){over=true;$('#finalScore').textContent=score;$('#gameOver').classList.add('show')}}
function clearBattle(){enemies.forEach(e=>scene.remove(e));particles.forEach(p=>scene.remove(p.m));shots.forEach(s=>scene.remove(s.m));trails.forEach(t=>scene.remove(t.mesh));enemies.length=particles.length=shots.length=trails.length=0}
function restart(){clearBattle();health=100;score=wave=combo=0;over=false;spawnTimer=0;hero.position.set(0,0,8);hero.rotation.y=0;$('#healthBar').style.width='100%';$('#healthText').textContent='100';$('#score').textContent='00';$('#gameOver').classList.remove('show');if(started)spawnWave()}
function openMenu(){menuOpen=true;keys.clear();$('#characterMenu').classList.add('show')}
function launch(){const picked=document.querySelector('.character-card.selected').dataset.unit;if(picked!==selectedUnit)setHero(picked);menuOpen=false;$('#characterMenu').classList.remove('show');if(!started){started=true;restart()}else restart()}
document.querySelectorAll('.character-card').forEach(card=>card.onclick=()=>{document.querySelectorAll('.character-card').forEach(c=>c.classList.remove('selected'));card.classList.add('selected')});$('#startGame').onclick=launch;$('#changeCharacter').onclick=openMenu;$('#restart').onclick=restart;
addEventListener('keydown',e=>{keys.add(e.key.toLowerCase());if(e.code==='Space'){e.preventDefault();slash()}if(e.key.toLowerCase()==='r')restart();if(e.key.toLowerCase()==='c')openMenu()});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));renderer.domElement.addEventListener('pointerdown',slash);

const clock=new THREE.Clock(),move=new THREE.Vector3(),target=new THREE.Vector3(),forward=new THREE.Vector3();let cameraAngle=Math.atan2(10,15);
function animateHero(dt,time,moving){
 const r=hero.userData,step=moving?Math.sin(time*10):0,bob=moving?Math.abs(Math.sin(time*10))*.1:Math.sin(time*2)*.025,idle=Math.sin(time*2.1)*.025;
 let yaw=0,raise=0,extend=0,twist=0;
 if(attacking){
  attackTime+=dt;const p=Math.min(attackTime/.72,1);
  if(p<.2){const q=smooth(p/.2);yaw=-.95*q;raise=.72*q;twist=-.26*q}
  else if(p<.58){const q=smooth((p-.2)/.38);yaw=THREE.MathUtils.lerp(-.95,1.8,q);raise=THREE.MathUtils.lerp(.72,-.34,q);twist=THREE.MathUtils.lerp(-.26,.34,q)}
  else{const q=smooth((p-.58)/.42);yaw=1.8*(1-q);raise=-.34*(1-q);twist=.34*(1-q)}
  yaw*=attackSide;twist*=attackSide;extend=Math.sin(p*Math.PI);
  if(!trailed&&p>.3){trailed=true;swordTrail(attackSide)}
  if(selectedUnit==='sentinel'&&!fired&&p>.28){fired=true;shoot()}
  if(p>.25&&p<.63){forward.set(0,0,-1).applyAxisAngle(new THREE.Vector3(0,1,0),hero.rotation.y);enemies.forEach(e=>{if(e.userData.lastHit!==attackId&&!e.userData.dead&&e.position.distanceTo(hero.position)<5.2&&forward.dot(e.position.clone().sub(hero.position).normalize())>.02){e.userData.lastHit=attackId;hit(e)}})}
  if(p>=1)attacking=false;
 }
 r.body.position.y=damp(r.body.position.y,bob,12,dt);r.body.rotation.y=damp(r.body.rotation.y,twist,18,dt);r.body.rotation.z=damp(r.body.rotation.z,(moving?-move.x*.08:0)+raise*.12,10,dt);r.body.rotation.x=damp(r.body.rotation.x,moving?move.z*.05:0,9,dt);r.ll.rotation.x=damp(r.ll.rotation.x,step*.5,15,dt);r.rl.rotation.x=damp(r.rl.rotation.x,-step*.5,15,dt);
 const core=selectedUnit==='core';r.la.shoulder.rotation.y=damp(r.la.shoulder.rotation.y,-yaw,25,dt);r.ra.shoulder.rotation.y=damp(r.ra.shoulder.rotation.y,core?yaw:yaw*.16,25,dt);r.la.shoulder.rotation.z=damp(r.la.shoulder.rotation.z,-.1+idle+raise,18,dt);r.ra.shoulder.rotation.z=damp(r.ra.shoulder.rotation.z,.1-idle-(core?raise:raise*.12),18,dt);r.la.fore.rotation.x=damp(r.la.fore.rotation.x,-.92+extend*(core?.92:1.08),24,dt);r.ra.fore.rotation.x=damp(r.ra.fore.rotation.x,-.92+extend*(core?1.08:.18),24,dt);
}
function update(dt,time){if(!hero)return;const canPlay=started&&!menuOpen&&!over;move.set(0,0,0);if(canPlay){cameraAngle+=((keys.has('q')?1:0)-(keys.has('e')?1:0))*1.65*dt;const ix=(keys.has('d')?1:0)-(keys.has('a')?1:0),iz=(keys.has('s')?1:0)-(keys.has('w')?1:0);move.set(ix*Math.cos(cameraAngle)+iz*Math.sin(cameraAngle),0,-ix*Math.sin(cameraAngle)+iz*Math.cos(cameraAngle))}const moving=move.lengthSq()>0;if(moving){move.normalize();hero.position.addScaledVector(move,(keys.has('shift')?9.5:6.2)*dt);hero.position.x=THREE.MathUtils.clamp(hero.position.x,-20.8,20.8);hero.position.z=THREE.MathUtils.clamp(hero.position.z,-20.8,20.8);const rr=Math.atan2(-move.x,-move.z);hero.rotation.y+=Math.atan2(Math.sin(rr-hero.rotation.y),Math.cos(rr-hero.rotation.y))*Math.min(1,dt*12)}animateHero(dt,time,moving);
 if(canPlay)for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e.userData.dead){e.scale.multiplyScalar(Math.pow(.03,dt));e.rotation.y+=dt*8;if(e.scale.x<.04){scene.remove(e);enemies.splice(i,1)}continue}if(e.userData.hit>0){e.userData.hit-=dt;continue}const dist=e.position.distanceTo(hero.position);e.lookAt(hero.position.x,e.position.y,hero.position.z);e.rotateY(Math.PI);e.userData.arm.rotation.z=Math.sin(time*4+e.position.x)*.35;if(dist>2.35)e.position.addScaledVector(new THREE.Vector3().subVectors(hero.position,e.position).normalize(),e.userData.speed*dt);else{e.userData.attack-=dt;if(e.userData.attack<=0){e.userData.attack=1.05+Math.random()*.5;e.userData.arm.rotation.x=-1.2;setTimeout(()=>{if(!e.userData.dead)e.userData.arm.rotation.x=0},180);damageHero(e.userData.elite?17:10)}}}
 for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.life-=dt;s.m.position.addScaledVector(s.v,dt);enemies.forEach(e=>{if(!s.hit.has(e)&&!e.userData.dead&&s.m.position.distanceTo(e.position.clone().add(new THREE.Vector3(0,2,0)))<1.3){s.hit.add(e);hit(e,1);s.life=0}});if(s.life<=0){scene.remove(s.m);shots.splice(i,1)}}
 for(let i=trails.length-1;i>=0;i--){const t=trails[i];t.life-=dt;t.mesh.material.opacity=.42*Math.max(0,t.life/t.max);t.mesh.scale.multiplyScalar(1+dt*.7);if(t.life<=0){scene.remove(t.mesh);trails.splice(i,1)}}
 if(canPlay&&!enemies.length){spawnTimer+=dt;if(spawnTimer>1.8){spawnTimer=0;spawnWave()}}comboTimer-=dt;if(comboTimer<=0){combo=0;$('#combo').classList.remove('show')}for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.v.y-=9*dt;p.m.position.addScaledVector(p.v,dt);p.m.rotation.x+=dt*9;p.m.scale.setScalar(Math.max(0,p.life*1.5));if(p.life<=0){scene.remove(p.m);particles.splice(i,1)}}accentLight.position.set(hero.position.x,3,hero.position.z);const radius=18;camera.position.lerp(new THREE.Vector3(hero.position.x+Math.sin(cameraAngle)*radius,12,hero.position.z+Math.cos(cameraAngle)*radius),1-Math.pow(.002,dt));target.set(hero.position.x,2.1,hero.position.z);camera.lookAt(target)}
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.04);update(dt,clock.elapsedTime);renderer.render(scene,camera)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});camera.position.set(10,12,23);loop();setTimeout(()=>$('#loading').classList.add('hide'),500);
