const $=id=>document.getElementById(id),KEY="rp-v2",TOK="rp-token";
const LISTS={
 exp:[["role","Job title"],["company","Company"],["dates","Dates (e.g. 2022 - Present)"],["desc","What did you do?","t"]],
 edu:[["degree","Degree"],["school","School or university"],["dates","Dates"]],
 proj:[["name","Project name"],["link","Link (optional)"],["desc","What is it?","t"]],
 cert:[["name","Certificate"],["issuer","Issued by"],["year","Year"]]};
const newItem=k=>Object.fromEntries(LISTS[k].map(f=>[f[0],""]));
const blank=()=>({name:"",title:"",email:"",phone:"",city:"",link:"",summary:"",skills:"",langs:"",photo:"",father:"",dob:"",nat:"",mar:"",refs:"",tpl:"classic",ac:"#6d4aff",font:"sans",size:"m",
 exp:[newItem("exp")],edu:[newItem("edu")],proj:[],cert:[]});
const SAMPLE={name:"Ayesha Khan",title:"Graphic Designer",email:"ayesha@example.com",phone:"0300 1234567",city:"Faisalabad",link:"behance.net/ayesha",father:"Muhammad Khan",dob:"15 March 2000",nat:"Pakistani",mar:"Single",refs:"Available on request",
 summary:"Creative designer with 3 years of experience in branding and social media design. I like turning ideas into clean, useful visuals that help small businesses grow.",
 skills:"Photoshop, Illustrator, Figma, Communication",langs:"Urdu, English, Punjabi",
 exp:[{role:"Graphic Designer",company:"Pixel Studio",dates:"2023 - Present",desc:"Designed logos and social posts for 20+ clients.\nCut delivery time by 30% with reusable templates."}],
 edu:[{degree:"BS Visual Arts",school:"GC University Faisalabad",dates:"2019 - 2023"}],
 proj:[{name:"Local Cafe Rebrand",link:"behance.net/cafe",desc:"Logo, menu and packaging for a local cafe."}],
 cert:[{name:"Google UX Design",issuer:"Coursera",year:"2023"}]};
const COLORS=["#6d4aff","#2563eb","#0d9488","#e11d74","#f97316"];
let S=blank(),token=null,timer,tt,hT,hist=[],hi=-1;
try{Object.assign(S,JSON.parse(localStorage.getItem(KEY)||"{}"));token=localStorage.getItem(TOK)}catch(e){}
const esc=t=>String(t||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function toast(m){const t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on"),2400)}
addEventListener("error",e=>toast("Error: "+e.message));
function ask(msg){return new Promise(r=>{const d=$("ask");$("askMsg").textContent=msg;const done=v=>{d.close();r(v)};$("askYes").onclick=()=>done(true);$("askNo").onclick=()=>done(false);d.oncancel=()=>r(false);d.showModal()})}
async function api(p,m,b){
 const r=await fetch("/api"+p,{method:m||"GET",headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},body:b?JSON.stringify(b):undefined});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Something went wrong");return d}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}if(token){clearTimeout(timer);timer=setTimeout(cloud,1200)}}
function snap(){const j=JSON.stringify(S);if(hist[hi]===j)return;hist=hist.slice(0,hi+1);hist.push(j);if(hist.length>60)hist.shift();hi=hist.length-1}
function save(){persist();clearTimeout(hT);hT=setTimeout(snap,500)}
function go(d){snap();const n=hi+d;if(n<0||n>=hist.length)return toast(d<0?"Nothing to undo":"Nothing to redo");hi=n;S=Object.assign(blank(),JSON.parse(hist[hi]));persist();all()}
async function cloud(){try{await api("/resume","PUT",S);toast("Saved to your account")}catch(e){toast("Server not reachable. Saved on this device.")}}
function buildList(k,n){
 $(k).innerHTML=S[k].map((it,i)=>`<div class="entry${i===n?" new":""}">`+LISTS[k].map(f=>{
  const id=k+i+f[0],a=`id="${id}" data-l="${k}" data-i="${i}" data-f="${f[0]}"`;
  return `<label for="${id}">${f[1]}</label>`+(f[2]?`<textarea ${a}>${esc(it[f[0]])}</textarea><button type="button" class="ai-btn" data-ai="${k}:${i}:${f[0]}">&#10024; Write for me</button>`:`<input ${a} value="${esc(it[f[0]])}">`)}).join("")+
  `<div class="act"><button class="ghost sm" data-mv="${k}" data-i="${i}" data-d="-1" aria-label="Move up">&uarr;</button><button class="ghost sm" data-mv="${k}" data-i="${i}" data-d="1" aria-label="Move down">&darr;</button><button class="ghost sm" data-rm="${k}" data-i="${i}">Remove</button></div></div>`).join("")}
const pdl=()=>[["Father's name",S.father],["Date of birth",S.dob],["Nationality",S.nat],["Marital status",S.mar]].filter(x=>x[1]);
function data(){const list=s=>s.split(",").map(x=>x.trim()).filter(Boolean),has=(a,f)=>a.filter(e=>f.some(x=>e[x]));
 return{c:[S.email,S.phone,S.city,S.link].filter(Boolean),sk:list(S.skills),lg:list(S.langs),ex:has(S.exp,["role","company","desc"]),ed:has(S.edu,["degree","school"]),pr:has(S.proj,["name","desc"]),ce:has(S.cert,["name"])}}
function preview(){
 const p=$("paper");p.className="paper "+S.tpl+" f-"+S.font;p.style.setProperty("--ac",S.ac);p.style.setProperty("--z",{s:.92,m:1,l:1.1}[S.size]||1);
 const{c,sk,lg,ex,ed,pr,ce}=data(),chips=a=>`<div class="chips">${a.map(x=>`<span>${esc(x)}</span>`).join("")}</div>`;
 p.innerHTML=`<header>${S.photo?`<img src="${S.photo}" alt="">`:""}<div><h3>${esc(S.name)||'<span class="ph">Your name</span>'}</h3><div class="role">${esc(S.title)}</div></div></header>
 <div class="cols"><aside>${c.length?"<h4>Contact</h4>"+c.map(x=>`<div>${esc(x)}</div>`).join(""):""}${sk.length?"<h4>Skills</h4>"+chips(sk):""}${lg.length?"<h4>Languages</h4>"+chips(lg):""}</aside>
 <div>${S.summary?`<h4>About me</h4><p>${esc(S.summary)}</p>`:""}
 ${ex.length?"<h4>Experience</h4>"+ex.map(e=>`<div class="it"><div class="tp">${esc(e.role)}<span>${esc(e.dates)}</span></div><div>${esc(e.company)}</div><p>${esc(e.desc)}</p></div>`).join(""):""}
 ${pr.length?"<h4>Projects</h4>"+pr.map(e=>`<div class="it"><div class="tp">${esc(e.name)}<span>${esc(e.link)}</span></div><p>${esc(e.desc)}</p></div>`).join(""):""}
 ${ed.length?"<h4>Education</h4>"+ed.map(e=>`<div class="it"><div class="tp">${esc(e.degree)}<span>${esc(e.dates)}</span></div><div>${esc(e.school)}</div></div>`).join(""):""}
 ${ce.length?"<h4>Certifications</h4>"+ce.map(e=>`<div class="it"><div class="tp">${esc(e.name)}<span>${esc(e.year)}</span></div><div>${esc(e.issuer)}</div></div>`).join(""):""}
 ${pdl().length?"<h4>Personal details</h4>"+pdl().map(x=>`<div><b>${x[0]}:</b> ${esc(x[1])}</div>`).join(""):""}${S.refs?`<h4>References</h4><p>${esc(S.refs)}</p>`:""}</div></div>`;
 const ok=[S.name,S.title,S.email,S.phone,S.summary,S.skills,S.exp.some(e=>e.role),S.edu.some(e=>e.degree)].filter(Boolean).length,pc=Math.round(ok/8*100),n=S.summary.length;
 $("prog").style.width=pc+"%";$("pct").textContent=pc+"% complete";
 $("tip").textContent=n+" characters. A good summary is 200 to 450.";$("tip").className="tip"+(n>=150&&n<=500?" ok":"");
 $("ph").src=S.photo||"";if(!S.photo)$("ph").removeAttribute("src");
 document.querySelectorAll("#sw button").forEach(b=>b.classList.toggle("on",b.dataset.c===S.ac));
 document.querySelectorAll("#tpl button").forEach(b=>b.classList.toggle("on",b.dataset.t===S.tpl));
 nextStep();
 document.querySelectorAll("#size button").forEach(b=>b.classList.toggle("on",b.dataset.z===S.size))}
function all(){document.querySelectorAll("[data-k]").forEach(e=>e.value=S[e.dataset.k]||"");$("font").value=S.font;Object.keys(LISTS).forEach(k=>buildList(k));preview()}
$("sw").innerHTML=COLORS.map(c=>`<button data-c="${c}" style="background:${c}" aria-label="Colour ${c}"></button>`).join("");
$("sw").onclick=e=>{if(e.target.dataset.c){S.ac=e.target.dataset.c;save();preview()}};
$("tpl").onclick=e=>{const t=e.target.dataset.t;if(!t)return;S.tpl=t;save();preview();const p=$("paper");p.style.animation="none";void p.offsetWidth;p.style.animation=""};
$("size").onclick=e=>{if(e.target.dataset.z){S.size=e.target.dataset.z;save();preview()}};
$("font").onchange=e=>{S.font=e.target.value;save();preview()};
document.addEventListener("input",e=>{const t=e.target;
 if(t.dataset.k)S[t.dataset.k]=t.value;else if(t.dataset.l)S[t.dataset.l][+t.dataset.i][t.dataset.f]=t.value;else return;save();preview()});
document.addEventListener("click",e=>{const d=e.target.dataset;
 if(d.rm){S[d.rm].splice(+d.i,1);save();buildList(d.rm);preview()}
 else if(d.mv){const a=S[d.mv],i=+d.i,j=i+ +d.d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];save();buildList(d.mv,j);preview()}
 else if(d.add){S[d.add].push(newItem(d.add));save();buildList(d.add,S[d.add].length-1)}
 else if(d.ai)openAI(d.ai)});
$("undo").onclick=()=>go(-1);$("redo").onclick=()=>go(1);
async function loadSample(){if(S.name&&!await ask("Replace your details with the sample? You can press Undo to get them back."))return false;snap();S=Object.assign(blank(),SAMPLE,{tpl:S.tpl,ac:S.ac,font:S.font,size:S.size});save();all();toast("Sample loaded. Click any field to change it.");return true}
$("sample").onclick=loadSample;
$("clear").onclick=async()=>{if(!await ask("Clear everything? You can press Undo to get it back."))return;snap();S=Object.assign(blank(),{tpl:S.tpl,ac:S.ac,font:S.font,size:S.size});save();all()};
$("print").onclick=async()=>{if(!S.name){toast("Add your name first");return $("name").focus()}
 const b=$("print"),old=b.textContent;b.disabled=true;b.textContent="Preparing PDF...";
 try{await saveFile(fname()+".pdf",await makePdf())}catch(e){console.error(e);toast("Could not make the PDF. Opening print instead.");window.print()}
 finally{b.disabled=false;b.textContent=old}};
function nextStep(){const s=[[S.name,"name","your name"],[S.title,"title","your job title"],[S.email,"email","your email"],[S.phone,"phone","your phone number"],[S.summary,"summary","a short summary about you"],[S.exp.some(e=>e.role),"exp0role","your work experience"],[S.edu.some(e=>e.degree),"edu0degree","your education"],[S.skills,"skills","your skills"]].find(x=>!x[0]),b=$("next");
 if(!s){b.textContent="All set. Download your PDF";b.dataset.f="";b.className="next done"}else{b.textContent="Next: add "+s[2];b.dataset.f=s[1];b.className="next"}}
$("next").onclick=()=>{const f=$("next").dataset.f;if(!f)return $("print").click();let el=$(f);
 if(!el){const k=f.slice(0,3);S[k].push(newItem(k));buildList(k);el=$(f)}
 document.querySelector('.tabs button[data-v="edit"]').click();el.closest("details").open=true;el.focus();el.scrollIntoView({behavior:"smooth",block:"center"})};
$("help").onclick=()=>$("guide").showModal();$("gClose").onclick=()=>$("guide").close();
$("gSample").onclick=async()=>{$("guide").close();await loadSample()};
try{if(!localStorage.getItem("rp-seen")){localStorage.setItem("rp-seen","1");setTimeout(()=>$("guide").showModal(),500)}}catch(e){}
$("rmph").onclick=()=>{S.photo="";save();preview()};
$("file").onchange=e=>{const f=e.target.files[0];if(!f)return;const im=new Image();im.onload=()=>{
 const c=document.createElement("canvas"),s=Math.min(im.width,im.height);c.width=c.height=240;
 c.getContext("2d").drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,240,240);S.photo=c.toDataURL("image/jpeg",.82);save();preview()};
 im.src=URL.createObjectURL(f)};
let DL=null,AI=null;
if(window.claude&&claude.use){claude.use("downloads").then(d=>{DL=d}).catch(()=>{});claude.use("sample").then(s=>{AI=s;if(s)document.body.classList.add("ai")}).catch(()=>{})}
async function saveFile(name,blob){
 if(DL){try{await DL.save({filename:name,data:blob});toast("Saved: "+name)}catch(e){toast(e&&e.code==="declined"?"Download cancelled":"Could not save the file here")}return}
 if(window.self!==window.top&&window.claude){return toast("Downloads are not available in this view. Open the page in its own tab.")}
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast("Downloaded: "+name)}
const dl=(name,type,text)=>saveFile(name,new Blob([text],{type}));
const lat=s=>{const b=new Uint8Array(s.length);for(let i=0;i<s.length;i++)b[i]=s.charCodeAt(i)&255;return b};
async function makePdf(){
 const p=$("paper"),W=794,VW=1000,PW=595,PH=842,M=28,k=PW/W;
 const css=[...document.styleSheets].map(s=>{try{return[...s.cssRules].map(x=>x.cssText).join("\n")}catch(e){return""}}).join("\n");
 const fr=document.createElement("iframe");fr.style.cssText="position:fixed;left:-10000px;top:0;width:"+VW+"px;height:2400px;border:0;pointer-events:none";
 fr.srcdoc='<!doctype html><html><head><meta charset="utf-8"><style>'+css+'</style></head><body style="margin:0;padding:0;background:#fff"><div id="w" style="width:'+W+'px"></div></body></html>';
 const loaded=new Promise(r=>{fr.onload=r});document.body.appendChild(fr);await loaded;
 const d=fr.contentDocument,w=d.getElementById("w"),c=d.importNode(p,true);
 c.style.cssText=p.style.cssText+";animation:none;transition:none;box-shadow:none;margin:0;transform:none;min-height:0;width:"+W+"px";w.appendChild(c);
 try{
  const cr=c.getBoundingClientRect(),H=Math.ceil(cr.height),top=cr.top;
  const cuts=[...c.querySelectorAll("h4,.it")].map(e=>e.getBoundingClientRect().top-top).filter(y=>y>20);
  const words=[],tw=d.createTreeWalker(c,NodeFilter.SHOW_TEXT);let n;
  while(n=tw.nextNode()){const fs=parseFloat(fr.contentWindow.getComputedStyle(n.parentNode).fontSize),re=/\S+/g;let m;
   while(m=re.exec(n.data)){const r=d.createRange();r.setStart(n,m.index);r.setEnd(n,m.index+m[0].length);const b=r.getBoundingClientRect();
    if(b.width>0)words.push({t:m[0],x:b.left-cr.left,y:b.top-top,h:b.height,fs})}}
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${VW}" height="${H}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${css}</style>${new XMLSerializer().serializeToString(w)}</div></foreignObject></svg>`;
  const img=new Image();img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg);await img.decode();
  const S2=2,full=document.createElement("canvas");full.width=W*S2;full.height=H*S2;const g=full.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,full.width,full.height);g.drawImage(img,0,0,VW*S2,H*S2);
  const avail=(PH-2*M)/k,pages=[];let s=0;
  while(s<H-1){let e=Math.min(H,s+avail);if(e<H){const ok=cuts.filter(y=>y<=e&&y>s+avail*.45);if(ok.length)e=Math.max(...ok)}
   const pc=document.createElement("canvas");pc.width=W*S2;pc.height=Math.ceil((e-s)*S2);const pg=pc.getContext("2d");pg.fillStyle="#fff";pg.fillRect(0,0,pc.width,pc.height);
   pg.drawImage(full,0,s*S2,W*S2,(e-s)*S2,0,0,W*S2,(e-s)*S2);
   const b64=pc.toDataURL("image/jpeg",.92).split(",")[1],bin=atob(b64),jpg=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)jpg[i]=bin.charCodeAt(i);
   pages.push({jpg,w:pc.width,h:pc.height,hp:(e-s)*k,s,e});s=e}
  const parts=[],offs=[];let len=0;const add=x=>{const b=typeof x==="string"?lat(x):x;parts.push(b);len+=b.length},obj=(i,body)=>{offs[i]=len;add(i+" 0 obj\n"+body+"\nendobj\n")};
  add("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  obj(1,"<< /Type /Catalog /Pages 2 0 R >>");obj(2,"<< /Type /Pages /Count "+pages.length+" /Kids ["+pages.map((_,i)=>(3+3*i)+" 0 R").join(" ")+"] >>");
  pages.forEach((pg,i)=>{const po=3+3*i,co=po+1,io=po+2;
   const inv=words.filter(w=>w.y>=pg.s-1&&w.y<pg.e-1).map(w=>{const y=PH-M-((w.y+w.h*.8)-pg.s)*k,t=w.t.replace(/[^\x20-\xFF]/g,"?").replace(/([\\()])/g,"\\$1");
    return `BT /F1 ${(w.fs*k).toFixed(2)} Tf 3 Tr ${(w.x*k).toFixed(2)} ${y.toFixed(2)} Td (${t}) Tj ET`}).join("\n");
   const cs=`q ${PW} 0 0 ${pg.hp.toFixed(2)} 0 ${(PH-M-pg.hp).toFixed(2)} cm /Im0 Do Q\n${inv}\n`;
   obj(po,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 ${io} 0 R >> /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >> >> >> /Contents ${co} 0 R >>`);
   obj(co,`<< /Length ${cs.length} >>\nstream\n${cs}endstream`);
   offs[io]=len;add(`${io} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pg.w} /Height ${pg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.jpg.length} >>\nstream\n`);add(pg.jpg);add("\nendstream\nendobj\n")});
  const N=3+3*pages.length,xr=len;let x="xref\n0 "+N+"\n0000000000 65535 f \n";for(let i=1;i<N;i++)x+=String(offs[i]).padStart(10,"0")+" 00000 n \n";
  add(x+"trailer\n<< /Size "+N+" /Root 1 0 R >>\nstartxref\n"+xr+"\n%%EOF");
  return new Blob(parts,{type:"application/pdf"});
 }finally{fr.remove()}}
const crcT=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc=b=>{let c=-1;for(let i=0;i<b.length;i++)c=crcT[(c^b[i])&255]^(c>>>8);return(c^-1)>>>0};
function zip(files,type){const en=new TextEncoder(),out=[],cd=[];let off=0;const u2=n=>[n&255,n>>8&255],u4=n=>[n&255,n>>8&255,n>>16&255,n>>>24&255];
 files.forEach(([name,txt])=>{const nb=en.encode(name),d=en.encode(txt),c=crc(d),sz=u4(d.length);
  const lh=new Uint8Array([0x50,0x4b,3,4,...u2(20),...u2(0x0800),0,0,0,0,0,0x21,...u4(c),...sz,...sz,...u2(nb.length),0,0]);out.push(lh,nb,d);
  cd.push(new Uint8Array([0x50,0x4b,1,2,...u2(20),...u2(20),...u2(0x0800),0,0,0,0,0,0x21,...u4(c),...sz,...sz,...u2(nb.length),0,0,0,0,0,0,0,0,0,0,0,0,...u4(off)]),nb);off+=lh.length+nb.length+d.length});
 const cl=cd.reduce((a,b)=>a+b.length,0);return new Blob([...out,...cd,new Uint8Array([0x50,0x4b,5,6,0,0,0,0,...u2(files.length),...u2(files.length),...u4(cl),...u4(off),0,0])],{type})}
const xe=t=>String(t||"").replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,"");
function makeDocx(){const{c,sk,lg,ex,ed,pr,ce}=data(),col=S.ac.slice(1).toUpperCase();
 const P=(t,o={})=>`<w:p><w:pPr>${o.bd?`<w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="${col}"/></w:pBdr>`:""}<w:spacing w:before="${o.bf||0}" w:after="${o.af??60}"/></w:pPr><w:r><w:rPr>${o.b?"<w:b/>":""}${o.c?`<w:color w:val="${o.c}"/>`:""}<w:sz w:val="${o.sz||22}"/></w:rPr><w:t xml:space="preserve">${xe(t)}</w:t></w:r></w:p>`;
 const H=t=>P(t.toUpperCase(),{b:1,c:col,sz:22,bd:1,bf:200,af:80}),lines=t=>String(t||"").split("\n").filter(x=>x.trim()).map(x=>P(x.trim().startsWith("•")?x.trim():"• "+x.trim())).join("");
 const row=(a,b)=>P(a+(b?"   |   "+b:""),{b:1,af:20});
 let d=P(S.name||"Your name",{b:1,c:col,sz:40,af:20})+(S.title?P(S.title,{sz:26,af:40}):"")+(c.length?P(c.join("   |   "),{c:"555555",af:120}):"");
 if(S.summary)d+=H("About me")+P(S.summary);
 if(ex.length)d+=H("Experience")+ex.map(e=>row(e.role,e.dates)+(e.company?P(e.company,{c:"555555",af:20}):"")+(String(e.desc||"").includes("\n")?lines(e.desc):P(e.desc))).join("");
 if(pr.length)d+=H("Projects")+pr.map(e=>row(e.name,e.link)+P(e.desc)).join("");
 if(ed.length)d+=H("Education")+ed.map(e=>row(e.degree,e.dates)+P(e.school,{c:"555555"})).join("");
 if(ce.length)d+=H("Certifications")+ce.map(e=>row(e.name,e.year)+P(e.issuer,{c:"555555"})).join("");
 if(sk.length)d+=H("Skills")+P(sk.join(", "));if(lg.length)d+=H("Languages")+P(lg.join(", "));
 if(pdl().length)d+=H("Personal details")+pdl().map(x=>P(x[0]+": "+x[1])).join("");if(S.refs)d+=H("References")+P(S.refs);
 const ns='xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
 return zip([["[Content_Types].xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
 ["_rels/.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
 ["word/document.xml",`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${ns}><w:body>${d}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1000" w:right="1000" w:bottom="1000" w:left="1000" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr></w:body></w:document>`]],"application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
let aiT=null,aiCtl=null;
function openAI(t){aiT=t;$("aiIn").value="";$("aiOut").value="";$("aiErr").textContent="";$("aiDlg").showModal()}
async function aiRun(){const t=aiT,txt=$("aiIn").value.trim();if(!AI)return;if(!txt){$("aiErr").textContent="Please write a few words first.";return}
 const sum=t==="summary",[k,i,f]=sum?[]:t.split(":"),it=sum?null:S[k][+i];
 const ctx=sum?`Job title: ${S.title||"not given"}. Skills: ${S.skills||"not given"}.`:`Job title: ${it.role||"not given"}. Company: ${it.company||"not given"}.`;
 const prompt=`You are a professional CV writer. The user describes their own experience in Urdu, Roman Urdu or English. ${sum?"Write a professional summary of 2 to 3 sentences, without starting with the word I.":"Write 3 to 4 short bullet points. Each starts with a strong action verb, has at most 18 words, and is on its own line starting with '- '."} Use simple, clear professional English. Use only the facts the user gave. Never invent numbers, employers, degrees or skills. Output only the text.\n${ctx}\nUser's words: ${txt}`;
 $("aiGo").disabled=true;$("aiErr").textContent="";aiCtl=new AbortController();
 try{await AI(prompt,{modelTier:"quick",cache:false,signal:aiCtl.signal,onText:({text})=>{$("aiOut").value=text.replace(/^\s*[-*]\s+/gm,"• ")}})}
 catch(e){$("aiErr").textContent=e&&e.code==="not_granted"?"Permission was not given.":e&&e.code==="rate_limited"?"Too many requests. Please wait a moment.":e&&e.code==="cancelled"?"":"Could not write right now. Please try again."}
 finally{$("aiGo").disabled=false}}
$("aiGo").onclick=aiRun;$("aiClose").onclick=()=>{if(aiCtl)aiCtl.abort();$("aiDlg").close()};
$("aiUse").onclick=()=>{const v=$("aiOut").value.trim();if(!v)return;const t=aiT;
 if(t==="summary"){S.summary=v;$("summary").value=v}else{const[k,i,f]=t.split(":");S[k][+i][f]=v;const el=$(k+i+f);if(el)el.value=v}
 save();preview();$("aiDlg").close();toast("Text added. You can still edit it.")};
$("prn").onclick=()=>{const t=document.title;document.title=(S.name||"Resume")+" - Resume";window.print();setTimeout(()=>document.title=t,1000)};
const fname=()=>(S.name||"resume").trim().replace(/\s+/g,"-");
$("bk").onclick=()=>dl(fname()+".json","application/json",JSON.stringify(S));
$("rs").onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{S=Object.assign(blank(),JSON.parse(t));save();all();toast("Backup loaded")}catch(x){toast("This file is not a valid backup")}});e.target.value=""};
$("word").onclick=()=>saveFile(fname()+".docx",makeDocx());
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{document.body.classList.toggle("pv",b.dataset.v==="prev");
 document.querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("on",x===b));scrollTo(0,0)});
function setLogin(){$("login").textContent=token?"Logout":"Login"}
$("login").onclick=()=>{if(token){token=null;localStorage.removeItem(TOK);setLogin();toast("Logged out")}else{$("err").textContent="";$("dlg").showModal()}};
$("cancel").onclick=()=>$("dlg").close();
async function doAuth(kind){try{const d=await api("/"+kind,"POST",{email:$("em").value,password:$("pw").value});
 token=d.token;localStorage.setItem(TOK,token);$("dlg").close();setLogin();
 const r=await api("/resume");if(r.resume){S=Object.assign(blank(),r.resume);persist();all();toast("Welcome back")}else{await cloud()}}
 catch(e){$("err").textContent=e.message==="Failed to fetch"?"Server is not running.":e.message}}
$("doLogin").onclick=()=>doAuth("login");$("doReg").onclick=()=>doAuth("register");
setLogin();all();snap();
let server=false;
function noServer(){$("login").hidden=true;const t=$("tipLogin");if(t)t.hidden=true}
if(location.protocol==="file:")noServer();
else fetch("/api/health").then(r=>r.json()).then(j=>{if(!j.ok)throw 0;server=true;
  if(token)return api("/resume").then(r=>{if(r.resume){S=Object.assign(blank(),r.resume);persist();all();snap()}})}).catch(()=>{if(!server)noServer()});
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
