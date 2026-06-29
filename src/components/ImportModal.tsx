import { useState, useRef } from "react";
import { importProjects, parseJsonFile, type Project } from "../db/database";

interface Props {
  onClose: () => void;
}

export default function ImportModal({ onClose }: Props) {
  const [preview, setPreview] = useState<Omit<Project, "id" | "createdAt">[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string;
        const parsed = parseJsonFile(raw);
        if (parsed.length === 0) throw new Error("Nenhum projeto encontrado no JSON.");
        setPreview(parsed);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "JSON inválido.");
        setPreview([]);
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (preview.length === 0) return;
    setLoading(true);
    await importProjects(preview);
    setLoading(false);
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Importar JSON</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <p className="modal-hint">
          Seleciona um ficheiro <code>.json</code> com a estrutura{" "}
          <code>{"{ projetos: [{nome, ideia, linguagens}] }"}</code>
        </p>

        <input
          ref={fileRef}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleFile}
        />
        <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
          ↑ Escolher ficheiro
        </button>

        {error && <p className="error">{error}</p>}

        {preview.length > 0 && (
          <>
            <p className="preview-label">{preview.length} projeto(s) encontrado(s):</p>
            <ul className="preview-list">
              {preview.map((p, i) => (
                <li key={i}>
                  <strong>{p.nome}</strong> — {p.linguagens.join(", ")}
                </li>
              ))}
            </ul>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleImport} disabled={loading}>
                {loading ? "A importar..." : `Importar ${preview.length} projeto(s)`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
