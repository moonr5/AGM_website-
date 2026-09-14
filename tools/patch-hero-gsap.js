const fs = require("fs");

const heroPath =
  "hubfs/146466316/raw_assets/homepage/179/js_client_assets/assets/island-DKwCZMR6.js";

const oldStart =
  "B(()=>{if(!m||!a.current)return;const s=u.current,p=l.current,v=n?H:O;o.current.forEach((w,C)=>{const x=v[C];b.set(w,{x:x.x,y:x.y,scale:n?.6:1,opacity:1,zIndex:x.z??1})}),b.set(s,{opacity:0,pointerEvents:\"none\"});const k=b.timeline({defaults:{ease:\"power3.inOut\",duration:3,delay:.5}}),L=b.timeline({scrollTrigger:{trigger:a.current,start:\"top top\",scrub:!0,pin:!0,onEnterBack:()=>i(!0),onLeave:()=>i(!1)}});o.current.forEach((w,C)=>{const x=n?H[C]:O[C];k.to(w,{x:0,y:0,scale:x.z===13?2:.5,ease:\"power3.inOut\"},\"boxesStart\")}),k.to(c.current,{opacity:0,scale:.8,ease:\"power3.inOut\",duration:2.5},\"boxesStart\"),k.to(s,{opacity:1,ease:\"power2.inOut\",pointerEvents:\"auto\",duration:.1},\"overlayStart\").call(()=>{$e(),i(!0)});function _(){L.to(p,{zIndex:999,position:\"absolute\",left:0,right:0,height:\"100vh\",ease:\"none\"},\"manifestStart\")}n?_():k.fromTo(p,{height:\"100vh\",left:0,right:0},{height:n?\"150px\":\"190px\",left:n?\"24px\":\"80px\",right:n?\"24px\":\"80px\",duration:1.25,ease:\"power2.inOut\"},\"overlayStart-=0.2\").call(()=>{_()})},[m,n])";

const newStart =
  "B(()=>{if(!m||!a.current)return;requestAnimationFrame(()=>{if(!a.current)return;const s=u.current,p=l.current;if(!s||!p||!c.current)return;const v=n?H:O;o.current.forEach((w,C)=>{if(!w)return;const x=v[C];b.set(w,{x:x.x,y:x.y,scale:n?.6:1,opacity:1,zIndex:x.z??1})}),b.set(s,{opacity:0,pointerEvents:\"none\"});const k=b.timeline({defaults:{ease:\"power3.inOut\",duration:3,delay:.5}}),L=b.timeline({scrollTrigger:{trigger:a.current,start:\"top top\",scrub:!0,pin:!0,onEnterBack:()=>i(!0),onLeave:()=>i(!1)}});o.current.forEach((w,C)=>{if(!w)return;const x=n?H[C]:O[C];k.to(w,{x:0,y:0,scale:x.z===13?2:.5,ease:\"power3.inOut\"},\"boxesStart\")}),k.to(c.current,{opacity:0,scale:.8,ease:\"power3.inOut\",duration:2.5},\"boxesStart\"),k.to(s,{opacity:1,ease:\"power2.inOut\",pointerEvents:\"auto\",duration:.1},\"overlayStart\").call(()=>{$e(),i(!0)});function _(){L.to(p,{zIndex:999,position:\"absolute\",left:0,right:0,height:\"100vh\",ease:\"none\"},\"manifestStart\")}n?_():k.fromTo(p,{height:\"100vh\",left:0,right:0},{height:n?\"150px\":\"190px\",left:n?\"24px\":\"80px\",right:n?\"24px\":\"80px\",duration:1.25,ease:\"power2.inOut\"},\"overlayStart-=0.2\").call(()=>{_()})})},[m,n])";

let hero = fs.readFileSync(heroPath, "utf8");
if (hero.charCodeAt(0) === 0xfeff) hero = hero.slice(1);

if (!hero.includes(oldStart)) {
  console.error("hero patch target not found");
  process.exit(1);
}

hero = hero.replace(oldStart, newStart);
fs.writeFileSync(heroPath, hero, "utf8");
console.log("patched hero GSAP null guards");
