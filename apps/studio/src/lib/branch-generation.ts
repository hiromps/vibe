export function buildSpecYaml(input: { prompt: string; context?: string }) {
  const safePrompt = input.prompt.trim();
  const safeContext = input.context?.trim() ?? "";

  return [
    "version: 1",
    "kind: app-spec",
    `goal: |\n  ${safePrompt.replace(/\n/g, "\n  ")}`,
    "constraints:",
    "  - Use Next.js App Router",
    "  - Keep incremental changes small",
    "  - Return testable outputs",
    `context: |\n  ${safeContext ? safeContext.replace(/\n/g, "\n  ") : "(none)"}`
  ].join("\n");
}

export function buildPlanJson(specYaml: string) {
  const summary = extractGoal(specYaml);

  return {
    summary,
    tasks: [
      {
        id: "t1",
        title: "Define API contracts",
        description: "Implement/validate route handlers for the requested capability.",
        fileBudget: 3
      },
      {
        id: "t2",
        title: "Implement UI wiring",
        description: "Connect the App Router UI to new APIs with loading/error states.",
        fileBudget: 3
      },
      {
        id: "t3",
        title: "Verify with lint/build",
        description: "Run project checks and record run logs.",
        fileBudget: 2
      }
    ]
  };
}

function extractGoal(specYaml: string) {
  const marker = "goal: |";
  const idx = specYaml.indexOf(marker);
  if (idx === -1) return "Generated implementation plan";

  const lines = specYaml.slice(idx + marker.length).split("\n").map((line) => line.trim());
  const firstContent = lines.find((line) => line.length > 0 && line !== "constraints:" && !line.startsWith("-"));

  return firstContent ?? "Generated implementation plan";
}
