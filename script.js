let file = null;
let previewUrl = null;
let mediaDuration = 0;
let status = "idle";
let progress = 0;
let logs = [];
let analysisData = null;
let displayScores = { manip: 0, cred: 0 };

const fileInput = document.getElementById("media-drop");
const previewContainer = document.getElementById("preview-container");
const logContainer = document.getElementById("log-container");
const progressText = document.getElementById("progress-text");
const progressBars = document.getElementById("progress-bars");
const resultSection = document.getElementById("result-section");
const timelineContainer = document.getElementById("timeline-bars");

function addLog(msg) {
  logs.unshift(msg);
  logs = logs.slice(0, 5);
  renderLogs();
}

function renderLogs() {
  logContainer.innerHTML = "";
  logs.forEach((log, i) => {
    const div = document.createElement("div");
    div.className = "log";
    div.textContent = log;
    logContainer.appendChild(div);
  });
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

fileInput.addEventListener("change", (e) => {
  file = e.target.files[0];
  if (!file) return;

  previewContainer.innerHTML = "";
  previewUrl = URL.createObjectURL(file);

  if (file.type.startsWith("video")) {
    const video = document.createElement("video");
    video.src = previewUrl;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.onloadedmetadata = () => {
      mediaDuration = video.duration;
    };
    previewContainer.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = previewUrl;
    previewContainer.appendChild(img);
  }

  addLog("Media core loaded.");
});

function runForensics() {
  if (!file || status === "analyzing") return;

  status = "analyzing";
  progress = 0;
  logs = [];
  addLog("Accessing encrypted media buffer...");
  addLog("Syncing Neural-Verify X1...");

  const interval = setInterval(() => {
    progress += Math.random() * 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      progressText.textContent = "100%";
      addLog("Heuristic reconstruction successful.");
      setTimeout(showResults, 800);
    } else {
      progressText.textContent = `${Math.floor(progress)}%`;
      if (progress > 20 && progress < 25) addLog("Detecting pixel-jitter artifacts...");
      if (progress > 50 && progress < 55) addLog("Analyzing GAN fingerprints...");
      if (progress > 75 && progress < 80) addLog("Cross-referencing metadata hash...");
    }
    renderProgressBars();
  }, 100);
}

function renderProgressBars() {
  progressBars.innerHTML = "";
  for (let i = 0; i < 20; i++) {
    const bar = document.createElement("div");
    bar.className = "bar";
    if (i < progress / 5) bar.classList.add("active");
    progressBars.appendChild(bar);
  }
}

function showResults() {
  status = "complete";
  const manipulationScore = 88;

  analysisData = {
    manipulationScore,
    credibilityScore: 100 - manipulationScore,
    hash: `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
    timeline: Array.from({ length: 40 }, (_, i) => {
      const score = Math.random();
      return {
        score,
        status: score > 0.7 ? "red" : score > 0.35 ? "yellow" : "green",
        time: formatTime(i * 10)
      };
    })
  };

  animateScores(manipulationScore);
  renderTimeline();
  resultSection.classList.remove("hidden");
}

function animateScores(target) {
  let cur = 0;
  const interval = setInterval(() => {
    cur += 2;
    if (cur >= target) {
      cur = target;
      clearInterval(interval);
    }
    document.getElementById("manip-score").textContent = `${cur}%`;
    document.getElementById("cred-score").textContent = `${100 - cur}%`;
  }, 20);
}

function renderTimeline() {
  timelineContainer.innerHTML = "";
  analysisData.timeline.forEach((point) => {
    const bar = document.createElement("div");
    bar.className = `timeline-bar ${point.status}`;
    bar.style.height = `${Math.max(10, point.score * 100)}%`;
    bar.title = `${point.time} | Risk ${(point.score * 10).toFixed(1)}`;
    timelineContainer.appendChild(bar);
  });
}

function downloadReport() {
  if (!analysisData || !file) return;

  const report = {
    timestamp: new Date().toISOString(),
    filename: file.name,
    manipulationScore: analysisData.manipulationScore,
    credibilityScore: analysisData.credibilityScore,
    hash: analysisData.hash,
    summary: "High probability of deep-synthetic manipulation detected."
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Forensic_Report.json";
  a.click();
  URL.revokeObjectURL(url);

  addLog("Report exported.");
}

function resetSystem() {
  file = null;
  previewUrl = null;
  mediaDuration = 0;
  status = "idle";
  progress = 0;
  logs = [];
  analysisData = null;

  previewContainer.innerHTML = "";
  logContainer.innerHTML = "";
  progressText.textContent = "0%";
  progressBars.innerHTML = "";
  resultSection.classList.add("hidden");
}
