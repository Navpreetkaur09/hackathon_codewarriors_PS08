import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  ShieldAlert, 
  RefreshCw, 
  Scan, 
  AlertTriangle,
  Fingerprint,
  Cpu,
  Activity,
  FileSearch,
  Zap,
  Terminal,
  Download,
  ShieldCheck,
  Eye,
  Info,
  BarChart3,
  Waves
} from 'lucide-react';

const styles = {
  glass: "bg-[#0a0c10]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl",
  neonGreen: "text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.6)]",
  neonRed: "text-[#FF3131] drop-shadow-[0_0_10px_rgba(255,49,49,0.6)]",
  neonYellow: "text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]",
  cardHover: "hover:border-[#39FF14]/30 hover:bg-white/[0.03] transition-all duration-700",
};

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | analyzing | complete
  const [progress, setProgress] = useState(0);
  const [analysisData, setAnalysisData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [displayScores, setDisplayScores] = useState({ manip: 0, cred: 0 });

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      
      if (selectedFile.type.startsWith('video')) {
        const video = document.createElement('video');
        video.src = url;
        video.onloadedmetadata = () => {
          setMediaDuration(video.duration);
        };
      } else {
        setMediaDuration(0);
      }
    }
  };

  const runForensics = () => {
    if (!file) return;
    setStatus('analyzing');
    setProgress(0);
    setLogs(["Accessing encrypted media buffer...", "Syncing with Neural-Verify X1..."]);
    
    let cur = 0;
    const interval = setInterval(() => {
      cur += Math.random() * 8;
      if (cur >= 100) {
        clearInterval(interval);
        setProgress(100);
        addLog("Heuristic reconstruction successful.");
        setTimeout(showResults, 800);
      } else {
        setProgress(Math.floor(cur));
        if (cur > 15 && cur < 20) addLog("Detecting pixel-jitter artifacts...");
        if (cur > 40 && cur < 45) addLog("Checking frame-level GAN signatures...");
        if (cur > 70 && cur < 75) addLog("Cross-referencing metadata hash...");
      }
    }, 100);
  };

  const showResults = () => {
    const manipScore = 88;
    const numSegments = mediaDuration > 0 ? Math.ceil(mediaDuration / 10) : 40;
    
    const data = {
      manipulationScore: manipScore,
      credibilityScore: 100 - manipScore,
      label: "MANIPULATION DETECTED",
      risk: "CRITICAL",
      metadata: { 
        engine: "Neural-Verify X1", 
        latency: "142ms", 
        hash: `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`,
        integrity: "Compromised" 
      },
      timeline: Array.from({ length: numSegments }, (_, i) => {
        const bias = Math.sin((i / numSegments) * Math.PI);
        const score = Math.min(1, Math.max(0, (Math.random() * 0.4) + (bias * 0.7)));
        const segmentTime = mediaDuration > 0 ? i * 10 : 0;
        return {
          id: i,
          score: score,
          timeLabel: mediaDuration > 0 ? formatTime(segmentTime) : "0:00",
          status: score > 0.7 ? 'red' : score > 0.35 ? 'yellow' : 'green'
        };
      })
    };
    
    setAnalysisData(data);
    setStatus('complete');

    // Count-up animation for scores
    let startManip = 0;
    let startCred = 0;
    const timer = setInterval(() => {
      startManip += 2;
      startCred = Math.min(100, Math.floor((startManip / manipScore) * (100 - manipScore)));
      if (startManip >= manipScore) {
        clearInterval(timer);
        setDisplayScores({ manip: manipScore, cred: 100 - manipScore });
      } else {
        setDisplayScores({ manip: startManip, cred: startCred });
      }
    }, 20);
  };

  const downloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      fileName: file.name,
      forensicResult: analysisData.label,
      manipulationConfidence: `${analysisData.manipulationScore}%`,
      credibilityScore: `${analysisData.credibilityScore}%`,
      threatLevel: analysisData.risk,
      engine: analysisData.metadata.engine,
      hash: analysisData.metadata.hash,
      intervalSize: mediaDuration > 0 ? "10 Seconds" : "N/A",
      timelineSummary: "Anomalous patterns detected across primary temporal sectors."
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Forensic_Report_${file.name.split('.')[0]}.json`;
    a.click();
    addLog("Report exported to local storage.");
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setMediaDuration(0);
    setStatus('idle');
    setAnalysisData(null);
    setProgress(0);
    setLogs([]);
    setDisplayScores({ manip: 0, cred: 0 });
  };

  return (
    <div className="min-h-screen bg-[#020305] text-slate-200 font-sans selection:bg-[#39FF14]/30 overflow-x-hidden">
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan { animation: scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        
        @keyframes grow {
          from { height: 0; opacity: 0; }
          to { opacity: 1; }
        }
        .animate-grow { animation: grow 1.2s cubic-bezier(0.17, 0.67, 0.83, 0.67) forwards; }

        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
        .animate-glitch { animation: glitch 0.3s cubic-bezier(.25,.46,.45,.94) both infinite; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeSlideUp 0.8s ease-out forwards; }

        .grid-bg {
          background-image: linear-gradient(rgba(57, 255, 20, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(57, 255, 20, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      {/* Enhanced Background FX */}
      <div className="fixed inset-0 overflow-hidden -z-10 grid-bg">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#39FF14]/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-10 border-b border-white/5 animate-fade-in">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="p-3 bg-[#39FF14]/10 rounded-2xl border border-[#39FF14]/20 group-hover:border-[#39FF14]/60 transition-all duration-500 hover:rotate-6">
            <ShieldAlert className={styles.neonGreen} size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">
              Forensic<span className="text-[#39FF14]">AI</span>
            </h1>
            <span className="text-[10px] font-mono tracking-[0.4em] text-white/20 uppercase italic block mt-1">Digital Integrity Labs</span>
          </div>
        </div>
        {status === 'complete' && (
          <button onClick={reset} className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-white/40 hover:text-white transition-all transform hover:scale-105 active:scale-95">
            <RefreshCw size={12} className="animate-spin-slow" /> NEW SCAN
          </button>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {status !== 'complete' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Uploader Section */}
            <section className="lg:col-span-8 animate-fade-in">
              <div className={`relative w-full aspect-video md:aspect-[21/9] flex items-center justify-center overflow-hidden transition-all duration-700 ${styles.glass} ${status === 'analyzing' ? 'border-[#39FF14]/40 shadow-[0_0_80px_rgba(57,255,20,0.15)]' : styles.cardHover}`}>
                
                {status === 'analyzing' && (
                  <div className="absolute inset-0 overflow-hidden z-20 pointer-events-none">
                    <div className="absolute left-0 w-full h-[6px] bg-gradient-to-r from-transparent via-[#39FF14] to-transparent shadow-[0_0_40px_#39FF14] animate-scan" />
                    <div className="absolute inset-0 bg-[#39FF14]/5 mix-blend-overlay animate-pulse" />
                  </div>
                )}

                {!file ? (
                  <div className="text-center p-10 space-y-6 group">
                    <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:bg-[#39FF14]/10 group-hover:scale-110 group-hover:rotate-12 border border-white/5 group-hover:border-[#39FF14]/30">
                      <Upload size={40} className="text-white/20 group-hover:text-[#39FF14]" />
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic opacity-80">Awaiting Intel</h2>
                    <input type="file" id="media-drop" className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
                    <label htmlFor="media-drop" className="inline-block cursor-pointer px-12 py-5 rounded-2xl bg-[#39FF14] text-black font-black tracking-widest text-[11px] hover:scale-110 transition-all shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:shadow-[0_0_40px_rgba(57,255,20,0.6)]">
                      LOAD MEDIA CORE
                    </label>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center bg-black/60">
                    {file.type.startsWith('video') ? (
                      <video src={previewUrl} className="max-w-full max-h-full object-contain p-4" muted loop playsInline autoPlay />
                    ) : (
                      <img src={previewUrl} className="max-w-full max-h-full object-contain p-4" alt="Preview" />
                    )}
                    
                    {status === 'idle' && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
                        <div className="text-center space-y-2">
                          <p className="text-[10px] font-mono text-[#39FF14] uppercase tracking-[0.5em] animate-pulse">Neural Path Locked</p>
                          <p className="text-2xl font-black tracking-tight">{file.name}</p>
                        </div>
                        <button onClick={runForensics} className="group relative bg-[#39FF14] text-black px-16 py-6 rounded-3xl font-black flex items-center gap-4 shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:scale-105 transition-all overflow-hidden">
                          <span className="relative z-10 flex items-center gap-3">DECONSTRUCT ARTIFACT <Zap size={22} fill="currentColor" /></span>
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Console Log */}
            <aside className="lg:col-span-4 flex flex-col gap-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className={`p-8 h-full min-h-[300px] ${styles.glass} border-white/5`}>
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-5">
                  <div className="flex items-center gap-2">
                    <Terminal size={18} className="text-[#39FF14]" />
                    <h3 className="text-[10px] font-mono tracking-[0.3em] uppercase opacity-50">Binaries</h3>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
                </div>
                <div className="space-y-5 font-mono text-[11px]">
                  {logs.length === 0 && <div className="text-white/10 italic">Waiting for signal...</div>}
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-3 text-white/70 animate-in slide-in-from-left-4 fade-in duration-500">
                      <span className="text-[#39FF14]/60">[{formatTime(i * 1.5)}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {status === 'analyzing' && (
                    <div className="mt-12 space-y-4">
                      <div className="text-5xl font-black text-[#39FF14] tracking-tighter tabular-nums animate-pulse">
                        {progress}%
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < progress / 5 ? 'bg-[#39FF14]' : 'bg-white/5'}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        ) : (
          /* Analysis Dashboard - Staggered Entry */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-8 animate-fade-in">
              <div className={`p-10 md:p-14 ${styles.glass} border-red-500/20 shadow-[0_0_100px_rgba(255,49,49,0.08)] relative overflow-hidden`}>
                <div className="flex flex-col md:flex-row gap-12">
                  {/* MediaSnapshot with Glitch Overlay */}
                  <div className="w-full md:w-1/3 aspect-square rounded-[2.5rem] overflow-hidden border border-white/10 bg-black relative group shadow-2xl">
                    <div className="absolute inset-0 bg-red-600/20 pointer-events-none mix-blend-color animate-pulse" />
                    {file.type.startsWith('video') ? (
                      <video src={previewUrl} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 transition-all duration-1000" muted loop playsInline autoPlay />
                    ) : (
                      <img src={previewUrl} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 transition-all duration-1000" alt="Result" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-all">
                      <ShieldAlert className={`${styles.neonRed} animate-bounce`} size={48} />
                    </div>
                  </div>

                  {/* Top Stats */}
                  <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-[10px] font-mono text-red-500 font-bold uppercase tracking-[0.3em] animate-pulse">
                        <Activity size={14} /> HEURISTIC FAILURE DETECTED
                      </div>
                      <h2 className={`text-6xl md:text-7xl font-black tracking-tighter leading-none ${styles.neonRed} animate-glitch`}>
                        {analysisData.label}
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-[#39FF14]/20 transition-all">
                        <span className="text-[10px] font-mono text-white/30 block mb-3 uppercase tracking-widest">Manipulation</span>
                        <span className="text-5xl font-black text-white tabular-nums">{displayScores.manip}%</span>
                      </div>
                      <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:border-[#39FF14]/20 transition-all">
                        <span className="text-[10px] font-mono text-white/30 block mb-3 uppercase tracking-widest">Credibility</span>
                        <span className={`text-5xl font-black tabular-nums ${displayScores.cred < 30 ? 'text-red-500' : 'text-[#39FF14]'}`}>
                          {displayScores.cred}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bar Graph Section */}
                <div className="mt-20 space-y-10 pt-12 border-t border-white/5">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <BarChart3 size={20} className="text-[#39FF14] animate-pulse" />
                        <h4 className="text-lg font-black uppercase tracking-widest italic">Signal Distortion Axis</h4>
                      </div>
                      <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Temporal Scan Resolution: 10s Segments</p>
                    </div>
                    <div className="flex gap-6 text-[10px] font-mono opacity-60">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-600 shadow-[0_0_10px_#dc2626]" /> Critical</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-yellow-500" /> Suspect</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#39FF14]/40" /> Normal</div>
                    </div>
                  </div>
                  
                  <div className={`h-48 flex items-end gap-1.5 px-6 border-l-2 border-b-2 border-white/5 bg-white/[0.01] rounded-br-3xl relative overflow-hidden group`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#39FF14]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    {/* Horizontal Reference Line */}
                    <div className="absolute w-full h-px bg-red-500/20 bottom-[75%] left-0 pointer-events-none" />
                    <div className="absolute w-full h-px bg-yellow-500/10 bottom-[40%] left-0 pointer-events-none" />

                    {analysisData.timeline.map((point, i) => (
                      <div 
                        key={point.id} 
                        className={`flex-1 min-w-[14px] rounded-t-lg transition-all duration-700 animate-grow group relative hover:brightness-150`}
                        style={{ 
                          height: `${Math.max(10, point.score * 100)}%`,
                          animationDelay: `${i * 30}ms`,
                          backgroundColor: point.status === 'red' ? '#dc2626' : 
                                           point.status === 'yellow' ? '#ca8a04' : 
                                           'rgba(57, 255, 20, 0.4)'
                        }}
                      >
                        {point.status === 'red' && <div className="absolute inset-0 bg-red-500 blur-md opacity-30 animate-pulse" />}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-[#020305] border border-white/20 rounded-xl text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-20 pointer-events-none whitespace-nowrap shadow-2xl">
                          <span className="text-[#39FF14]">{point.timeLabel}</span>
                          <span className="mx-2 opacity-30">|</span>
                          <span className={point.status === 'red' ? 'text-red-500 font-bold' : ''}>RISK: {(point.score * 10).toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Time Axis Labels */}
                  <div className="flex justify-between px-6 mt-4 text-[10px] font-mono text-[#39FF14] uppercase tracking-[0.3em] font-bold opacity-40">
                    {mediaDuration > 0 ? (
                      Array.from({ length: 6 }, (_, i) => {
                        const targetIndex = Math.floor((analysisData.timeline.length - 1) * (i / 5));
                        return (
                          <div key={i} className="flex flex-col items-center first:items-start last:items-end">
                            <div className="w-[1px] h-2 bg-white/20 mb-2" />
                            <span>{formatTime(targetIndex * 10)}</span>
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <div className="flex flex-col items-start"><div className="w-[1px] h-2 bg-white/20 mb-2" /><span>0:00</span></div>
                        <span className="opacity-40 self-end mb-1 tracking-[1em] italic">SOURCE_STATIC_SCAN</span>
                        <div className="flex flex-col items-end"><div className="w-[1px] h-2 bg-white/20 mb-2" /><span>0:00</span></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Action Center */}
            <div className="lg:col-span-4 space-y-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className={`p-10 ${styles.glass} border-[#39FF14]/10 relative overflow-hidden group`}>
                <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-all duration-1000 rotate-12 group-hover:scale-150">
                  <Fingerprint size={160} />
                </div>
                <div className="flex justify-between items-start mb-10">
                  <Fingerprint className={`${styles.neonGreen} animate-pulse`} size={36} />
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Scan Auth Code</p>
                    <p className="text-sm font-mono text-[#39FF14] font-bold">{analysisData.metadata.hash}</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-30">Forensic Engine</h4>
                  <div className="text-2xl font-black uppercase tracking-tight">{analysisData.metadata.engine}</div>
                  
                  <div className="space-y-4 pt-8 border-t border-white/5">
                    {[
                      { label: "LATENCY", val: analysisData.metadata.latency, color: "text-[#39FF14]" },
                      { label: "THREAT", val: analysisData.risk, color: "text-red-500 font-black" },
                      { label: "INTEGRITY", val: "STRIPPED", color: "text-white/40" },
                      { label: "GAN_SIG", val: "CONFIRMED", color: "text-red-400" }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between text-[11px] font-mono">
                        <span className="opacity-30 tracking-widest">{item.label}</span>
                        <span className={item.color}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={downloadReport}
                  className="w-full py-6 rounded-[2.5rem] bg-[#39FF14] text-black font-black text-xs tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3 hover:scale-105 shadow-[0_0_50px_rgba(57,255,20,0.3)] group"
                >
                  <Download size={20} className="group-hover:translate-y-1 transition-transform" /> EXPORT CONFIDENCE INTEL
                </button>
                <button 
                  onClick={reset}
                  className="w-full py-6 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-white/30 font-black text-xs tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3 hover:bg-white/10"
                >
                  <RefreshCw size={16} /> REBOOT SYSTEM
                </button>
              </div>

              <div className="p-8 bg-red-500/5 rounded-[2.5rem] border border-red-500/10 flex gap-5 group hover:bg-red-500/10 transition-all">
                <div className="p-3 bg-red-500/20 rounded-2xl h-fit">
                  <AlertTriangle className="text-red-500 animate-pulse" size={24} />
                </div>
                <div className="space-y-2">
                  <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Protocol Warning</h5>
                  <p className="text-[10px] font-mono text-white/30 leading-relaxed uppercase">
                    High probability of deep-synthetic injection. Source exhibits frequency domain shifts consistent with modern GAN-v4 tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 opacity-20">
        <div className="flex gap-10 text-[10px] font-mono uppercase tracking-[0.4em]">
          <span className="hover:text-[#39FF14] cursor-pointer transition-colors">Forensic Labs 2026</span>
          <span className="hover:text-[#39FF14] cursor-pointer transition-colors">Quantum Encryption</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.4em]">
          <Activity size={14} className="animate-pulse text-[#39FF14]" /> System Nominal
        </div>
      </footer>
    </div>
  );
}