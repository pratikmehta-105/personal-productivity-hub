const APPS = [
  ["📅","Google Calendar","Calendar, events & meetings","https://calendar.google.com"],
  ["✅","Google Tasks","Tasks & reminders","https://tasks.google.com"],
  ["📝","Google Keep","Notes & lists","https://keep.google.com"],
  ["📧","Gmail","Email","https://mail.google.com"],
  ["📁","Google Drive","Files & documents","https://drive.google.com"],
  ["👤","Google Contacts","Contacts","https://contacts.google.com"],
  ["🤖","NotebookLM","AI notebooks & research","https://notebooklm.google.com"],
  ["📒","Samsung Notes","Samsung Notes web access","https://samsungnotes.com/"],
  ["▶️","YouTube","Videos","https://www.youtube.com"],
  ["🎵","Spotify","Music & podcasts","https://open.spotify.com"],
  ["🗺️","Google Maps","Maps & places","https://www.google.com/maps"],
  ["🔐","Google Password Manager","Saved passwords","https://passwords.google.com"]
];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const get = (k, fallback) => { try { const v=localStorage.getItem(k); return v===null?fallback:JSON.parse(v); } catch { return fallback; } };
const set = (k,v) => localStorage.setItem(k, JSON.stringify(v));

let tasks = get("pph_tasks", []);
let notes = get("pph_notes", []);
let settings = get("pph_settings", {name:"", theme:"light", startPage:"home"});

function openUrl(url){ window.open(url, "_blank", "noopener,noreferrer"); }
function today(){
  const d=new Date();
  return d.toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
}
function showSection(id){
  $$(".section").forEach(x=>x.classList.toggle("active",x.id===id));
  $$(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.section===id));
  const titles={home:"Good day 👋",apps:"My Apps",notes:"Quick Notes",tasks:"Quick Tasks",tools:"Tools",settings:"Settings"};
  $("#pageTitle").textContent = settings.name && id==="home" ? `Good day, ${settings.name} 👋` : titles[id];
  $("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderApps(){
  $("#appGrid").innerHTML=APPS.map(a=>`<article class="card app-card"><div class="app-icon">${a[0]}</div><main><h3>${a[1]}</h3><p>${a[2]}</p></main><button data-url="${a[3]}">Open ↗</button></article>`).join("");
  $$("#appGrid [data-url]").forEach(b=>b.onclick=()=>openUrl(b.dataset.url));
}
function renderTasks(){
  $("#taskList").innerHTML=tasks.length?tasks.map((t,i)=>`<div class="task-row ${t.done?"done":""}"><input type="checkbox" ${t.done?"checked":""} data-task="${i}"><span>${escapeHtml(t.text)}</span><button data-delete-task="${i}" title="Delete">✕</button></div>`).join(""):`<div class="muted">No tasks yet. Add your first task above.</div>`;
  $("#taskCount").textContent=`${tasks.filter(t=>!t.done).length} pending`;
  $("#homeTasks").innerHTML=tasks.length?tasks.slice(0,5).map((t,i)=>`<div class="compact-item ${t.done?"done":""}"><input type="checkbox" ${t.done?"checked":""} data-home-task="${i}"><span>${escapeHtml(t.text)}</span></div>`).join(""):`<div class="muted">Your quick list is empty.</div>`;
  $$("[data-task]").forEach(x=>x.onchange=()=>toggleTask(+x.dataset.task));
  $$("[data-delete-task]").forEach(x=>x.onclick=()=>deleteTask(+x.dataset.deleteTask));
  $$("[data-home-task]").forEach(x=>x.onchange=()=>toggleTask(+x.dataset.homeTask));
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function addTask(){const v=$("#taskInput").value.trim();if(!v)return;tasks.unshift({text:v,done:false});set("pph_tasks",tasks);$("#taskInput").value="";renderTasks();}
function toggleTask(i){if(!tasks[i])return;tasks[i].done=!tasks[i].done;set("pph_tasks",tasks);renderTasks();}
function deleteTask(i){tasks.splice(i,1);set("pph_tasks",tasks);renderTasks();}
function renderNotes(){
  $("#notesList").innerHTML=notes.length?notes.map((n,i)=>`<article class="card note-card"><h3>${escapeHtml(n.title||"Untitled")}</h3><p>${escapeHtml(n.body)}</p><div class="note-meta">${new Date(n.created).toLocaleString()}</div><button class="delete" data-delete-note="${i}">Delete</button></article>`).join(""):`<div class="card muted">No quick notes yet.</div>`;
  $$("[data-delete-note]").forEach(x=>x.onclick=()=>{notes.splice(+x.dataset.deleteNote,1);set("pph_notes",notes);renderNotes();});
}
function addNote(title,body){title=title.trim();body=body.trim();if(!title&&!body)return;notes.unshift({title:title||"Untitled",body,created:Date.now()});set("pph_notes",notes);renderNotes();}
function applySettings(){
  document.body.classList.toggle("dark",settings.theme==="dark");
  $("#nameInput").value=settings.name||"";
  $("#startPage").value=settings.startPage||"home";
  $("#todayLabel").textContent=today();
}
function saveSettings(){
  settings.name=$("#nameInput").value.trim();
  settings.startPage=$("#startPage").value;
  set("pph_settings",settings); applySettings(); showSection(settings.startPage);
}
$$(".nav-item").forEach(b=>b.onclick=()=>showSection(b.dataset.section));
$$("[data-section-jump]").forEach(b=>b.onclick=()=>showSection(b.dataset.sectionJump));
$$("[data-url]").forEach(b=>b.onclick=()=>openUrl(b.dataset.url));
$("#addTask").onclick=addTask; $("#taskInput").addEventListener("keydown",e=>{if(e.key==="Enter")addTask()});
$("#addNote").onclick=()=>{addNote($("#noteTitle").value,$("#noteBody").value);$("#noteTitle").value="";$("#noteBody").value=""};
$("#saveHomeNote").onclick=()=>{addNote("Quick Note",$("#homeNote").value);$("#homeNote").value="";};
$("#themeBtn").onclick=()=>{settings.theme=settings.theme==="dark"?"light":"dark";set("pph_settings",settings);applySettings()};
$("#saveSettings").onclick=saveSettings;
$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");
$("#profileBtn").onclick=()=>{showSection("settings");$("#nameInput").focus()};
$("#clearLocal").onclick=()=>{if(confirm("Clear all V1 local notes, tasks and settings?")){["pph_tasks","pph_notes","pph_settings"].forEach(localStorage.removeItem);location.reload();}};

let remaining=1500,timerId=null;
function renderTimer(){const m=String(Math.floor(remaining/60)).padStart(2,"0"),s=String(remaining%60).padStart(2,"0");$("#timer").textContent=`${m}:${s}`;}
$("#timerStart").onclick=()=>{if(timerId){clearInterval(timerId);timerId=null;$("#timerStart").textContent="Start";return}$("#timerStart").textContent="Pause";timerId=setInterval(()=>{if(remaining<=0){clearInterval(timerId);timerId=null;$("#timerStart").textContent="Start";return}remaining--;renderTimer()},1000)};
$("#timerReset").onclick=()=>{clearInterval(timerId);timerId=null;remaining=1500;renderTimer();$("#timerStart").textContent="Start"};

renderApps();renderTasks();renderNotes();applySettings();renderTimer();showSection(settings.startPage||"home");
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
