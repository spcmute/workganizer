import { useState } from "react";
import { updateProject, type Project } from "../db/database";
import { generateClaudePrompt } from "../lib/ollama";

interface Props { project: Project; onClose: () => void; }

export default function EditModal({ project, onClose }: Props) {
  const [nome, setNome] = useState(project.nome);
  const [ideia, setIdeia] = useState(project.ideia);
  const [categoria, setCategoria] = useState(project.categoria ?? "Geral");
  const [langInput, setLangInput] = useState("");
  const [linguagens, setLinguagens] = useState<string[]>([...project.linguagens]);
  const [prompt, setPrompt] = useState(project.prompt ?? "");
  const [genState, setGenState] = useState<"idle"|"loading"|"error">("idle");
  const [genError, setGenError] = useState("");
  const [saving, setSaving] = useState(false);

  function addLang() {
    const v = langInput.trim();
    if (v && !linguagens.includes(v)) setLinguagens([...linguagens, v]);
    setLangInput("");
  }
  function removeLang(l: string) { setLinguagens(linguagens.filter((x) => x !== l)); }

  async function handleGeneratePrompt() {
    setGenState("loading");
    setGenError("");
    try {
      const result = await generateClaudePrompt(nome, ideia, linguagens);
      setPrompt(result);
      setGenState("idle");
    } catch (err) {
      setGenState("error");
      setGenError(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  }

  async function handleSave() {
    if (!project.id || !nome.trim() || !ideia.trim()) return;
    setSaving(true);
    await updateProject(project.id, { nome: nome.trim(), ideia: ideia.trim(), linguagens, prompt, categoria: categoria.trim() || "Geral" });
    setSaving(false);
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Projeto</h2>
          <button className="icon-btn" onClick={onClose}>X</button>
        </div>

        <label className="field-label">Nome *</label>
        <input className="field-input" value={nome} onChange={(e) => setNome(e.target.value)} />

        <label className="field-label">Categoria</label>
        <input className="field-input" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="ex: Web, Mobile, IA..." />

        <label className="field-label">Ideia *</label>
        <textarea className="field-input field-textarea" value={ideia} onChange={(e) => setIdeia(e.target.value)} rows={3} />

        <label className="field-label">Linguagens</label>
        <div className="lang-input-row">
          <input className="field-input" value={langInput} onChange={(e) => setLangInput(e.target.value)} placeholder="Adicionar tecnologia" onKeyDown={(e) => e.key === "Enter" && addLang()} />
          <button className="btn btn-secondary" onClick={addLang}>+</button>
        </div>
        <div className="lang-tags">
          {linguagens.map((l) => (
            <span key={l} className="lang-tag">{l}<button onClick={() => removeLang(l)}>x</button></span>
          ))}
        </div>

        <div className="prompt-label-row">
          <label className="field-label">Prompt Claude</label>
          <button
            className="btn-gen-prompt"
            onClick={handleGeneratePrompt}
            disabled={genState === "loading"}
          >
            {genState === "loading" ? "A melhorar..." : "Melhorar com IA"}
          </button>
        </div>
        {genState === "error" && <p className="error" style={{fontSize:12}}>{genError}</p>}
        <textarea
          className="field-input field-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Prompt para implementar este projeto no Claude..."
          rows={4}
        />

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!nome.trim() || !ideia.trim() || saving}>
            {saving ? "A guardar..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
