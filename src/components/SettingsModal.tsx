import { useState, useEffect } from "react";
import { loadAIConfig, saveAIConfig, type AIConfig } from "../lib/aiConfig";

interface Props { onClose: () => void; }

const DEFAULTS: AIConfig = {
  mode: "local",
  url: "http://localhost:11434/v1/chat/completions",
  apiKey: "",
  model: "qwen3:8b",
};

export default function SettingsModal({ onClose }: Props) {
  const [cfg, setCfg] = useState<AIConfig>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    loadAIConfig().then((c) => { setCfg(c); setLoading(false); });
  }, []);

  function update(patch: Partial<AIConfig>) {
    setCfg((prev) => ({ ...prev, ...patch }));
    setSaved(false);
    setSaveError("");
  }

  function handleModeChange(mode: "local" | "remote") {
    if (mode === "local") {
      update({ mode, url: "http://localhost:11434/v1/chat/completions", apiKey: "", model: "qwen3:8b" });
    } else {
      update({ mode, url: "https://api.openai.com/v1/chat/completions", apiKey: "", model: "gpt-4o-mini" });
    }
  }

  async function handleSave() {
    setSaveError("");
    try {
      await saveAIConfig(cfg);
      setSaved(true);
      setTimeout(onClose, 700);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erro ao guardar config.");
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Config IA</h2>
          <button className="icon-btn" onClick={onClose}>X</button>
        </div>

        {loading ? (
          <p className="modal-hint">A carregar...</p>
        ) : (
          <>
            <label className="field-label">Modo</label>
            <div className="settings-mode-row">
              <button
                className={"settings-mode-btn" + (cfg.mode === "local" ? " active" : "")}
                onClick={() => handleModeChange("local")}
              >
                Local (Ollama)
              </button>
              <button
                className={"settings-mode-btn" + (cfg.mode === "remote" ? " active" : "")}
                onClick={() => handleModeChange("remote")}
              >
                Remoto (API)
              </button>
            </div>

            <label className="field-label">URL do endpoint</label>
            <input
              className="field-input"
              value={cfg.url}
              onChange={(e) => update({ url: e.target.value })}
              placeholder="https://..."
            />

            {cfg.mode === "remote" && (
              <>
                <label className="field-label">API Key</label>
                <input
                  className="field-input"
                  type="password"
                  value={cfg.apiKey}
                  onChange={(e) => update({ apiKey: e.target.value })}
                  placeholder="sk-..."
                />
              </>
            )}

            <label className="field-label">Modelo</label>
            <input
              className="field-input"
              value={cfg.model}
              onChange={(e) => update({ model: e.target.value })}
              placeholder={cfg.mode === "local" ? "qwen3:8b" : "gpt-4o-mini"}
            />

            <p className="modal-hint">
              {cfg.mode === "local"
                ? "Ollama deve estar em execução localmente. Instala modelos com: ollama pull qwen3:8b"
                : "Qualquer provider compatível com a API OpenAI (OpenAI, OpenRouter, Anthropic via proxy, etc.)"}
              <br />
              <span style={{ opacity: 0.6 }}>Guardado em %APPDATA%\workganizer\ai-config.json</span>
            </p>

            {saveError && <p className="error">{saveError}</p>}
          </>
        )}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {saved ? "Guardado!" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
