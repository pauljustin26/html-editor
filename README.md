# HTML Editor

> Production-ready, browser-based HTML workspace optimized for Web Content Specialists and E-Commerce Catalog Teams (Rakuten, Yahoo Shopping, Gulliver) handling dense multi-byte Japanese text and spreadsheet data. Runs 100% client-side in Google Chrome without local administrator rights or desktop installations.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Cloudflare%20Pages-007acc?style=for-the-badge&logo=cloudflare)](https://html-editor-bmj.pages.dev/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/pauljustin26/html-editor)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌐 Live Deployed Application

- **Live URL:** [https://html-editor-bmj.pages.dev/](https://html-editor-bmj.pages.dev/)
- **GitHub Repository:** [https://github.com/pauljustin26/html-editor](https://github.com/pauljustin26/html-editor)

---

## 🚀 Key Functional Features

### 1. Dual-Code Architecture: Desktop (PC) & Mobile (SP)
- **Dedicated Code Buffers**: Switch between **PC HTML** (パソコン用商品説明文) and **SP HTML** (スマートフォン用商品説明文) with independent undo/redo histories and no risk of overwriting.
- **Synchronized Viewports**: Switching the active editor tab automatically aligns the preview pane to the matching device layout.

### 2. Split-Pane Monaco Editor + Live DOM Preview
- **Monaco Editor**: Integrated `@monaco-editor/react` with line numbers, minimap overview, bracket-pair colorization, tag autocompletion, and multi-byte UTF-8 handling.
- **Theme System**: Full workspace toggle supporting:
  - 🌙 **VS Code Dark+** (`vs-dark` — default)
  - ☀️ **VS Code Light+** (`vs-light`)
  - 🎨 **Monokai** (`monokai`)
  - 👁️ **High Contrast Dark** (`hc-black`)
- **Live Sandboxed Preview**: Sandboxed iframe DOM preview with authentic Japanese font stacks (`Hiragino Kaku Gothic ProN`, `Yu Gothic`, `Meiryo`) and word-break safeguards.

### 3. Separate Window / Picture-in-Picture Preview
- **Detached Popout Window**: Launch the preview into a dedicated floating window with real-time bidirectional sync (`HTMLEditorLivePreviewWindow`).
- **Dual-Monitor Ready**: Keep Monaco full-width on your primary screen while reviewing changes live in the popout window.
- **Popout Controls**: Floating window includes live PC/Mobile toggles, live sync indicator, and automatic re-attachment upon close.

### 4. Smartphone (SP) Viewport Simulator
- **Mobile Device Frame**: 375px centered mobile container with phone bezel and top bar to preview exact mobile e-commerce rendering and catch layout overflow bugs.

### 5. Tag Diagnostics & HTML Linter
- **Real-Time Stack Validation**: Flags unclosed tags (`<div>`, `<td>`, `<tr>`, `<table>`), mismatched nesting, and broken attribute quotes.
- **Monaco Red Squiggles**: Real-time error markers directly inside the code editor.
- **Diagnostics Panel**: Dedicated sidebar list with instant line/column jump navigation.

### 6. Visual Image Manager & Batch URL Replacer
- **Thumbnail Gallery**: Automatically extracts all `<img>` tags with line numbers and dimension badges.
- **Line Navigation**: Clicking any thumbnail immediately centers and highlights the tag in Monaco.
- **Quick Replace URL Engine**: Batch swap image hostnames, CDN domains, or path patterns globally using plain string or RegEx matching.

### 7. Excel Batch Sync Bridge
- **Multi-Row Spreadsheet Import**: Paste multi-line TSV data straight from Excel (`Name \t PC HTML \t SP HTML`).
- **Interactive Grid**: Edit individual product items in the main editor; changes auto-save back to the table.
- **One-Click Export**: Export individual PC/SP columns or the entire TSV table directly to clipboard for pasting into Excel.

### 8. E-Commerce Safeguards & Formatting Tools
- **Platform Byte Counters**: Real-time counters with strict platform limit warnings (e.g., Rakuten PC 128KB limit, SP 30KB mobile limit).
- **Beautifier**: Tokenizer-based formatter restoring minified one-liners into indented, readable structures.
- **Minifier**: Strips comments and excessive whitespace for live production catalogs.
- **Clean Word/Excel Utility**: Strips messy legacy MS Office tags (`o:`, `w:`, `m:`), `Mso*` classes, conditional comments, and curly smart quotes.

### 9. Feedback-to-Markdown Pipeline
- **In-App Suggestion Queue**: Offline-first feedback drawer (`Ctrl+Shift+F`) capturing bug notes, feature suggestions, and automatic debug metadata (active mode, byte count, errors, user agent).
- **Roadmap Exporter**: One-click download as `feedback-roadmap-YYYY-MM-DD.md` ready for AI agent sprint planning.

---

## 🛠️ Tech Stack

- **Framework**: React 19, Vite
- **Editor**: `@monaco-editor/react`, Monaco Editor
- **Styling**: Tailwind CSS v4, Custom VS Code Theme Tokens
- **Icons**: Lucide Icons
- **Deployment Target**: Cloudflare Pages / Static CDN

---

## 💻 Local Development

```bash
# Clone repository
git clone https://github.com/pauljustin26/html-editor.git
cd html-editor

# Install dependencies
npm install

# Start development server
npm run dev
# -> http://localhost:5173
```

---

## 📦 Production Build

```bash
# Compile and build static bundle
npm run build
```

Assets will be output to the `dist/` directory (~94 kB gzipped bundle size).

---

## 🚀 Static Deployment

Because this tool is 100% client-side with zero server requirements, it can be hosted on any static hosting provider:

### Cloudflare Pages
```bash
npx wrangler pages deploy dist --project-name=html-editor
```

### GitHub Pages
Deploy the contents of the `dist/` folder via GitHub Actions or the `gh-pages` branch.

### Local Network Server (No Admin Required)
```bash
cd dist
python -m http.server 8080 --bind 0.0.0.0
```

---

## ⌨️ Monaco Editor Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+F` | Open Feedback & Roadmap Drawer |
| `Ctrl+F` | Find in Active Code |
| `Ctrl+H` | Replace in Active Code |
| `Ctrl+G` | Go to Line |
| `Alt+Up / Down` | Move Line Up / Down |
| `Ctrl+/` | Toggle Line Comment |
| `Ctrl+D` | Select Next Occurrence |
