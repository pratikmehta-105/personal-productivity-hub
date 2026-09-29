const APPS = [
  ["📅","Google Calendar","Calendar, events & meetings","https://calendar.google.com"],
  ["✅","Google Tasks","Tasks & reminders","https://tasks.google.com"],
  ["📝","Google Keep","Notes & lists","https://keep.google.com"],
  ["📧","Gmail","Email","https://mail.google.com"],
  ["📁","Google Drive","Files & documents","https://drive.google.com"],
  ["👤","Google Contacts","Contacts","https://contacts.google.com"],
  ["🤖","NotebookLM","AI notebooks & research","https://notebooklm.google.com"],

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
let customApps = get("pph_custom_apps", []);
let token = null, tokenClient = null, googleLists = [];

function openUrl(url){ window.open(url, "_blank", "noopener,noreferrer"); }
function today(){
  const d=new Date();
  return d.toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
}
function showSection(id){
  $$(".section").forEach(x=>x.classList.toggle("active",x.id===id));
  $$(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.section===id));
  const titles={home:"Good day 👋",apps:"My Apps",notes:"Quick Notes",tasks:"Quick Tasks",search:"Search",tools:"Tools",settings:"Settings"};
  $("#pageTitle").textContent = settings.name && id==="home" ? `Good day, ${settings.name} 👋` : titles[id];
  $("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
function allApps(){return [...APPS,...customApps];}
function renderApps(){
  $("#appGrid").innerHTML=allApps().map((a,i)=>`<article class="card app-card"><div class="app-icon">${escapeHtml(a[0])}</div><main><h3>${escapeHtml(a[1])}</h3><p>${escapeHtml(a[2])}</p></main><button data-open-app="${i}">Open ↗</button><button class="favorite" data-fav-app="${i}" aria-label="Toggle favorite">${(settings.favorites||[]).includes(a[3])?"★":"☆"}</button>${i>=APPS.length?`<button data-remove-app="${i-APPS.length}" aria-label="Remove shortcut">✕</button>`:""}</article>`).join("");
  $$("[data-open-app]").forEach(b=>b.onclick=()=>openUrl(allApps()[+b.dataset.openApp][3]));
  $$("[data-fav-app]").forEach(b=>b.onclick=()=>{const url=allApps()[+b.dataset.favApp][3]; settings.favorites=settings.favorites||[];settings.favorites=settings.favorites.includes(url)?settings.favorites.filter(x=>x!==url):[...settings.favorites,url];set("pph_settings",settings);renderApps();renderFavorites();renderSearch();});
  $$("[data-remove-app]").forEach(b=>b.onclick=()=>{customApps.splice(+b.dataset.removeApp,1);set("pph_custom_apps",customApps);renderApps();renderFavorites();renderSearch();});
}
function renderFavorites(){const f=(settings.favorites||[]).map(u=>allApps().find(a=>a[3]===u)).filter(Boolean);$("#favorites").innerHTML=f.length?f.map(a=>`<button class="quick" data-favorite="${escapeHtml(a[3])}">${escapeHtml(a[0])} ${escapeHtml(a[1])} ↗</button>`).join(""):`<span class="muted">Star shortcuts in My Apps to see them here.</span>`; $$("[data-favorite]").forEach(x=>x.onclick=()=>openUrl(x.dataset.favorite));}
function addCustomApp(){const name=$("#appName").value.trim(),raw=$("#appUrl").value.trim();let url;try{url=new URL(raw);if(!["https:","http:"].includes(url.protocol))throw Error();}catch{$("#appUrl").setCustomValidity("Enter a valid http or https URL");$("#appUrl").reportValidity();return}$("#appUrl").setCustomValidity("");if(!name)return;customApps.push(["🔗",name,"Custom shortcut",url.href]);set("pph_custom_apps",customApps);$("#appName").value=$("#appUrl").value="";renderApps();}

function renderTasks(){
  $("#taskList").innerHTML=tasks.length?tasks.map((t,i)=>`<div class="task-row ${t.done?"done":""}"><input type="checkbox" ${t.done?"checked":""} data-task="${i}"><span>${escapeHtml(t.text)}</span><button data-delete-task="${i}" title="Delete">✕</button></div>`).join(""):`<div class="muted">No tasks yet. Add your first task above.</div>`;
  $("#taskCount").textContent=`${tasks.filter(t=>!t.done).length} pending`;
  $("#homeTasks").innerHTML=tasks.length?tasks.slice(0,5).map((t,i)=>`<div class="compact-item ${t.done?"done":""}"><input type="checkbox" ${t.done?"checked":""} data-home-task="${i}"><span>${escapeHtml(t.text)}</span></div>`).join(""):`<div class="muted">Your quick list is empty.</div>`;
  $$("[data-task]").forEach(x=>x.onchange=()=>toggleTask(+x.dataset.task));
  $$("[data-delete-task]").forEach(x=>x.onclick=()=>deleteTask(+x.dataset.deleteTask));
  $$("[data-home-task]").forEach(x=>x.onchange=()=>toggleTask(+x.dataset.homeTask));
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function addTask(){const v=$("#taskInput").value.trim();if(!v)return;tasks.unshift({text:v,done:false});set("pph_tasks",tasks);$("#taskInput").value="";renderTasks();renderSearch();}
function toggleTask(i){if(!tasks[i])return;tasks[i].done=!tasks[i].done;set("pph_tasks",tasks);renderTasks();renderSearch();}
function deleteTask(i){tasks.splice(i,1);set("pph_tasks",tasks);renderTasks();renderSearch();}
function renderNotes(){
  $("#notesList").innerHTML=notes.length?notes.map((n,i)=>`<article class="card note-card"><h3>${escapeHtml(n.title||"Untitled")}</h3><p>${escapeHtml(n.body)}</p><div class="note-meta">${new Date(n.created).toLocaleString()}</div><button class="delete" data-delete-note="${i}">Delete</button></article>`).join(""):`<div class="card muted">No quick notes yet.</div>`;
  $$("[data-delete-note]").forEach(x=>x.onclick=()=>{notes.splice(+x.dataset.deleteNote,1);set("pph_notes",notes);renderNotes();renderSearch();});
}
function addNote(title,body){title=title.trim();body=body.trim();if(!title&&!body)return;notes.unshift({title:title||"Untitled",body,created:Date.now()});set("pph_notes",notes);renderNotes();renderSearch();}
function applySettings(){
  document.body.classList.toggle("dark",settings.theme==="dark");
  $("#nameInput").value=settings.name||"";
  $("#startPage").value=settings.startPage||"home";
  $("#todayLabel").textContent=today();
  $("#clientId").value=settings.clientId||"";renderFavorites();
}
function saveSettings(){
  settings.name=$("#nameInput").value.trim();
  settings.startPage=$("#startPage").value;
  settings.clientId=$("#clientId").value.trim();
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
$("#clearLocal").onclick=()=>{if(confirm("Clear all hub notes, tasks, shortcuts and settings on this browser?")){["pph_tasks","pph_notes","pph_settings","pph_custom_apps"].forEach(k=>localStorage.removeItem(k));location.reload();}};

let remaining=1500,timerId=null;
function renderTimer(){const m=String(Math.floor(remaining/60)).padStart(2,"0"),s=String(remaining%60).padStart(2,"0");$("#timer").textContent=`${m}:${s}`;}
$("#timerStart").onclick=()=>{if(timerId){clearInterval(timerId);timerId=null;$("#timerStart").textContent="Start";return}$("#timerStart").textContent="Pause";timerId=setInterval(()=>{if(remaining<=0){clearInterval(timerId);timerId=null;$("#timerStart").textContent="Start";return}remaining--;renderTimer()},1000)};
$("#timerReset").onclick=()=>{clearInterval(timerId);timerId=null;remaining=1500;renderTimer();$("#timerStart").textContent="Start"};

renderApps();renderTasks();renderNotes();applySettings();renderSearch();renderTimer();showSection(settings.startPage||"home");
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));

// Local search is intentionally limited to this browser's data.
function renderSearch(){const q=$("#searchInput").value.trim().toLocaleLowerCase();const entries=[...notes.map((n,i)=>({type:"Note",title:n.title||"Untitled",body:n.body,section:"notes"})),...tasks.map(t=>({type:"Task",title:t.text,body:t.done?"Completed":"Pending",section:"tasks"})),...allApps().map(a=>({type:"App",title:a[1],body:a[2],section:"apps"}))];const matches=q?entries.filter(e=>(e.title+" "+e.body).toLocaleLowerCase().includes(q)):[];$("#searchResults").innerHTML=q?(matches.length?matches.map(e=>`<button class="card search-hit" data-result-section="${e.section}"><small>${e.type}</small><strong>${escapeHtml(e.title)}</strong><span>${escapeHtml(e.body).slice(0,180)}</span></button>`).join(""):'<p class="muted">No local results.</p>'):'<p class="muted">Start typing to search local items and apps.</p>';$$("[data-result-section]").forEach(x=>x.onclick=()=>showSection(x.dataset.resultSection));}
$("#searchInput").oninput=renderSearch;
$("#addApp").onclick=()=>{addCustomApp();renderSearch();};
// Simple arithmetic parser; no eval or Function execution.
function arithmetic(input){const tokens=input.match(/\d+(?:\.\d+)?|[()+*/-]/g)||[];if(tokens.join("")!==input.replace(/\s+/g,""))throw Error("Invalid expression");let i=0;function factor(){let t=tokens[i++];if(t==="-")return -factor();if(t==="+")return factor();if(t==="("){let v=expr();if(tokens[i++]!==")")throw Error("Missing )");return v}if(!/^\d+(\.\d+)?$/.test(t||""))throw Error("Invalid number");return Number(t)}function term(){let v=factor();while(["*","/"].includes(tokens[i])){let op=tokens[i++],n=factor();v=op==="*"?v*n:v/n}return v}function expr(){let v=term();while(["+","-"].includes(tokens[i])){let op=tokens[i++],n=term();v=op==="+"?v+n:v-n}return v}let result=expr();if(i!==tokens.length||!Number.isFinite(result))throw Error("Invalid expression");return result}
$("#calculate").onclick=()=>{try{$("#calcResult").textContent=String(arithmetic($("#calcInput").value))}catch(e){$("#calcResult").textContent=e.message}};
$("#getWeather").onclick=()=>{if(!navigator.geolocation){$("#weatherStatus").textContent="Location is unavailable on this device.";return}$("#weatherStatus").textContent="Getting location…";navigator.geolocation.getCurrentPosition(async pos=>{try{const {latitude,longitude}=pos.coords;const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`);if(!r.ok)throw Error();const d=await r.json();$("#weatherStatus").textContent=`${d.current.temperature_2m}°C · ${d.current.relative_humidity_2m}% humidity · weather code ${d.current.weather_code}`;}catch{$("#weatherStatus").textContent="Weather unavailable. Try again later."}},()=>{$("#weatherStatus").textContent="Allow location access to show local weather."},{timeout:10000});};
$("#exportData").onclick=()=>{const data={format:"pph-v2",exported:new Date().toISOString(),notes,tasks,customApps,settings:{name:settings.name,theme:settings.theme,startPage:settings.startPage,favorites:settings.favorites||[]}};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="personal-hub-backup.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$("#importData").onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>5e6)throw Error("File too large");const data=JSON.parse(await file.text());if(data.format!=="pph-v2"||!Array.isArray(data.notes)||!Array.isArray(data.tasks)||!Array.isArray(data.customApps))throw Error("Invalid backup");if(!confirm("Replace this browser's local notes, tasks, shortcuts and settings with the backup?"))return;notes=data.notes.filter(n=>typeof n.title==="string"&&typeof n.body==="string").slice(0,5000);tasks=data.tasks.filter(t=>typeof t.text==="string").slice(0,5000);customApps=data.customApps.filter(a=>Array.isArray(a)&&a.length===4&&typeof a[3]==="string"&&/^https?:\/\//i.test(a[3])).slice(0,500);settings={...settings,...data.settings,clientId:settings.clientId};set("pph_notes",notes);set("pph_tasks",tasks);set("pph_custom_apps",customApps);set("pph_settings",settings);location.reload()}catch(err){alert("Could not import backup: "+err.message)}finally{e.target.value=""}};
const SCOPES="https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/drive.metadata.readonly";
function status(message){$("#connectStatus").textContent=message}
$("#connectGoogle").onclick=()=>{settings.clientId=$("#clientId").value.trim();if(!/^[\w-]+\.apps\.googleusercontent\.com$/.test(settings.clientId)){status("Enter a valid Google OAuth Web client ID first.");return}set("pph_settings",settings);if(!window.google?.accounts?.oauth2){status("Google authorization did not load. Check your connection and retry.");return}tokenClient=google.accounts.oauth2.initTokenClient({client_id:settings.clientId,scope:SCOPES,callback:async response=>{if(response.error){status("Google authorization failed: "+response.error);return}token=response.access_token;status("Connected for this session. Access expires; reconnect when needed.");await refreshGoogle()}});tokenClient.requestAccessToken({prompt:"consent"})};
$("#disconnectGoogle").onclick=()=>{if(token&&window.google?.accounts?.oauth2)google.accounts.oauth2.revoke(token,()=>{});token=null;googleLists=[];$("#googleHome").textContent="";$("#googleStatus").textContent="Connect Calendar and Tasks in Settings to see your data here.";$("#googleDetails").textContent="";$("#googleTasks").textContent="Connect in Settings to view Google Tasks.";status("Disconnected from this session.")};
async function googleFetch(url,options={}){if(!token)throw Error("Connect Google in Settings first.");const r=await fetch(url,{...options,headers:{Authorization:`Bearer ${token}`,...options.headers}});if(r.status===401){token=null;throw Error("Google access expired. Reconnect in Settings.")}if(!r.ok){let body=await r.json().catch(()=>({}));throw Error(body.error?.message||`Google request failed (${r.status})`)}return r.status===204?null:r.json()}
async function refreshGoogle(){if(!token)return;status("Loading Google data…");try{const start=new Date().toISOString();const [cal,lists,gmail,drive]=await Promise.all([googleFetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(start)}&maxResults=8&singleEvents=true&orderBy=startTime`),googleFetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=100"),googleFetch("https://gmail.googleapis.com/gmail/v1/users/me/labels/INBOX"),googleFetch("https://www.googleapis.com/drive/v3/files?page_size=5&orderBy=modifiedTime%20desc&fields=files(id,name,webViewLink,mimeType),nextPageToken")]);googleLists=lists.items||[];const events=cal.items||[];$("#googleStatus").textContent="Connected for this session. Refresh to update.";$("#googleHome").innerHTML=`<h4>Upcoming events</h4>${events.length?events.map(e=>`<p>📅 ${escapeHtml(e.summary||"(No title)")} · ${escapeHtml(new Date(e.start?.dateTime||e.start?.date).toLocaleString())}</p>`).join(""):"<p>No upcoming events.</p>"}`;$("#googleDetails").innerHTML=`<p>📧 Inbox: ${Number(gmail.messagesUnread||0)} unread</p><h4>Recent Drive files</h4>${(drive.files||[]).map(f=>`<p>📁 <a href="${escapeHtml(f.webViewLink||"https://drive.google.com")}" target="_blank" rel="noopener noreferrer">${escapeHtml(f.name)}</a></p>`).join("")||"<p>No files returned.</p>"}`;await refreshGoogleTasks();status("Google data loaded. Access remains in this tab until it expires.")}catch(e){status(e.message)}}
async function refreshGoogleTasks(){if(!token)return;try{const chunks=await Promise.all(googleLists.slice(0,20).map(async list=>({list,tasks:(await googleFetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(list.id)}/tasks?showCompleted=false&maxResults=100`)).items||[]})));$("#googleTasks").innerHTML=chunks.map(({list,tasks})=>`<h4>${escapeHtml(list.title)}</h4>${tasks.length?tasks.map(t=>`<div class="task-row"><input type="checkbox" data-google-list="${escapeHtml(list.id)}" data-google-task="${escapeHtml(t.id)}" aria-label="Complete ${escapeHtml(t.title)}"><span>${escapeHtml(t.title)}</span></div>`).join(""):"<p class='muted'>No pending tasks.</p>"}`).join("")||"<p>No task lists found.</p>";$$("[data-google-task]").forEach(x=>x.onchange=async()=>{try{await googleFetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(x.dataset.googleList)}/tasks/${encodeURIComponent(x.dataset.googleTask)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"completed"})});refreshGoogleTasks()}catch(e){status(e.message)}})}catch(e){status(e.message)}}
$("#refreshGoogle").onclick=refreshGoogle;$("#refreshTasks").onclick=refreshGoogleTasks;
$("#addGoogleTask").onclick=async()=>{const title=$("#googleTaskInput").value.trim();if(!title)return;if(!googleLists.length){status("Connect Google and load a task list first.");return}try{await googleFetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(googleLists[0].id)}/tasks`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title})});$("#googleTaskInput").value="";refreshGoogleTasks()}catch(e){status(e.message)}};
