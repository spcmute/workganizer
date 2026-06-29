# ⬡ workganizer

Organizador de projetos pessoais com geração de prompts via IA local ou remota.  
Construído com **Tauri 2 + React + Dexie (IndexedDB)**.

## Funcionalidades

- **Criar projetos** com nome, ideia, linguagens e um prompt pronto para o Claude
- **Categorias** — organiza projetos por tabs (ex: Web, Mobile, IA, etc.)
- **Pesquisa** em tempo real por nome, ideia ou tecnologias
- **Prompt IA** — gera múltiplos projetos a partir de uma descrição livre
- **Config de IA** — suporta Ollama local ou qualquer provider OpenAI-compatible via URL + key
- **Importar JSON** — bulk import de projetos via ficheiro
- **Copiar prompt** — um clique para copiar o prompt ao clipboard

## Stack

| Camada | Tecnologia |
|---|---|
| Desktop shell | Tauri 2 (Rust) |
| UI | React 18 + TypeScript |
| Estilos | CSS puro (dark theme) |
| Base de dados | Dexie (IndexedDB) |
| IA | Ollama local ou OpenAI-compatible API |

## Configuração da IA

Clica no botão **⚙ Config IA** no header para abrir as definições:

### Modo Local (Ollama)
- URL: `http://localhost:11434/v1/chat/completions` (default)
- API Key: deixar vazio
- Modelo: `qwen3:8b` (ou qualquer modelo instalado)

### Modo Remoto (OpenAI-compatible)
- URL: endpoint da API (ex: `https://api.openai.com/v1/chat/completions`)
- API Key: a tua chave
- Modelo: `gpt-4o`, `claude-3-5-sonnet`, etc.

A configuração é guardada no `localStorage` do browser/WebView.

## Desenvolvimento

```bash
npm install

# Dev (browser)
npm run dev

# Dev (Tauri desktop)
npm run tauri dev

# Build desktop
npm run tauri build
```

## Estrutura

```
src/
  App.tsx              # Layout principal + tabs de categoria
  App.css              # Estilos globais
  db/
    database.ts        # Schema Dexie + helpers CRUD
  lib/
    aiConfig.ts        # Configuração de IA (localStorage)
    ollama.ts          # Chamadas à API de IA
  components/
    ProjectCard.tsx    # Card de projeto
    CreateModal.tsx    # Modal criar projeto
    EditModal.tsx      # Modal editar projeto
    AIModal.tsx        # Modal gerar projetos com IA
    SettingsModal.tsx  # Modal configurar IA
    ImportModal.tsx    # Modal importar JSON
```

## Formato de importação JSON

```json
[
  {
    "nome": "meu-projeto",
    "ideia": "Descrição do que o projeto faz",
    "linguagens": ["TypeScript", "React"],
    "prompt": "Prompt opcional...",
    "categoria": "Web"
  }
]
```

## Site (GitHub Pages)

Existe um site estático em [`/docs`](docs/index.html) com a apresentação do projeto.

Para publicar no GitHub Pages:
1. `Settings` → `Pages` → `Source`: `Deploy from a branch`
2. `Branch`: `main` (ou a branch principal) → pasta `/docs`
3. Guardar — o site fica disponível em `https://<user>.github.io/workganizer/`

## Licença

MIT
