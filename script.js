// script.js
let currentJobId = null;

const JOBS = [
  { id: 1, company: "Tech Corp", title: "Senior Python Developer", date: "2024-10-11" },
  { id: 2, company: "Data Systems Inc", title: "Data Scientist", date: "2024-10-10" },
  { id: 3, company: "Cloud Solutions", title: "DevOps Engineer", date: "2024-10-09" },
  { id: 4, company: "FinTech Global", title: "Full Stack Developer", date: "2024-10-08" },
];

const TEAM = [
  {
    name: "Vera Shaptala",
    role: "Founding Team",
    avatar: null,
    linkedin: "https://ca.linkedin.com/in/vera-shaptala-5aaab534a",
    blurb: "Entrepreneurial mindset and cross-functional leadership across product, ops, and partnerships."
  },
  {
    name: "Alexander Bakhtine",
    role: "Engineering & Data",
    avatar: null,
    linkedin: "https://www.linkedin.com/in/alexanderbakhtine",
    blurb: "Data-driven engineer with experience in scalable systems, analytics, and ML-tooling."
  },
  {
    name: "Elena Rodriguez",
    role: "Head of Product",
    avatar: null,
    linkedin: "#",
    blurb: "User experience and product strategy in HR tech."
  },
  {
    name: "David Kim",
    role: "Lead Developer",
    avatar: null,
    linkedin: "#",
    blurb: "Full-stack development and system architecture."
  },
];

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById("page-" + page);
  if (el) el.classList.add('active');
  hidePanels();
  if (page === 'jobmatch') renderJobs();
  if (page === 'about') renderTeam();
}

function hidePanels() {
  document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
}

// Team rendering
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

// Jobs rendering
function renderJobs() {
  const container = document.getElementById('jobs-container');
  container.innerHTML = '';
  JOBS.forEach(j => {
    const row = document.createElement('div');
    row.className = 'job-row';
    row.innerHTML = `
      <div>${j.company}</div>
      <div>${j.title}</div>
      <div>${j.date}</div>
      <div><span class="match-badge">85%</span></div>
      <div><button onclick="applyJob(${j.id})">Apply</button></div>
    `;
    container.appendChild(row);
  });
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
  panel.innerHTML = `
    <h3>🎯 Gap Analysis: ${job.company} — ${job.title}</h3>
    <p>• Required Skills Missing: <strong>3</strong></p>
    <p>• Experience Gaps: <strong>2+ years</strong></p>
    <p>• Certification Gaps: <strong>1</strong></p>
    <h4>🔍 Missing Requirements:</h4>
    <div>• Docker containerization</div>
    <div>• Advanced AWS services (EC2, S3, Lambda)</div>
    <div>• Kubernetes orchestration</div>
    <div>• 2+ years cloud architecture experience</div>
    <div>• AWS Certified Solutions Architect certification</div>
    <button onclick="goToCV()">Align CV & Continue</button>
    <button onclick="hidePanels()">Back to Opportunities</button>
  `;
}

// CV panel
function goToCV() {
  hidePanels();
  const panel = document.getElementById('panel-cv');
  panel.style.display = 'block';
  panel.innerHTML = `
    <h3>📝 ATS‑Optimized CV Editor</h3>
    <textarea id="cvArea"># PROFESSIONAL SUMMARY
Dynamic and results-oriented Python Developer with 5+ years of expertise in AWS cloud solutions and scalable application development. Skilled in Python, SQL, AWS, React, JavaScript. Currently expanding expertise in Docker and Kubernetes containerization.
    </textarea>
    <button onclick="downloadCV()">📥 Download CV (Word)</button>
    <button onclick="goToCover()">✉️ Generate Cover Letter</button>
    <button onclick="showGapPanel()">← Back to Gap Analysis</button>
  `;
}

function downloadCV() {
  const text = document.getElementById('cvArea').value;
  downloadFile(text, `CV_${currentJobId}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  if (confirm('Generate cover letter now?')) {
    goToCover();
  } else {
    showComplete();
  }
}

// Cover panel
function goToCover() {
  hidePanels();
  const panel = document.getElementById('panel-cover');
  const job = JOBS.find(j => j.id === currentJobId);
  panel.style.display = 'block';
  panel.innerHTML = `
    <h3>📄 AI‑Generated Cover Letter</h3>
    <textarea id="coverArea">Dear Hiring Manager,
I am writing to express my interest in the ${job.title} position at ${job.company}.</textarea>
    <button onclick="downloadCover()">📥 Download Cover Letter</button>
    <button onclick="goToCV()">← Edit Cover Letter</button>
  `;
}

function downloadCover() {
  const t = document.getElementById('coverArea').value;
  downloadFile(t, `Cover_${currentJobId}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  if (confirm('Mark applied?')) {
    showComplete();
  }
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

function resetAll() {
  showPage('home');
  currentJobId = null;
}

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

// Initialize
showPage('home');
