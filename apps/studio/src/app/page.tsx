"use client";

import { useEffect, useMemo, useState } from "react";

type ProjectResp = {
  id: string;
  name: string;
  branches: { id: string; name: string; specYaml?: string | null; planJson?: string | null }[];
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
  const [prompt, setPrompt] = useState("Build me a dashboard for sales analytics");
  const [specYaml, setSpecYaml] = useState("");
  const [planJson, setPlanJson] = useState("");
  const [error, setError] = useState<string | null>(null);

  const branchId = useMemo(() => project?.branches?.[0]?.id ?? null, [project]);

  async function createProject() {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Demo" })
    });

    if (!res.ok) throw new Error("failed to create project");
    const json: ProjectResp = await res.json();
    setProject(json);
    return json;
  }

  async function refreshRuns() {
    const res = await fetch("/api/runs");
    setRuns(await res.json());
  }

  async function startRun() {
    setError(null);
    try {
      const currentProject = project ?? (await createProject());
      const safeBranchId = currentProject.branches[0]?.id;
      if (!safeBranchId) throw new Error("missing branch id");

      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ branchId: safeBranchId, workspaceSlug })
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "failed to create run");
      }

      await refreshRuns();
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to start run");
    }
  }

  async function loadRun(id: string) {
    const res = await fetch(`/api/runs/${id}`);
    setSelectedRun(await res.json());
  }

  async function generateSpec() {
    setError(null);
    try {
      const currentProject = project ?? (await createProject());
      const safeBranchId = currentProject.branches[0]?.id;
      if (!safeBranchId) throw new Error("missing branch id");

      const res = await fetch(`/api/branches/${safeBranchId}/spec`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const body = (await res.json()) as { error?: string; specYaml?: string | null };
      if (!res.ok) throw new Error(body.error ?? "failed to generate spec");
      setSpecYaml(body.specYaml ?? "");
      setPlanJson("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to generate spec");
    }
  }

  async function generatePlan() {
    if (!branchId) {
      setError("create project first");
      return;
    }

    setError(null);
    try {
      const res = await fetch(`/api/branches/${branchId}/plan`, {
        method: "POST"
      });
      const body = (await res.json()) as { error?: string; planJson?: string | null };
      if (!res.ok) throw new Error(body.error ?? "failed to generate plan");
      setPlanJson(body.planJson ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to generate plan");
    }
  }

  useEffect(() => {
    refreshRuns();
    const timer = setInterval(refreshRuns, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-6 py-8 space-y-8">
      <section className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">Vibe Studio (MVP+)</h1>
        <p className="text-sm text-zinc-400">Spec/Plan generation + run queue integration on App Router.</p>

        <div className="grid md:grid-cols-4 gap-3 items-end">
          <label className="md:col-span-2 text-sm space-y-1">
            <span className="text-zinc-400">Prompt</span>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 p-2"
            />
          </label>

          <label className="text-sm space-y-1">
            <span className="text-zinc-400">workspaceSlug</span>
            <input
              value={workspaceSlug}
              onChange={(e) => setWorkspaceSlug(e.target.value)}
              className="w-full rounded-md bg-zinc-900 border border-zinc-700 p-2"
            />
          </label>

          <button onClick={createProject} className="rounded-md border border-zinc-600 p-2 hover:bg-zinc-900">
            Create Project
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={generateSpec} className="rounded-md bg-blue-600 px-3 py-2 text-sm">
            1) Generate spec.yaml
          </button>
          <button onClick={generatePlan} className="rounded-md bg-purple-600 px-3 py-2 text-sm" disabled={!branchId}>
            2) Generate plan.json
          </button>
          <button onClick={startRun} className="rounded-md bg-emerald-600 px-3 py-2 text-sm">
            3) Run BUILD
          </button>
          <button onClick={refreshRuns} className="rounded-md border border-zinc-600 px-3 py-2 text-sm">
            Refresh Runs
          </button>
          <span className="text-xs text-zinc-400 self-center">BranchId: {branchId ?? "-"}</span>
        </div>

        {error && <p className="text-red-400 text-sm">Error: {error}</p>}
      </section>

      <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-950">
          <h2 className="font-semibold mb-2">spec.yaml</h2>
          <pre className="text-xs text-zinc-300 whitespace-pre-wrap max-h-72 overflow-auto">{specYaml || "(not generated)"}</pre>
        </div>

        <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-950">
          <h2 className="font-semibold mb-2">plan.json</h2>
          <pre className="text-xs text-zinc-300 whitespace-pre-wrap max-h-72 overflow-auto">{planJson || "(not generated)"}</pre>
        </div>
      </section>

      <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-950">
          <h2 className="font-semibold mb-2">Runs</h2>
          <ul className="space-y-2 max-h-64 overflow-auto">
            {runs.length === 0 && <li className="text-sm text-zinc-400">No runs yet.</li>}
            {runs.map((r) => (
              <li key={r.id} className="text-sm">
                <button className="underline" onClick={() => loadRun(r.id)}>
                  {r.id.slice(0, 8)}
                </button>{" "}
                — {r.status} — {new Date(r.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-950">
          <h2 className="font-semibold mb-2">Run Logs</h2>
          <pre className="text-xs text-zinc-300 whitespace-pre-wrap max-h-64 overflow-auto">
            {selectedRun ? (selectedRun.logs ?? "(no logs yet)") : "Select a run."}
          </pre>
        </div>
      </section>
    </main>
  );
}
