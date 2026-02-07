let file = null;
let previewUrl = null;
let status = "idle";
let progress = 0;
let logs = [];
let analysisData = null;

const fileInput = document.getElementById("media-drop");
const previewContainer = document.getElementById("preview-container");
const logContainer = document.getElementById("log-container");
const progressText = document.getElementById("progress-text");
const progressBars = document.getElementById("progress-bars");
const resultSection = document.getElementById("result-section");
const timelineContainer = document.getElementById("timeline-bars");

function addLog(msg) {
  logs.unshift(msg);
  logs = logs.slice(0, 6);
  logContainer.innerHTML = "";
  logs.forEach(log => {
    const div = document.createElement("div");
    div.className = "log";
    div.textContent = log;
    logContainer.appendChild(div);
  });
}

fileInput.addEventListener("change", (e) => {
  file = e.target.files[0];
  if (!file) return;

  previewContainer.innerHTML = "";
  previewUrl = URL.createObjectURL(file);

  const video = document.createElement("video");
  video.src = previewUrl;
  video.controls = true;
  video.muted = true;
  previewContainer.appendChild(video);

  addLog("Media loaded.");
});

async function runForensics() {
  if (!file || status === "analyzing") return;

  status = "analyzing";
  progress = 10;
  logs = [];

  addLog("Uploading media to forensic engine...");
  updateProgress(10);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      body: formData
    });

    updateProgress(50);
    addLog("Running biometric & visual analysis...");

    analysisData = await response.json();

    updateProgress(100);
    addLog("Forensic analysis complete.");

    showResults();

  } catch (err) {
    addLog("ERROR: Backend unreachable");
    console.error(err);
  }
}

function updateProgress(val) {
  progress = val;
  progressText.textContent = `${val}%`;

  progressBars.innerHTML = "";
  for (let i = 0; i < 20; i++) {
    const bar = document.createElement("div");
    bar.className = "bar";
    if (i < val / 5) bar.classList.add("active");
    progressBars.appendChild(bar);
  }
}

function showResults() {
  status = "complete";

  const manipulation = Math.round(analysisData.combined_risk * 100);
  const credibility = analysisData.credibility_score;

  document.getElementById("manip-score").textContent = `${manipulation}%`;
  document.getElementById("cred-score").textContent = `${credibility}%`;

  renderTimeline();
  resultSection.classList.remove("hidden");
}

function renderTimeline() {
  timelineContainer.innerHTML = "";

  analysisData.timeline.forEach(seg => {
    const bar = document.createElement("div");
    bar.className = `timeline-bar ${seg.label}`;
    bar.style.height = `${Math.max(10, seg.risk * 100)}%`;
    bar.title = `Segment ${seg.segment * 2}s | ${seg.explanation}`;
    timelineContainer.appendChild(bar);
  });
}

function downloadReport() {
  window.open(
    "http://127.0.0.1:8000/download-report",
    "_blank"
  );
}

function resetSystem() {
  file = null;
  status = "idle";
  logs = [];
  analysisData = null;

  previewContainer.innerHTML = "";
  logContainer.innerHTML = "";
  progressText.textContent = "0%";
  progressBars.innerHTML = "";
  resultSection.classList.add("hidden");
}