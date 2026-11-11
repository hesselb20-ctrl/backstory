import type { DecisionIndex } from "./types.js";

/**
 * Palette and type scale. The README images and the tutorial video use the
 * same values (see tutorial/src/theme.ts).
 */
const CSS = `
:root{
  --ink:#12131A;--panel:#1B1D28;--raised:#232636;--line:#2E3145;
  --paper:#F3EEE3;--muted:#A3A5B8;--faint:#6E7188;
  --amber:#F2B34C;--teal:#5CC8B8;--red:#EF6F6C;--violet:#A594FF;--blue:#6FA8FF;--green:#8FD18A;
  --serif:"Fraunces","Iowan Old Style","Palatino Linotype",Georgia,serif;
  --sans:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --mono:"JetBrains Mono",ui-monospace,"Cascadia Code",Consolas,monospace;
  --t12:12px;--t14:14px;--t16:16px;--t20:20px;--t25:25px;--t31:31px;
}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{background:var(--ink);color:var(--paper);font:var(--t14)/1.55 var(--sans);-webkit-font-smoothing:antialiased}
a{color:var(--teal);text-decoration:none}a:hover{text-decoration:underline}
button{font:inherit;color:inherit;cursor:pointer}
.app{display:grid;grid-template-rows:auto auto 1fr;height:100%}
header{display:flex;align-items:baseline;gap:14px;padding:14px 22px;border-bottom:1px solid var(--line)}
.mark{font:600 var(--t25)/1 var(--serif);letter-spacing:-.01em}
.mark i{color:var(--amber);font-style:normal}
.repo{font:var(--t14) var(--mono);color:var(--muted)}
.count{margin-left:auto;color:var(--faint);font-size:var(--t12)}
.filters{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;padding:10px 22px;border-bottom:1px solid var(--line);background:var(--panel)}
.filters label{font-size:var(--t12);color:var(--faint);text-transform:uppercase;letter-spacing:.08em}
.filters input{background:var(--ink);border:1px solid var(--line);color:var(--paper);border-radius:6px;padding:6px 10px;font:var(--t14) var(--sans);min-width:0}
.filters input:focus{outline:2px solid var(--amber);outline-offset:1px}
#q{width:170px}#file{width:200px;font-family:var(--mono);font-size:var(--t12)}
.chip{border:1px solid var(--line);background:transparent;border-radius:999px;padding:3px 11px;font-size:var(--t12);color:var(--muted);white-space:nowrap}
.chip:hover{border-color:var(--muted)}
.chip[aria-pressed=true]{background:var(--amber);border-color:var(--amber);color:var(--ink);font-weight:600}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.group{display:flex;align-items:center;gap:8px}
.card code{font:var(--t14) var(--mono)}
.detail h1 code{font-size:.8em}
main{display:grid;grid-template-columns:minmax(300px,42%) 1fr;min-height:0}
.timeline{overflow:auto;padding:18px 18px 40px 22px;border-right:1px solid var(--line)}
.year{font:600 var(--t20)/1 var(--serif);color:var(--amber);margin:18px 0 10px 28px}
.year:first-child{margin-top:0}
.item{position:relative;display:block;width:100%;text-align:left;background:none;border:0;padding:0 0 10px 28px}
.item::before{content:"";position:absolute;left:6px;top:0;bottom:0;width:2px;background:var(--line)}
.dot{position:absolute;left:0;top:14px;width:14px;height:14px;border-radius:50%;background:var(--k);border:3px solid var(--ink);box-shadow:0 0 0 1px var(--k)}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 13px}
.item:hover .card{border-color:var(--faint)}
.item[aria-current=true] .card{border-color:var(--amber);background:var(--raised)}
.card h3{margin:2px 0 6px;font:600 var(--t16)/1.3 var(--serif)}
.meta{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;font-size:var(--t12);color:var(--faint)}
.meta .id{font-family:var(--mono);color:var(--muted)}
.tag{font-size:var(--t12);padding:1px 8px;border-radius:999px;background:color-mix(in srgb,var(--k) 16%,transparent);color:var(--k)}
.st-reverted,.st-superseded{color:var(--red)}
.empty{color:var(--faint);padding:30px 28px}
.detail{overflow:auto;padding:26px 34px 60px}
.detail .eyebrow{font:var(--t12) var(--mono);color:var(--amber);letter-spacing:.06em}
.detail h1{font:600 var(--t31)/1.18 var(--serif);margin:8px 0 14px;letter-spacing:-.01em}
.facts{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}
.fact{border:1px solid var(--line);border-radius:6px;padding:3px 9px;font-size:var(--t12);color:var(--muted)}
.fact b{color:var(--paper);font-weight:600}
.conf{display:inline-flex;gap:3px;vertical-align:middle;margin-right:6px}
.conf span{width:7px;height:7px;border-radius:50%;background:var(--line)}
.conf span.on{background:var(--amber)}
.detail p.why{color:var(--faint);font-size:var(--t14);line-height:1.5;margin:0 0 18px}
.detail h2{font:600 var(--t12) var(--sans);text-transform:uppercase;letter-spacing:.1em;color:var(--faint);margin:22px 0 6px}
.detail p{margin:0;font-size:var(--t16);line-height:1.6;max-width:68ch}
.detail ul{margin:0;padding-left:18px;font-size:var(--t14);max-width:72ch}
.detail li{margin:4px 0}
.detail code{font:var(--t12) var(--mono);background:var(--raised);padding:1px 5px;border-radius:4px}
.ev{list-style:none;padding:0!important}
.ev li{display:grid;grid-template-columns:74px 1fr;gap:10px;padding:6px 0;border-top:1px solid var(--line);font-size:var(--t14)}
.ev .t{font-size:var(--t12);color:var(--faint);text-transform:uppercase;letter-spacing:.08em;padding-top:2px}
.ev .r{font-family:var(--mono);font-size:var(--t12)}
.files{font:var(--t12)/1.7 var(--mono);color:var(--muted)}
footer{margin-top:28px;font-size:var(--t12);color:var(--faint)}
body.solo .filters,body.solo .timeline,body.solo header{display:none}
body.solo .app{display:block;height:auto}
body.solo main{display:block}
body.solo .detail{overflow:visible;margin:22px;padding:28px 32px;background:var(--panel);border:1px solid var(--line);border-radius:14px}
@media (max-width:820px){
  .app{height:auto;display:block}
  main{display:block}
  .timeline{border-right:0;overflow:visible}
  .detail{overflow:visible;border-top:1px solid var(--line);padding:22px}
}
`;

const JS = `
const data = JSON.parse(document.getElementById("data").textContent);
const KIND = {revert:"var(--red)",dependency:"var(--blue)",refactor:"var(--violet)",config:"var(--green)",comment:"var(--amber)",message:"var(--muted)"};
const ORDER = ["revert","dependency","refactor","config","comment","message"];
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const state = {id:"",area:"",kind:"",file:"",q:"",solo:false};
new URLSearchParams(location.hash.slice(1)).forEach((v,k) => { if (k in state) state[k] = k === "solo" ? v === "1" : v; });
const tick = s => esc(s).replace(/\`([^\`]+)\`/g,"<code>$1</code>");
const primary = d => ORDER.find(k => d.signals.includes(k)) || "message";
const count = (key) => { const m = new Map(); for (const d of data.decisions) for (const v of d[key]) m.set(v,(m.get(v)||0)+1); return [...m].sort((a,b)=>b[1]-a[1]); };

function matches(d){
  if (state.area && !d.areas.includes(state.area)) return false;
  if (state.kind && !d.signals.includes(state.kind)) return false;
  if (state.file){ const f = state.file.toLowerCase(); if (!d.files.some(x => x.toLowerCase().includes(f))) return false; }
  if (state.q){ const q = state.q.toLowerCase(); const hay = [d.title,d.context,d.decision,...d.alternatives,...d.consequences,...d.evidence.map(e=>e.ref+" "+e.title)].join(" ").toLowerCase(); if (!hay.includes(q)) return false; }
  return true;
}
function linkify(text, d){
  let html = esc(text);
  for (const e of d.evidence){
    if (!e.url || e.type === "comment") continue;
    const ref = esc(e.ref).replace(/[.*+?^\${}()|[\\]\\\\]/g,"\\\\$&");
    html = html.replace(new RegExp("(^|[^\\\\w/#\\">])("+ref+")(?![\\\\w<])","g"), (m,a,b) => a+'<a href="'+esc(e.url)+'" target="_blank" rel="noopener">'+(e.type==="commit"?"<code>"+b+"</code>":b)+"</a>");
  }
  return html.replace(/\`([^\`]+)\`/g,"<code>$1</code>");
}
function chips(el, items, key){
  el.innerHTML = items.map(([v,n]) => '<button class="chip" data-v="'+esc(v)+'" aria-pressed="'+(state[key]===v)+'">'+esc(v)+" "+n+"</button>").join("");
  el.onclick = e => { const b = e.target.closest(".chip"); if (!b) return; state[key] = state[key]===b.dataset.v ? "" : b.dataset.v; render(); };
}
function renderList(list){
  const el = document.getElementById("timeline");
  if (!list.length){ el.innerHTML = '<div class="empty">No decisions match these filters.</div>'; return; }
  let year = "", html = "";
  for (const d of [...list].reverse()){
    const y = d.date.slice(0,4);
    if (y !== year){ year = y; html += '<div class="year">'+y+"</div>"; }
    const k = primary(d);
    html += '<button class="item" data-id="'+d.id+'" aria-current="'+(d.id===state.id)+'" style="--k:'+KIND[k]+'"><span class="dot"></span><div class="card"><div class="meta"><span class="id">'+d.id+"</span><span>"+d.date+"</span>"+(d.status!=="active"?'<span class="st-'+d.status+'">'+d.status+"</span>":"")+"</div><h3>"+tick(d.title)+'</h3><div class="meta">'+d.signals.map(s=>'<span class="tag" style="--k:'+KIND[s]+'">'+s+"</span>").join("")+"<span>"+d.areas.map(esc).join(" · ")+"</span></div></div></button>";
  }
  el.innerHTML = html;
}
function renderDetail(d){
  const el = document.getElementById("detail");
  if (!d){ el.innerHTML = '<div class="empty">Pick a decision on the timeline.</div>'; return; }
  const level = {low:1,medium:2,high:3}[d.confidence];
  const list = (items, empty) => items.length ? "<ul>"+items.map(i=>"<li>"+linkify(i,d)+"</li>").join("")+"</ul>" : '<p style="color:var(--faint);font-size:var(--t14)">'+empty+"</p>";
  el.innerHTML =
    '<div class="eyebrow">ADR '+d.id+" · "+d.date+"</div><h1>"+tick(d.title)+"</h1>"+
    '<div class="facts"><span class="fact">Status <b>'+d.status+'</b></span><span class="fact"><span class="conf">'+[1,2,3].map(i=>'<span class="'+(i<=level?"on":"")+'"></span>').join("")+"</span>Confidence <b>"+d.confidence+"</b></span>"+d.signals.map(s=>'<span class="tag" style="--k:'+KIND[s]+';align-self:center">'+s+"</span>").join("")+"</div>"+
    '<p class="why">'+esc(d.confidenceReason)+"</p>"+
    "<h2>Context</h2><p>"+linkify(d.context,d)+"</p>"+
    "<h2>Decision</h2><p>"+linkify(d.decision,d)+"</p>"+
    "<h2>Alternatives tried</h2>"+list(d.alternatives,"None recorded in the history.")+
    "<h2>Consequences</h2>"+list(d.consequences,"None recorded in the history.")+
    '<h2>Evidence</h2><ul class="ev">'+d.evidence.map(e=>'<li><span class="t">'+e.type+'</span><span><span class="r">'+(e.url?'<a href="'+esc(e.url)+'" target="_blank" rel="noopener">'+esc(e.ref)+"</a>":esc(e.ref))+"</span> "+esc(e.title)+(e.date?' <span style="color:var(--faint)">'+e.date+"</span>":"")+"</span></li>").join("")+"</ul>"+
    (state.solo ? "" : '<h2>Files</h2><div class="files">'+d.files.slice(0,12).map(esc).join("<br>")+(d.files.length>12?"<br>… "+(d.files.length-12)+" more":"")+"</div>")+
    "<footer>"+esc(d.slug)+".md · written by "+esc(d.writtenBy)+"</footer>";
}
function render(){
  document.body.classList.toggle("solo", state.solo);
  const list = data.decisions.filter(matches);
  if (!list.some(d => d.id === state.id)) state.id = list.length ? list[list.length-1].id : "";
  chips(document.getElementById("areas"), count("areas").slice(0,8), "area");
  chips(document.getElementById("kinds"), count("signals"), "kind");
  renderList(list);
  renderDetail(data.decisions.find(d => d.id === state.id));
  document.getElementById("count").textContent = list.length+" of "+data.decisions.length+" decisions · "+data.repo.head.slice(0,7);
  const p = new URLSearchParams(); for (const k in state) if (state[k]) p.set(k, state[k]===true?"1":state[k]);
  history.replaceState(null,"","#"+p.toString());
  document.documentElement.dataset.height = document.documentElement.scrollHeight;
}
document.getElementById("timeline").onclick = e => { const b = e.target.closest(".item"); if (b){ state.id = b.dataset.id; render(); } };
for (const id of ["q","file"]){ const el = document.getElementById(id); el.value = state[id]; el.oninput = () => { state[id] = el.value.trim(); render(); }; }
document.getElementById("files").innerHTML = [...new Set(data.decisions.flatMap(d=>d.files))].sort().map(f=>'<option value="'+esc(f)+'">').join("");
document.getElementById("repo").textContent = data.repo.name;
render();
`;

/** One self-contained HTML file: data, styles and script inline, no network. */
export function renderViewer(index: DecisionIndex): string {
  const data = JSON.stringify(index).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Backstory: ${index.repo.name.replace(/[<&]/g, "")}</title>
<style>${CSS}</style>
</head>
<body>
<div class="app">
  <header><span class="mark">back<i>story</i></span><span class="repo" id="repo"></span><span class="count" id="count"></span></header>
  <div class="filters">
    <input id="q" type="search" placeholder="Search decisions" aria-label="Search decisions">
    <input id="file" type="search" list="files" placeholder="Filter by file path" aria-label="Filter by file path"><datalist id="files"></datalist>
    <div class="group"><label>Area</label><div class="chips" id="areas"></div></div>
    <div class="group"><label>Signal</label><div class="chips" id="kinds"></div></div>
  </div>
  <main>
    <nav class="timeline" id="timeline" aria-label="Decision timeline"></nav>
    <article class="detail" id="detail"></article>
  </main>
</div>
<script type="application/json" id="data">${data}</script>
<script>${JS}</script>
</body>
</html>
`;
}
