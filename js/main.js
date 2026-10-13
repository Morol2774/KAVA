(function(){
  var H=[["Sunday",9,18],["Monday",9,18],["Tuesday",8,19],["Wednesday",8,19],["Thursday",8,19],["Friday",8,19],["Saturday",9,18]];
  function fmt(h){var s=h>=12?"pm":"am";var x=h%12||12;return x+":00 "+s}
  var parts=[];
  try{parts=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Toronto",weekday:"long",hour:"numeric",minute:"numeric",hourCycle:"h23"}).formatToParts(new Date());}catch(e){}
  var get=function(t){var p=parts.find(function(x){return x.type===t});return p?p.value:null};
  var wd=get("weekday"), hr=+get("hour"), mi=+get("minute");
  var today=H.findIndex(function(d){return d[0]===wd}); if(today<0)today=new Date().getDay();
  var tb=document.getElementById("hours");
  [1,2,3,4,5,6,0].forEach(function(i){
    var d=H[i], tr=document.createElement("tr"); if(i===today)tr.className="today";
    tr.innerHTML="<td>"+d[0]+"</td><td>"+fmt(d[1])+" – "+fmt(d[2])+"</td>"; tb.appendChild(tr);
  });
  if(isNaN(hr))return;
  var t=hr+mi/60, d=H[today], el=document.getElementById("status"), tx=document.getElementById("status-text"), hh=document.getElementById("hero-hours");
  if(t>=d[1]&&t<d[2]){el.classList.add("open");tx.innerHTML="Open now <small>until "+fmt(d[2])+"</small>";hh.textContent="Open today until "+fmt(d[2]);}
  else{
    var n=t<d[1]?d:H[(today+1)%7], when=t<d[1]?"today":"tomorrow";
    tx.innerHTML="Closed <small>opens "+when+" "+fmt(n[1])+"</small>"; hh.textContent="Opens "+when+" at "+fmt(n[1]);
  }
})();
(function(){
  var root=document.documentElement, override=null, mq=null;
  try{mq=window.matchMedia("(prefers-color-scheme: dark)")}catch(e){}
  function torontoHour(){
    try{
      var p=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Toronto",hour:"numeric",minute:"numeric",hourCycle:"h23"}).formatToParts(new Date());
      return +p.find(function(x){return x.type==="hour"}).value + (+p.find(function(x){return x.type==="minute"}).value)/60;
    }catch(e){var d=new Date();return d.getHours()+d.getMinutes()/60}
  }
  function auto(){
    var dark=(mq&&mq.matches&&root.dataset.theme!=="light")||root.dataset.theme==="dark";
    if(dark)return "evening";
    var t=torontoHour();
    if(t>=5&&t<11)return "morning";
    if(t>=11&&t<16)return "day";
    return "evening";
  }
  function apply(){
    root.setAttribute("data-daypart",override||auto());
    document.querySelectorAll(".dp button").forEach(function(b){b.setAttribute("aria-pressed",String((override||"auto")===b.dataset.dp));});
  }
  document.querySelectorAll(".dp button").forEach(function(b){
    b.addEventListener("click",function(){override=b.dataset.dp==="auto"?null:b.dataset.dp;apply();});
  });
  if(mq&&mq.addEventListener)mq.addEventListener("change",apply);
  try{new MutationObserver(function(ms){ms.forEach(function(m){if(m.attributeName==="data-theme")apply()})}).observe(root,{attributes:true});}catch(e){}
  setInterval(apply,5*60*1000);
  apply();
})();
(function(){
  var reduce=false; try{reduce=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
  /* progress */
  var bar=document.getElementById("progress"), ticking=false;
  function prog(){ticking=false;var h=document.documentElement.scrollHeight-innerHeight;bar.style.transform="scaleX("+(h>0?Math.min(1,scrollY/h):0)+")";}
  addEventListener("scroll",function(){if(!ticking){ticking=true;requestAnimationFrame(prog)}},{passive:true}); prog();
  /* arch window */
  var win=document.getElementById("window"), cap=document.getElementById("window-cap"), names={seasonal:"Seasonal",medovyk:"Medovyk",croissant:"Croissants",espresso:"Espresso & milk",almond:"Almond cake",tarts:"Tarts",mojito:"Virgin mojito",tea:"Buckwheat tea",choc:"Hot chocolate"};
  function show(k){win.querySelectorAll("img").forEach(function(i){i.classList.toggle("on",i.dataset.key===k)});cap.textContent=names[k];}
  var items=document.querySelectorAll(".item[data-photo]");
  items.forEach(function(it){
    it.addEventListener("mouseenter",function(){show(it.dataset.photo)});
    it.addEventListener("click",function(){show(it.dataset.photo)});
  });
  var menu=document.querySelector(".menu");
  if(menu)menu.addEventListener("mouseleave",function(){show("seasonal")});
  /* words that reveal photos */
  var peek=document.getElementById("peek"), pimg=peek.querySelector("img"), x=0,y=0,raf=0;
  function place(){raf=0;peek.style.left=x+"px";peek.style.top=y+"px";}
  document.querySelectorAll(".reveal").forEach(function(w){
    w.addEventListener("mouseenter",function(e){pimg.src=w.dataset.img;pimg.style.objectPosition=w.dataset.pos||"50% 50%";x=e.clientX;y=e.clientY;place();peek.classList.add("on");});
    w.addEventListener("mousemove",function(e){x=e.clientX;y=e.clientY;if(!raf)raf=requestAnimationFrame(place);});
    w.addEventListener("mouseleave",function(){peek.classList.remove("on");});
  });
})();
(function(){
  /* Each hour plays for DUR ms, then moves on (loops). Click a segment to jump; button pauses.
     A slot can be <img> or <video muted loop playsinline preload="none" data-src="..." poster="...">; videos load only when their hour is shown. */
  var tl=document.getElementById("timeline"); if(!tl)return;
  var DUR=6000, cells=tl.querySelectorAll(".tl-cell"), caps=tl.querySelectorAll(".tl-cap"), segs=tl.querySelectorAll(".tl-seg"), btn=tl.querySelector(".tl-play"), n=caps.length;
  var cur=0, t=0, last=0, seen=false, user=false, raf=0;
  try{ if(matchMedia("(prefers-reduced-motion: reduce)").matches) user=true; }catch(e){}
  function media(i){var a=[];cells.forEach(function(c){a.push(c.querySelectorAll(".tl-img")[i])});return a}
  function play(i,on){media(i).forEach(function(m){if(m.tagName!=="VIDEO")return;if(on&&!user){if(!m.src&&m.dataset.src){var w="";try{w=m.canPlayType('video/webm; codecs="vp9"')}catch(e){}m.src=m.dataset.src+(w?".webm":".mp4")}var p=m.play();p&&p.catch&&p.catch(function(){})}else m.pause()})}
  function bars(){segs.forEach(function(s,k){s.style.setProperty("--f",k<cur?1:k>cur?0:(user?1:Math.min(1,t/DUR)).toFixed(3));s.classList.toggle("on",k===cur);s.setAttribute("aria-current",k===cur?"true":"false")})}
  function show(i){ if(i!==cur){cells.forEach(function(c){var im=c.querySelectorAll(".tl-img");im[cur].classList.remove("on");im[i].classList.add("on")});caps[cur].classList.remove("on");caps[i].classList.add("on");play(cur,false);cur=i;} t=0; play(cur,seen&&!document.hidden); bars(); }
  function running(){return seen&&!user&&!document.hidden}
  function loop(now){ raf=0; if(!running()){return} if(last)t+=now-last; last=now; if(t>=DUR){show((cur+1)%n)} else bars(); raf=requestAnimationFrame(loop) }
  function kick(){ last=0; if(running()&&!raf)raf=requestAnimationFrame(loop); bars() }
  segs.forEach(function(s,k){s.addEventListener("click",function(){show(k);kick()})});
  btn.addEventListener("click",function(){user=!user;btn.setAttribute("aria-pressed",user);btn.setAttribute("aria-label",user?"Play":"Pause");play(cur,seen&&!document.hidden);kick()});
  if("IntersectionObserver" in window){new IntersectionObserver(function(e){seen=e[0].isIntersecting;play(cur,seen);kick()},{threshold:.35}).observe(tl)}else{seen=true}
  document.addEventListener("visibilitychange",function(){play(cur,!document.hidden&&seen);kick()});
  if(user){btn.setAttribute("aria-pressed","true");btn.setAttribute("aria-label","Play")}
  show(0); kick();
})();
