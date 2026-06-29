import { loadAIConfig } from "./aiConfig";

function stripThinkTags(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*/gi, "")
    .trim();
}

async function aiFetch(messages: { role: string; content: string }[], maxTokens: number): Promise<string> {
  const cfg = await loadAIConfig();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cfg.apiKey) headers["Authorization"] = "Bearer " + cfg.apiKey;

  const res = await fetch(cfg.url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  if (!res.ok) throw new Error("AI API " + res.status + ": " + res.statusText);

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

export async function generateClaudePrompt(
  nome: string,
  ideia: string,
  linguagens: string[]
): Promise<string> {
  const raw = await aiFetch([
    {
      role: "system",
      content: "You are a prompt engineer. Generate a concise, actionable Claude prompt (3-5 sentences) that describes exactly how to build the given software project. Include the tech stack, key features to implement, and the expected final deliverable. Return ONLY the prompt text — no preamble, no explanation, no markdown.",
    },
    {
      role: "user",
      content: "Project name: " + nome + "\nDescription: " + ideia + "\nTech stack: " + linguagens.join(", "),
    },
  ], 400);

  const cleaned = stripThinkTags(raw);
  if (!cleaned) throw new Error("A IA devolveu resposta vazia apos remover tags de raciocinio.");
  return cleaned;
}

export type GeneratedProject = {
  nome: string;
  ideia: string;
  linguagens: string[];
  prompt: string;
  categoria: string;
};

export async function generateProjectsFromPrompt(
  userPrompt: string
): Promise<GeneratedProject[]> {
  const systemPrompt = [
    "You are a software project idea generator.",
    "The user describes what kind of projects they want.",
    "Respond with ONLY a valid JSON array — no markdown fences, no explanation, no <think> blocks.",
    "Each item: { \"nome\": \"kebab-case\", \"ideia\": \"one sentence\", \"linguagens\": [\"Lang\"], \"prompt\": \"3-5 sentence Claude prompt\", \"categoria\": \"category name\" }",
  ].join("\n");

  const raw = await aiFetch([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ], 2500);

  const cleaned = stripThinkTags(raw);

  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("A IA nao devolveu JSON valido. Raw: " + cleaned.slice(0, 200));

  const parsed = JSON.parse(match[0]) as GeneratedProject[];
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Array JSON vazio.");

  return parsed.map((p) => ({ ...p, prompt: p.prompt ?? "", categoria: p.categoria ?? "Geral" }));
}
