import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, deleteProject, type Project } from "./db/database";
import ImportModal from "./components/ImportModal";
import CreateModal from "./components/CreateModal";
import AIModal from "./components/AIModal";
import EditModal from "./components/EditModal";
import SettingsModal from "./components/SettingsModal";
import ProjectCard from "./components/ProjectCard";

type Modal = "import" | "create" | "ai" | "edit" | "settings" | null;

export default function App() {
  const [modal, setModal] = useState<Modal>(null);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todos");

  const projects = useLiveQuery(() =>
    db.projects.orderBy("createdAt").reverse().toArray()
  ) ?? [];

  const categories = ["Todos", ...Array.from(new Set(projects.map((p) => p.categoria || "Geral"))).sort()];

  const filtered = projects.filter((p) => {
    const matchesCategory = activeCategory === "Todos" || (p.categoria || "Geral") === activeCategory;
    const matchesSearch =
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.ideia.toLowerCase().includes(search.toLowerCase()) ||
      p.linguagens.some((l) => l.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  function openEdit(p: Project) {
    setEditTarget(p);
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditTarget(null);
  }

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-left">
          <span className="logo">⬡ workganizer</span>
          <span className="count">{projects.length} projeto{projects.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => setModal("settings")}>
            ⚙ Config IA
          </button>
          <button className="btn btn-ghost" onClick={() => setModal("import")}>
            ↑ Importar JSON
          </button>
          <button className="btn btn-secondary" onClick={() => setModal("ai")}>
            ✦ Prompt IA
          </button>
          <button className="btn btn-primary" onClick={() => setModal("create")}>
            + Novo Projeto
          </button>
        </div>
      </header>

      {/* ── Search ── */}
      <div className="search-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Pesquisar projetos, linguagens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch("")}>
            ✕
          </button>
        )}
      </div>

      {/* ── Category Tabs ── */}
      {categories.length > 1 && (
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={"category-tab" + (cat === activeCategory ? " active" : "")}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              {cat !== "Todos" && (
                <span className="category-count">
                  {projects.filter((p) => (p.categoria || "Geral") === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Grid ── */}
      <main className="grid">
        {filtered.length === 0 && (
          <div className="empty-state">
            {search || activeCategory !== "Todos" ? (
              <>Sem resultados{search ? <> para <strong>"{search}"</strong></> : ""}{activeCategory !== "Todos" ? <> em <strong>{activeCategory}</strong></> : ""}</>
            ) : (
              <>
                <p className="empty-icon">⬡</p>
                <p>Nenhum projeto ainda.</p>
                <p className="empty-hint">Importa um JSON, cria do zero ou usa o Prompt IA.</p>
              </>
            )}
          </div>
        )}
        {filtered.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            onEdit={() => openEdit(p)}
            onDelete={() => p.id && deleteProject(p.id)}
          />
        ))}
      </main>

      {/* ── Modals ── */}
      {modal === "settings"  && <SettingsModal onClose={closeModal} />}
      {modal === "import"    && <ImportModal onClose={closeModal} />}
      {modal === "create"    && <CreateModal onClose={closeModal} />}
      {modal === "ai"        && <AIModal onClose={closeModal} />}
      {modal === "edit" && editTarget && (
        <EditModal project={editTarget} onClose={closeModal} />
      )}
    </div>
  );
}
