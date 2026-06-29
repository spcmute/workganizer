import { useState } from "react";
import { addProject, type Project } from "../db/database";
import { generateProjectsFromPrompt } from "../lib/ollama";

interface Props { onClose: () => void; }

type Generated = Omit<Project, "id" | "createdAt">;

export default function AIModal({ onClose }: Props) {
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState<Generated[]>([]);
  const [saving, setSaving] = useState(false);

  async function generate() {
    if (!userPrompt.trim()) return;
    setLoading(true);
    setError("");
    setGenerated([]);
    try {
      const result = await generateProjectsFromPrompt(userPrompt);
      setGenerated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }

  async function saveAll() {
    setSaving(true);
    for (const p of generated) await addProject(p);
    setSaving(false);
    onClose();
  }

  function removeItem(i: number) { setGenerated(generated.filter((_, idx) => idx !== i)); }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Prompt IA</h2>
          <button className="icon-btn" onClick={onClose}>X</button>
        </div>

        <p className="modal-hint">
          Ollama <strong>qwen3:8b</strong> em localhost:11434. Gera nome, ideia, linguagens e prompt Claude para cada projeto.
        </p>

        <label className="field-label">O que queres criar?</label>
        <textarea
          className="field-input field-textarea"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="ex: Cria 5 ideias de projetos full stack com Node.js e React para portfolio de developer junior"
          rows={4}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) generate(); }}
        />
        <p className="modal-hint">Ctrl+Enter para gerar</p>

        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary" onClick={generate} disabled={loading || !userPrompt.trim()}>
          {loading ? "A gerar..." : "Gerar com IA"}
        </button>

        {generated.length > 0 && (
          <>
            <p className="preview-label" style={{ marginTop: 8 }}>
              {generated.length} projeto(s) — remove os que nao queres:
            </p>
            <ul className="preview-list">
              {generated.map((p, i) => (
                <li key={i} className="preview-item">
                  <div className="preview-item-text">
                    <strong>{p.nome}</strong>
                    <span className="preview-langs">{p.linguagens.join(", ")}</span>
                    <span className="preview-idea">{p.ideia}</span>
                    {p.prompt && <span className="preview-prompt">{p.prompt}</span>}
                  </div>
                  <button className="icon-btn danger" onClick={() => removeItem(i)}>x</button>
                </li>
              ))}
            </ul>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveAll} disabled={saving || generated.length === 0}>
                {saving ? "A guardar..." : "Guardar " + generated.length + " projeto(s)"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
