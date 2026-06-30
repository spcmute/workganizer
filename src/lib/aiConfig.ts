import { appConfigDir } from "@tauri-apps/api/path";
import { readTextFile, writeTextFile, mkdir, exists } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";

const CONFIG_FILE = "ai-config.json";

export interface AIConfig {
  mode: "local" | "remote";
  url: string;
  apiKey: string;
  model: string;
}

const DEFAULTS: AIConfig = {
  mode: "local",
  url: "http://localhost:11434/v1/chat/completions",
  apiKey: "",
  model: "qwen3:8b",
};

async function configPath(): Promise<string> {
  const dir = await appConfigDir();
  return dir + CONFIG_FILE;
}

export async function loadAIConfig(): Promise<AIConfig> {
  try {
    const path = await configPath();
    if (!(await exists(path))) return { ...DEFAULTS };
    const raw = await readTextFile(path);
    return { ...DEFAULTS, ...JSON.parse(raw) } as AIConfig;
  } catch {
    return { ...DEFAULTS };
  }
}

export async function exportAIConfig(): Promise<boolean> {
  const cfg = await loadAIConfig();
  const path = await save({
    defaultPath: "ai-config.json",
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (!path) return false;
  await writeTextFile(path, JSON.stringify(cfg, null, 2));
  return true;
}

export async function saveAIConfig(cfg: AIConfig): Promise<void> {
  const dir = await appConfigDir();
  if (!(await exists(dir))) {
    await mkdir(dir, { recursive: true });
  }
  const path = dir + CONFIG_FILE;
  await writeTextFile(path, JSON.stringify(cfg, null, 2));
}
