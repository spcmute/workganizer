import Dexie, { type Table } from "dexie";

export interface Project {
  id?: number;
  nome: string;
  ideia: string;
  linguagens: string[];
  prompt: string;
  categoria: string;
  createdAt: number;
}

export interface WorkganizerDB extends Dexie {
  projects: Table<Project>;
}

export const db = new Dexie("workganizer") as WorkganizerDB;

db.version(1).stores({
  projects: "++id, nome, createdAt",
});

db.version(2).stores({
  projects: "++id, nome, createdAt, categoria",
}).upgrade((tx) => {
  return tx.table("projects").toCollection().modify((p) => {
    if (!p.categoria) p.categoria = "Geral";
  });
});

export async function getAllProjects(): Promise<Project[]> {
  return db.projects.orderBy("createdAt").reverse().toArray();
}

export async function addProject(
  p: Omit<Project, "id" | "createdAt">
): Promise<number> {
  const id = await db.projects.add({ ...p, createdAt: Date.now() });
  return id as number;
}

export async function updateProject(
  id: number,
  changes: Partial<Project>
): Promise<void> {
  await db.projects.update(id, changes);
}

export async function deleteProject(id: number): Promise<void> {
  await db.projects.delete(id);
}

export async function exportProjectsToJson(): Promise<string> {
  const projects = await getAllProjects();
  return JSON.stringify({ projetos: projects }, null, 2);
}

export async function importProjects(
  projects: Omit<Project, "id" | "createdAt">[]
): Promise<void> {
  const rows = projects.map((p) => ({ ...p, createdAt: Date.now() }));
  await db.projects.bulkAdd(rows);
}

function extractLangs(item: Record<string, unknown>): string[] {
  if (Array.isArray(item["linguagens"])) {
    return (item["linguagens"] as unknown[]).map(String);
  }
  if (Array.isArray(item["languages"])) {
    return (item["languages"] as unknown[]).map(String);
  }
  return [];
}

export function parseJsonFile(
  raw: string
): Omit<Project, "id" | "createdAt">[] {
  const parsed = JSON.parse(raw) as unknown;

  let list: Record<string, unknown>[] = [];
  if (Array.isArray(parsed)) {
    list = parsed as Record<string, unknown>[];
  } else if (parsed !== null && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj["projetos"])) {
      list = obj["projetos"] as Record<string, unknown>[];
    }
  }

  return list.map((item) => ({
    nome: String(item["nome"] ?? item["name"] ?? ""),
    ideia: String(item["ideia"] ?? item["idea"] ?? item["description"] ?? ""),
    linguagens: extractLangs(item),
    prompt: String(item["prompt"] ?? ""),
    categoria: String(item["categoria"] ?? item["category"] ?? "Geral"),
  }));
}
