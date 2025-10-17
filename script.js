// script.js (connected + auth)
let currentJobId = null;

// API base
const DEFAULT_API_BASE = (window.DEFAULT_API_BASE || "https://atlas-backend.onrender.com").trim();
const PARAM_API = new URLSearchParams(location.search).get("api");
const API_BASE = (PARAM_API || localStorage.getItem("API_BASE") || DEFAULT_API_BASE).replace(/\/+$/,"");

function setLabel(id, txt){ const el = document.getElementById(id); if (el) el.textContent = txt; }

document.addEventListener("DOMContentLoaded", () => {
  setLabel("apiBaseLabel", API_BASE || "not set");
  updateUserLabel();
  const saved = localStorage.getItem("CV_TEXT");
  if (saved) { const a = document.getElementById("cvIntroArea"); if (a) a.value = saved; }
});

// Auth storage
function getToken(){ return localStorage.getItem("TOKEN") || null; }
function setToken(tok){ if (tok) localStorage.setItem("TOKEN", tok); else localStorage.removeItem("TOKEN"); }
function getAuthHeader(){ const t = getToken(); return t ? { "Authorization": "Bearer " + t } : {}; }
function updateUserLabel(){
  const name = localStorage.getItem("USER_NAME");
  setLabel("userLabel", name ? name : "Guest");
}

// Auth modal logic
function openAuth(){ document.getElementById("authModal").classList.remove("hidden"); }
function closeAuth(){ document.getElementById("authModal").classList.add("hidden"); }
function switchAuth(tab){
  const su = document.getElementById("authSignup");
  const li = document.getElementById("authLogin");
  const tsu = document.getElementById("tabSignup");
  const tli = document.getElementById("tabLogin");
  if (tab === 'signup'){ su.classList.remove("hidden"); li.classList.add("hidden"); tsu.classList.add("active"); tli.classList.remove("active"); }
  else { li.classList.remove("hidden"); su.classList.add("hidden"); tli.classList.add("active"); tsu.classList.remove("active"); }
}
async function doSignup(){
  const name = document.getElementById("suName").value.trim();
  const email = document.getElementById("suEmail").value.trim();
  const password = document.getElementById("suPass").value.trim();
  setLabel("authMsg","");
  if (!name || !email || !password){ setLabel("authMsg","Fill name, email, password"); return; }
  try{
    const r = await fetch(`${API_BASE}/api/auth/signup`, {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const js = await r.json();
    if (!r.ok){ setLabel("authMsg", js.error || "Signup failed"); return; }
    setToken(js.token);
    localStorage.setItem("USER_NAME", js.user?.name || name);
    updateUserLabel();
    setLabel("authMsg","Account created ✅");
    setTimeout(closeAuth, 500);
  }catch(e){ setLabel("authMsg","Network error"); }
}
async function doLogin(){
  const email = document.getElementById("liEmail").value.trim();
  const password = document.getElementById("liPass").value.trim();
  setLabel("authMsg","");
  if (!email || !password){ setLabel("authMsg","Fill email, password"); return; }
  try{
    const r = await fetch(`${API_BASE}/api/auth/login`, {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ email, password })
    });
    const js = await r.json();
    if (!r.ok){ setLabel("authMsg", js.error || "Login failed"); return; }
    setToken(js.token);
    localStorage.setItem("USER_NAME", js.user?.name || "");
    updateUserLabel();
    setLabel("authMsg","Logged in ✅");
    setTimeout(closeAuth, 500);
  }catch(e){ setLabel("authMsg","Network error"); }
}
function logout(){
  setToken(null);
  localStorage.removeItem("USER_NAME");
  updateUserLabel();
  alert("Logged out");
}

// API helpers
function promptApiBase(){
  const cur = API_BASE;
  const v = prompt("Enter API base URL", cur);
  if (!v) return;
  localStorage.setItem("API_BASE", v);
  alert("Saved. Reload the page.");
}
async function healthCheck(){
  setLabel("matchStatus","Checking...");
  try{
    const r = await fetch(`${API_BASE}/api/health`);
    const js = await r.json();
    setLabel("matchStatus", js.ok ? "API online ✅" : "API reachable, unexpected response");
  }catch(e){ setLabel("matchStatus","API error ❌"); }
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById("page-" + page);
  if (el) el.classList.add('active');
  hidePanels();
  if (page === 'jobmatch') initJobmatch();
  if (page === 'about') renderTeam();
}

function hidePanels() {
  document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
}

const TEAM = [
  { name: "Vera Shaptala", role: "Founding Team", avatar: null, linkedin: "https://ca.linkedin.com/in/vera-shaptala-5aaab534a", blurb: "Entrepreneurial mindset and cross‑functional leadership across product, ops, and partnerships." },
  { name: "Alexander Bakhtine", role: "Engineering & Data", avatar: null, linkedin: "https://www.linkedin.com/in/alexanderbakhtine", blurb: "Data‑driven engineer with experience in scalable systems, analytics, and ML‑tooling." },
  { name: "Elena Rodriguez", role: "Head of Product", avatar: null, linkedin: "#", blurb: "User experience and product strategy in HR tech." },
  { name: "David Kim", role: "Lead Developer", avatar: null, linkedin: "#", blurb: "Full‑stack development and system architecture." },
];

function renderTeam() {
  const grid = document.querySelector('.team-grid');
  grid.innerHTML = '';
  TEAM.forEach(m => {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.innerHTML = `
      <div class="avatar">${m.avatar ? `<img src="${m.avatar}" />` : m.name.charAt(0)}</div>
      <h3>${m.name}</h3>
      <p><em>${m.role}</em></p>
      <p>${m.blurb}</p>
      <a href="${m.linkedin}" target="_blank" rel="noreferrer">LinkedIn ↗</a>
    `;
    grid.appendChild(card);
  });
}

let JOBS = [];
let lastMatchResults = null;

async function initJobmatch(){
  await fetchJobs();
  renderJobs();
}

async function fetchJobs(){
  try{
    const r = await fetch(`${API_BASE}/api/jobs`);
    JOBS = await r.json();
  }catch(e){
    JOBS = [
      { id: 1, company: "Tech Corp", title: "Senior Python Developer", date: "2024-10-11" },
      { id: 2, company: "Data Systems Inc", title: "Data Scientist", date: "2024-10-10" },
      { id: 3, company: "Cloud Solutions", title: "DevOps Engineer", date: "2024-10-09" },
      { id: 4, company: "FinTech Global", title: "Full Stack Developer", date: "2024-10-08" },
    ];
  }
}

function renderJobs() {
  const container = document.getElementById('jobs-container');
  container.innerHTML = '';
  JOBS.forEach(j => {
    const score = getScoreFor(j.id);
    const row = document.createElement('div');
    row.className = 'job-row';
    row.innerHTML = `
      <div>${j.company}</div>
      <div>${j.title}</div>
      <div>${j.date || ""}</div>
      <div><span class="match-badge">${score !== null ? score + "%" : "—"}</span></div>
      <div><button onclick="applyJob(${j.id})">Apply</button></div>
    `;
    container.appendChild(row);
  });
}

function getScoreFor(jobId){
  if (!lastMatchResults) return null;
  const item = lastMatchResults.find(x => x.id === jobId);
  return item ? item.score : null;
}

async function runAiMatch(){
  const status = document.getElementById("matchStatus");
  const cv = document.getElementById("cvIntroArea").value.trim();
  if (!cv){ alert("Please paste your CV first."); return; }
  status.textContent = "Matching...";
  try{
    const r = await fetch(`${API_BASE}/api/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ cvText: cv })
    });
    if (!r.ok){
      const msg = await r.json().catch(()=>({}));
      status.textContent = (msg.error || "Auth required");
      return;
    }
    const js = await r.json();
    lastMatchResults = js.results || null;
    renderJobs();
    status.textContent = "Match scores updated ✅";
  }catch(e){ status.textContent = "Match request failed ❌"; }
}

function saveCvLocal(){
  const cv = document.getElementById("cvIntroArea").value;
  localStorage.setItem("CV_TEXT", cv);
  setLabel("matchStatus","CV saved locally.");
}

function applyJob(id) {
  currentJobId = id;
  hidePanels();
  showGapPanel();
}

function showGapPanel() {
  const panel = document.getElementById('panel-gap');
  const job = JOBS.find(j => j.id === currentJobId);
  panel.style.display = 'block';
  const gapsList = buildGapsHtml(job);
  panel.innerHTML = `
    <h3>🎯 Gap Analysis: ${job.company} — ${job.title}</h3>
    ${gapsList}
    <button onclick="goToCV()">Align CV & Continue</button>
    <button onclick="hidePanels()">Back to Opportunities</button>
  `;
}

function buildGapsHtml(job){
  const cv = (document.getElementById("cvIntroArea")?.value || "").trim();
  if (!cv || !lastMatchResults){
    return `
      <p class="muted">AI gaps unavailable (login, paste CV, press “Run AI Match”). Showing sample gaps:</p>
      <p>• Required Skills Missing: <strong>3</strong></p>
      <p>• Experience Gaps: <strong>2+ years</strong></p>
      <p>• Certification Gaps: <strong>1</strong></p>
      <h4>🔍 Missing Requirements:</h4>
      <div>• Docker containerization</div>
      <div>• Advanced AWS services (EC2, S3, Lambda)</div>
      <div>• Kubernetes orchestration</div>
      <div>• 2+ years cloud architecture experience</div>
      <div>• AWS Solutions Architect certification</div>
    `;
  }
  const item = lastMatchResults.find(x => x.id === job.id);
  if (!item) return `<p class="muted">No AI gaps for this job.</p>`;
  const ms = item.gaps?.missingSkills || [];
  const mc = item.gaps?.missingCerts || [];
  const exp = item.gaps?.expGapYears || 0;
  return `
    <p>• AI Match: <strong>${item.score}%</strong></p>
    <p>• Missing skills: <strong>${ms.length}</strong></p>
    <p>• Experience gap: <strong>${exp}+ years</strong></p>
    <p>• Missing certifications: <strong>${mc.length}</strong></p>
    <h4>🔍 Missing Requirements:</h4>
    ${(ms.length ? ms : ["Docker containerization"]).map(x=>`<div>• ${x}</div>`).join("")}
    ${mc.map(x=>`<div>• ${x} (cert)</div>`).join("")}
  `;
}

// CV panel
async function goToCV() {
  hidePanels();
  const panel = document.getElementById('panel-cv');
  panel.style.display = 'block';
  const cvSaved = (document.getElementById("cvIntroArea")?.value || "").trim();

  const job = JOBS.find(j => j.id === currentJobId);
  let aligned = cvSaved || "# PROFESSIONAL SUMMARY\nDynamic and results‑oriented Developer...";

  try{
    const r = await fetch(`${API_BASE}/api/align-cv`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ cvText: cvSaved, targetJobId: currentJobId })
    });
    if (r.ok){ const js = await r.json(); if (js.aligned) aligned = js.aligned; }
  }catch(e){}

  panel.innerHTML = `
    <h3>📝 ATS‑Optimized CV Editor</h3>
    <textarea id="cvArea">${aligned.replace(/</g,"&lt;")}</textarea>
    <button onclick="downloadCV()">📥 Download CV (Word)</button>
    <button onclick="goToCover()">✉️ Generate Cover Letter</button>
    <button onclick="showGapPanel()">← Back to Gap Analysis</button>
  `;
}

async function goToCover() {
  hidePanels();
  const panel = document.getElementById('panel-cover');
  panel.style.display = 'block';
  const job = JOBS.find(j => j.id === currentJobId);

  let letter = `Dear Hiring Manager,\nI am writing to express my interest in the ${job.title} position at ${job.company}.`;
  try{
    const r = await fetch(`${API_BASE}/api/cover-letter`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ name: localStorage.getItem("USER_NAME") || "[Your Name]", targetJobId: currentJobId })
    });
    if (r.ok){ const js = await r.json(); if (js.letter) letter = js.letter; }
  }catch(e){}

  panel.innerHTML = `
    <h3>📄 AI‑Generated Cover Letter</h3>
    <textarea id="coverArea">${letter.replace(/</g,"&lt;")}</textarea>
    <button onclick="downloadCover()">📥 Download Cover Letter</button>
    <button onclick="goToCV()">← Edit Cover Letter</button>
  `;
}

function downloadCV() {
  const text = document.getElementById('cvArea').value;
  downloadFile(text, `CV_${currentJobId}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  if (confirm('Generate cover letter now?')) { goToCover(); } else { showComplete(); }
}
function downloadCover() {
  const t = document.getElementById('coverArea').value;
  downloadFile(t, `Cover_${currentJobId}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  if (confirm('Mark applied?')) { showComplete(); }
}

// Completion panel
function showComplete() {
  hidePanels();
  const panel = document.getElementById('panel-complete');
  const job = JOBS.find(j => j.id === currentJobId);
  panel.style.display = 'block';
  panel.innerHTML = `
    <h3>✅ Application Complete!</h3>
    <p>Your application has been submitted for ${job.company} — ${job.title}</p>
    <button onclick="resetAll()">🏠 Return to Home</button>
  `;
}

function resetAll() { showPage('home'); currentJobId = null; }

// helper download
function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
