import { useState } from "react";
import { addProject } from "../db/database";
import { generateClaudePrompt } from "../lib/ollama";

interface Props { onClose: () => void; }

export default function CreateModal({ onClose }: Props) {
  const [nome, setNome] = useState("");
  const [ideia, setIdeia] = useState("");
  const [categoria, setCategoria] = useState("Geral");
  const [langInput, setLangInput] = useState("");
  const [linguagens, setLinguagens] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
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
    if (!nome.trim() || !ideia.trim()) return;
    setSaving(true);
    await addProject({ nome: nome.trim(), ideia: ideia.trim(), linguagens, prompt, categoria: categoria.trim() || "Geral" });
    setSaving(false);
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Novo Projeto</h2>
          <button className="icon-btn" onClick={onClose}>X</button>
        </div>

        <label className="field-label">Nome *</label>
        <input className="field-input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="ex: node-auth-api" />

        <label className="field-label">Categoria</label>
        <input className="field-input" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="ex: Web, Mobile, IA..." />

        <label className="field-label">Ideia *</label>
        <textarea className="field-input field-textarea" value={ideia} onChange={(e) => setIdeia(e.target.value)} placeholder="Descreve o que o projeto faz..." rows={3} />

        <label className="field-label">Linguagens / Tecnologias</label>
        <div className="lang-input-row">
          <input className="field-input" value={langInput} onChange={(e) => setLangInput(e.target.value)} placeholder="ex: TypeScript" onKeyDown={(e) => e.key === "Enter" && addLang()} />
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
            disabled={genState === "loading" || (!nome.trim() && !ideia.trim())}
          >
            {genState === "loading" ? "A gerar..." : "Gerar com IA"}
          </button>
        </div>
        {genState === "error" && <p className="error" style={{fontSize:12}}>{genError}</p>}
        <textarea
          className="field-input field-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Prompt pronto a usar no Claude. Gerado pela IA ou escrito manualmente."
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
