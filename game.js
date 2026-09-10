const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const mini = document.querySelector('#miniMap');
const mctx = mini.getContext('2d');

const WORLD = { w: 2400, h: 1500 };
const zones = [
  { id:1, name:'먹빛 문턱', x:90, y:480, w:470, h:540 },
  { id:2, name:'접힌 회랑', x:560, y:610, w:470, h:280 },
  { id:3, name:'붉은 실 마당', x:1030, y:300, w:760, h:900 },
  { id:4, name:'천학의 제단', x:1790, y:470, w:520, h:560 },
];
const walls = [
  {x:90,y:450,w:470,h:35},{x:90,y:1015,w:470,h:35},{x:55,y:450,w:35,h:600},
  {x:560,y:575,w:470,h:35},{x:560,y:890,w:470,h:35},
  {x:1030,y:265,w:760,h:35},{x:1030,y:1200,w:760,h:35},
  {x:1790,y:435,w:520,h:35},{x:1790,y:1030,w:520,h:35},{x:2310,y:435,w:35,h:630},
  {x:1160,y:475,w:210,h:28},{x:1450,y:475,w:210,h:28},
  {x:1160,y:995,w:210,h:28},{x:1450,y:995,w:210,h:28},
  {x:1950,y:585,w:200,h:24},{x:1950,y:890,w:200,h:24},
];
const pillars = [
  [665,655],[665,845],[920,655],[920,845],
  [1120,390],[1700,390],[1120,1110],[1700,1110],
  [1880,555],[2220,555],[1880,945],[2220,945]
];
const dolls = [
  [330,650,0],[410,820,1],[760,700,0],[880,795,1],
  [1220,620,0],[1410,540,1],[1590,650,0],[1270,850,1],[1510,920,0],[1680,790,1],
  [1940,725,0],[2110,650,1],[2180,830,0]
];
const gates = [{x:540,y:665,w:38,h:170},{x:1010,y:665,w:38,h:170},{x:1770,y:665,w:38,h:170}];
const player = { x:250, y:750, r:16, speed:220, face:0 };
const camera = { x:0,y:0 };
const keys = new Set();
let last=performance.now(), currentZone=0, titleTimer=0, mapOpen=false;

addEventListener('keydown',e=>{
  const k=e.key.toLowerCase(); keys.add(k);
  if(k==='m'){ e.preventDefault(); toggleMap(); }
});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
document.querySelector('#mapButton').onclick=toggleMap;
document.querySelector('#closeMap').onclick=toggleMap;

function toggleMap(){ mapOpen=!mapOpen; document.querySelector('#mapPanel').classList.toggle('open',mapOpen); document.querySelector('#mapPanel').setAttribute('aria-hidden',String(!mapOpen)); drawMiniMap(); }
function resize(){ const d=Math.min(devicePixelRatio||1,2); const r=canvas.getBoundingClientRect(); canvas.width=Math.round(r.width*d); canvas.height=Math.round(r.height*d); ctx.setTransform(d,0,0,d,0,0); canvas._w=r.width; canvas._h=r.height; }
addEventListener('resize',resize); resize();

function collides(x,y){
  const r=player.r;
  return walls.some(o=>x+r>o.x&&x-r<o.x+o.w&&y+r>o.y&&y-r<o.y+o.h) ||
    pillars.some(([px,py])=>Math.hypot(x-px,y-py)<r+23);
}
function update(dt){
  if(mapOpen)return;
  let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
  let dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
  if(dx||dy){ const l=Math.hypot(dx,dy);dx/=l;dy/=l;player.face=Math.atan2(dy,dx); }
  const s=player.speed*(keys.has('shift')?1.65:1)*dt;
  if(!collides(player.x+dx*s,player.y))player.x+=dx*s;
  if(!collides(player.x,player.y+dy*s))player.y+=dy*s;
  player.x=Math.max(75,Math.min(WORLD.w-75,player.x));player.y=Math.max(285,Math.min(WORLD.h-285,player.y));
  const z=zones.findIndex(q=>player.x>=q.x&&player.x<=q.x+q.w&&player.y>=q.y&&player.y<=q.y+q.h);
  if(z>=0&&z!==currentZone){currentZone=z;showZone(z);}
  const vw=canvas._w,vh=canvas._h;
  camera.x+=(Math.max(0,Math.min(WORLD.w-vw,player.x-vw*.5))-camera.x)*Math.min(1,dt*5);
  camera.y+=(Math.max(0,Math.min(WORLD.h-vh,player.y-vh*.52))-camera.y)*Math.min(1,dt*5);
}
function showZone(i){
  const el=document.querySelector('#mapTitle');el.querySelector('span').textContent=`제 ${i+1}장`;el.querySelector('strong').textContent=zones[i].name;document.querySelector('#locationName').textContent=zones[i].name;el.classList.add('show');clearTimeout(titleTimer);titleTimer=setTimeout(()=>el.classList.remove('show'),2200);
}
function paperTile(x,y,w,h){
  ctx.fillStyle='#cfc7b5';ctx.fillRect(x,y,w,h);ctx.strokeStyle='rgba(62,57,48,.18)';ctx.lineWidth=1;
  for(let i=18;i<w;i+=42){ctx.beginPath();ctx.moveTo(x+i,y);ctx.lineTo(x+i-12,y+h);ctx.stroke();}
  for(let j=25;j<h;j+=55){ctx.beginPath();ctx.moveTo(x,y+j);ctx.lineTo(x+w,y+j+5);ctx.stroke();}
}
function drawWorld(g=ctx,scale=1,ox=-camera.x,oy=-camera.y){
  g.save();g.translate(ox,oy);g.scale(scale,scale);
  g.fillStyle='#22231f';g.fillRect(0,0,WORLD.w,WORLD.h);
  zones.forEach((z,i)=>{
    g.fillStyle=i===2?'#c8bfaa':'#d4ccba';g.fillRect(z.x,z.y,z.w,z.h);
    g.strokeStyle='rgba(35,32,27,.13)';g.lineWidth=2;
    for(let n=-z.h;n<z.w;n+=70){g.beginPath();g.moveTo(z.x+Math.max(n,0),z.y+Math.max(-n,0));g.lineTo(z.x+Math.min(n+z.h,z.w),z.y+Math.min(z.h,z.h+n));g.stroke();}
  });
  // courtyard ink circle and cut marks
  g.strokeStyle='rgba(42,39,33,.18)';g.lineWidth=18;g.beginPath();g.arc(1410,750,260,0,Math.PI*2);g.stroke();
  g.strokeStyle='rgba(151,43,35,.72)';g.lineWidth=5;g.beginPath();g.arc(1410,750,208,-.5,2.2);g.stroke();
  for(let i=0;i<16;i++){const a=i*.92;const rr=70+(i*47)%220;g.strokeStyle=`rgba(50,47,39,${.08+(i%3)*.03})`;g.lineWidth=2;g.beginPath();g.moveTo(1410+Math.cos(a)*rr,750+Math.sin(a)*rr);g.lineTo(1410+Math.cos(a+.3)*(rr+45),750+Math.sin(a+.3)*(rr+45));g.stroke();}
  // red threads
  g.strokeStyle='rgba(158,43,35,.55)';g.lineWidth=3;[[1040,410,1780,1080],[1080,1120,1710,350],[1200,300,1540,1200]].forEach(l=>{g.beginPath();g.moveTo(l[0],l[1]);g.lineTo(l[2],l[3]);g.stroke();});
  // altar
  g.fillStyle='#342f29';g.fillRect(1900,620,320,260);g.fillStyle='#b8ad98';g.fillRect(1920,640,280,220);g.strokeStyle='#9a302b';g.lineWidth=8;g.beginPath();g.arc(2060,750,68,0,Math.PI*2);g.stroke();g.font='900 65px serif';g.fillStyle='#292722';g.textAlign='center';g.fillText('斬',2060,773);
  walls.forEach(o=>{g.fillStyle='#171815';g.fillRect(o.x+6,o.y+8,o.w,o.h);g.fillStyle='#47473f';g.fillRect(o.x,o.y,o.w,o.h);g.fillStyle='#727166';g.fillRect(o.x,o.y,o.w,5);});
  gates.forEach(o=>{g.fillStyle='#272722';g.fillRect(o.x,o.y,o.w,o.h);g.fillStyle='#b69a57';g.fillRect(o.x+6,o.y,5,o.h);g.fillRect(o.x+27,o.y,5,o.h);});
  pillars.forEach(([x,y])=>{g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.arc(x+7,y+9,25,0,7);g.fill();g.fillStyle='#55544b';g.beginPath();g.arc(x,y,23,0,7);g.fill();g.strokeStyle='#aaa18f';g.lineWidth=3;g.stroke();});
  dolls.forEach(d=>drawDoll(g,...d));
  if(g===ctx)drawPlayer(g);
  g.restore();
}
function drawDoll(g,x,y,flip){
  g.save();g.translate(x,y);g.scale(flip?-1:1,1);g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(5,17,19,7,0,0,7);g.fill();g.fillStyle='#ede6d5';g.strokeStyle='#37342e';g.lineWidth=2;g.beginPath();g.arc(0,-22,10,0,7);g.fill();g.stroke();g.beginPath();g.moveTo(0,-12);g.lineTo(-11,17);g.lineTo(13,17);g.closePath();g.fill();g.stroke();g.strokeStyle='#a4332d';g.beginPath();g.moveTo(-3,-25);g.lineTo(3,-20);g.stroke();g.restore();
}
function drawPlayer(g){
  g.save();g.translate(player.x,player.y);g.rotate(player.face);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(-3,12,21,9,0,0,7);g.fill();g.fillStyle='#20211e';g.beginPath();g.arc(0,0,16,0,7);g.fill();g.strokeStyle='#ede5d1';g.lineWidth=3;g.beginPath();g.moveTo(6,0);g.lineTo(27,0);g.stroke();g.strokeStyle='#a9342e';g.lineWidth=2;g.beginPath();g.moveTo(-7,-10);g.lineTo(-18,-22);g.stroke();g.restore();
}
function draw(){ctx.clearRect(0,0,canvas._w,canvas._h);drawWorld();}
function drawMiniMap(){
  const s=Math.min(mini.width/WORLD.w,mini.height/WORLD.h),ox=(mini.width-WORLD.w*s)/2,oy=(mini.height-WORLD.h*s)/2;
  mctx.setTransform(1,0,0,1,0,0);mctx.clearRect(0,0,mini.width,mini.height);drawWorld(mctx,s,ox,oy);
  mctx.fillStyle='#fff';mctx.beginPath();mctx.arc(ox+player.x*s,oy+player.y*s,6,0,7);mctx.fill();mctx.strokeStyle='#bd3a31';mctx.lineWidth=2;mctx.stroke();
}
function loop(t){const dt=Math.min((t-last)/1000,.033);last=t;update(dt);draw();requestAnimationFrame(loop);}
showZone(0);requestAnimationFrame(loop);
