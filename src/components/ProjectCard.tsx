import { useState } from "react";
import type { Project } from "../db/database";

const LANG_COLORS: Record<string, string> = {
  "TypeScript": "#3178c6", "JavaScript": "#f7df1e", "Rust": "#ce422b",
  "React": "#61dafb", "Node.js": "#3c873a", "Java": "#f89820",
  "Python": "#3572a5", "Go": "#00add8", "Docker": "#2496ed",
  "PostgreSQL": "#336791", "Redis": "#dc382d", "Next.js": "#222",
  "CSS": "#563d7c", "Markdown": "#083fa1", "Spring Boot": "#6db33f",
  "WebSockets": "#f5a623", "GitHub Actions": "#2088ff",
};

function langColor(lang: string) { return LANG_COLORS[lang] ?? "#555"; }

interface Props {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  function copyPrompt() {
    if (!project.prompt) return;
    navigator.clipboard.writeText(project.prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <article className="card">
      <div className="card-header">
        <h2 className="card-title">{project.nome}</h2>
        <div className="card-actions">
          <button className="icon-btn" title="Editar" onClick={onEdit}>e</button>
          <button className="icon-btn danger" title="Eliminar" onClick={onDelete}>x</button>
        </div>
      </div>

      <p className="card-idea">{project.ideia}</p>

      <div className="card-langs">
        {project.linguagens.map((lang) => (
          <span key={lang} className="lang-badge" style={{ backgroundColor: langColor(lang) }}>
            {lang}
          </span>
        ))}
      </div>

      {project.prompt && (
        <div className="card-prompt-section">
          <div className="card-prompt-header">
            <span className="card-prompt-label">Prompt Claude</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button className="icon-btn" title={expanded ? "Recolher" : "Expandir"} onClick={() => setExpanded(!expanded)}>
                {expanded ? "^" : "v"}
              </button>
              <button className="icon-btn" title="Copiar prompt" onClick={copyPrompt}>
                {copied ? "ok" : "copy"}
              </button>
            </div>
          </div>
          {expanded && <p className="card-prompt-text">{project.prompt}</p>}
        </div>
      )}
    </article>
  );
}
