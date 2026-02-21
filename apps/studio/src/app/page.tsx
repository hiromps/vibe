"use client";
import { useEffect, useState } from "react";

type ProjectResp = {
  id: string;
  name: string;
  branches: { id: string; name: string }[];
};

type Run = {
  id: string;
  status: string;
  createdAt: string;
  logs: string | null;
  branch: { id: string; name: string; project: { name: string } };
};

export default function Home() {
  const [project, setProject] = useState<ProjectResp | null>(null);
  const [workspaceSlug, setWorkspaceSlug] = useState("sample-app");
  const [runs, setRuns] = useState<Run[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [prompt, setPrompt] = useState("");

  async function createProject() {
    const res = await fetch("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name: "My New App" })
    });
    const json = await res.json();
    setProject(json);
  }

  async function refreshRuns() {
    const res = await fetch("/api/runs");
    setRuns(await res.json());
  }

  async function startRun() {
    if (!project?.branches?.[0]?.id) {
      await createProject(); // プロジェクトがなければ自動作成
    }
    const branchId = project?.branches?.[0]?.id || (await (await fetch("/api/projects", { method: "POST" })).json()).branches[0].id;
    
    await fetch("/api/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ branchId, workspaceSlug })
    });
    refreshRuns();
  }

  async function loadRun(id: string) {
    const res = await fetch(`/api/runs/${id}`);
    setSelectedRun(await res.json());
  }

  useEffect(() => {
    refreshRuns();
    const timer = setInterval(refreshRuns, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-vibe-green selection:text-black pb-24">
      {/* Header */}
      <header className="flex justify-between items-center p-4 md:p-6 border-b border-white/10 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="text-xl md:text-2xl font-bold tracking-tighter">VIBE STUDIO</div>
        <div className="flex gap-3 md:gap-4 items-center">
          <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 md:px-4 py-1 rounded-full font-bold text-xs md:text-sm shadow-[0_0_20px_rgba(234,179,8,0.3)] whitespace-nowrap">
            + Buy Credits
          </button>
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 shrink-0"></div>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        {/* Banner - Hidden on very small screens or adjusted */}
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-2xl p-4 md:p-6 mb-8 md:mb-12 flex justify-between items-center group cursor-pointer hover:border-white/30 transition-all">
          <div className="pr-4">
            <div className="text-blue-400 text-xs md:text-sm font-bold mb-1">75% Off</div>
            <div className="text-base md:text-xl font-medium leading-tight">Celebrating $100M ARR</div>
          </div>
          <div className="bg-white/10 p-2 md:p-3 rounded-full group-hover:bg-white/20 transition-all shrink-0">
            <svg className="w-5 h-5 md:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="text-center mb-8 md:mb-16">
          <div className="text-vibe-green font-mono mb-4 md:mb-6 tracking-widest text-[10px] md:text-sm uppercase">
            Welcome, hiromps
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 tracking-tight leading-tight">Where ideas become reality</h1>
          <p className="text-gray-400 text-sm md:text-lg px-4">Build fully functional apps and websites through simple conversations</p>
        </div>

        {/* Input Area */}
        <div className="relative mb-8 md:mb-12">
          <div className="flex justify-center gap-4 md:gap-6 mb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button className="text-xs md:text-sm font-medium border-b-2 border-white pb-2 px-1 flex items-center gap-2 shrink-0">
              <span className="opacity-70">📁</span> Full Stack App
            </button>
            <button className="text-xs md:text-sm font-medium opacity-50 hover:opacity-100 pb-2 px-1 flex items-center gap-2 shrink-0">
              <span>📱</span> Mobile App
            </button>
            <button className="text-xs md:text-sm font-medium opacity-50 hover:opacity-100 pb-2 px-1 flex items-center gap-2 shrink-0">
              <span>🌐</span> Landing Page
            </button>
          </div>
          
          <div className="bg-[#111] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl">
            <textarea
              className="w-full bg-transparent border-none text-lg md:text-xl focus:ring-0 placeholder:text-gray-600 h-24 md:h-32 resize-none"
              placeholder="Build me a dashboard for..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex justify-between items-center mt-2 md:mt-4">
              <div className="flex gap-3 md:gap-4 opacity-50">
                <button className="hover:opacity-100 text-lg md:text-xl">📎</button>
                <button className="hover:opacity-100 text-lg md:text-xl">🌐</button>
                <button className="hover:opacity-100 text-lg md:text-xl">🎙️</button>
              </div>
              <button 
                onClick={startRun}
                className={`bg-white text-black p-2.5 md:p-3 rounded-xl md:rounded-2xl hover:scale-105 active:scale-95 transition-all ${!prompt && 'opacity-30'}`}
              >
                <svg className="w-5 h-5 md:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Status Area - Stacked on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
            <h2 className="text-[10px] md:text-sm font-bold text-gray-500 mb-4 uppercase tracking-widest">Recent Runs</h2>
            <div className="space-y-3 h-48 md:h-64 overflow-auto pr-2 custom-scrollbar">
              {runs.length === 0 && <div className="text-xs text-gray-600 italic">No runs yet...</div>}
              {runs.map((r) => (
                <div 
                  key={r.id} 
                  onClick={() => loadRun(r.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedRun?.id === r.id ? 'bg-vibe-green/10 border-vibe-green' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <code className="text-[10px] text-vibe-green">{r.id.slice(0, 8)}</code>
                    <span className={`text-[8px] md:text-[10px] px-2 py-0.5 rounded-full ${r.status === 'FAILED' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="text-[8px] md:text-[10px] text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
            <h2 className="text-[10px] md:text-sm font-bold text-gray-500 mb-4 uppercase tracking-widest">Live Logs</h2>
            <pre className="text-[9px] md:text-[10px] font-mono text-gray-400 h-48 md:h-64 overflow-auto bg-black/40 p-3 rounded-lg border border-white/5 custom-scrollbar">
              {selectedRun ? (selectedRun.logs || "(waiting for logs...)") : "Select a run to view output."}
            </pre>
          </div>
        </div>
      </main>

      {/* Footer Alert - Adjusted for mobile */}
      <footer className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 md:px-6 z-50">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 md:p-3 rounded-xl md:rounded-2xl flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-sm md:text-base">🐙</span>
            <span className="text-xs md:text-sm font-medium truncate max-w-[120px] md:max-w-none">Introducing MoltBot</span>
            <span className="bg-red-500 text-white text-[8px] md:text-[10px] font-bold px-1 py-0.5 rounded uppercase">New</span>
          </div>
          <button className="opacity-50 hover:opacity-100 p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
