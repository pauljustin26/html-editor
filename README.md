# HTML Editor

> Production-ready, browser-based HTML workspace with Desktop & Mobile dual-code editing, live preview, Picture-in-Picture window mode, and syntax diagnostics. Runs 100% client-side in modern web browsers without local administrator rights or desktop installations.

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

### 1. Dual-Code Architecture: Desktop & Mobile HTML
- **Dedicated Buffers**: Switch between **Desktop HTML** and **Mobile HTML** with independent undo/redo histories and separate payload trackers.
- **Synchronized Viewports**: Switching the active editor tab automatically aligns the preview pane to the matching device layout.

### 2. Split-Pane Monaco Editor + Live DOM Preview
- **Monaco Editor Engine**: Integrated `@monaco-editor/react` with line numbers, minimap overview, bracket-pair colorization, tag autocompletion, and multi-byte UTF-8 handling.
- **Theme System**: Full workspace toggle supporting:
  - 🌙 **VS Code Dark+** (`vs-dark` — default)
  - ☀️ **VS Code Light+** (`vs-light`)
  - 🎨 **Monokai** (`monokai`)
  - 👁️ **High Contrast Dark** (`hc-black`)
- **Live Sandboxed Preview**: Sandboxed iframe DOM preview with responsive font rendering and word-break safeguards.

### 3. Separate Window / Picture-in-Picture Preview
- **Detached Popout Window**: Launch the preview into a dedicated floating window with real-time bidirectional sync (`HTMLEditorLivePreviewWindow`).
- **Dual-Monitor Ready**: Keep Monaco full-width on your primary screen while reviewing changes live in the popout window.
- **Popout Controls**: Floating window includes live Desktop/Mobile toggles, live sync indicator, and automatic re-attachment upon close.

### 4. Mobile Viewport Simulator
- **Device Frame**: 375px centered mobile container with phone bezel and top bar to preview exact mobile rendering and catch layout overflow bugs.

### 5. Tag Diagnostics & HTML Linter
- **Real-Time Stack Validation**: Flags unclosed tags (`<div>`, `<td>`, `<tr>`, `<table>`), mismatched nesting, and broken attribute quotes.
- **Monaco Red Squiggles**: Real-time error markers directly inside the code editor.
- **Diagnostics Panel**: Dedicated sidebar list with instant line/column jump navigation.

### 6. Visual Image Manager & Batch URL Replacer
- **Thumbnail Gallery**: Automatically extracts all `<img>` tags with line numbers and dimension badges.
- **Line Navigation**: Clicking any thumbnail immediately centers and highlights the tag in Monaco.
- **Quick Replace URL Engine**: Batch swap image hostnames, CDN domains, or path patterns globally using plain string or RegEx matching.

### 7. Spreadsheet Batch Mode
- **Multi-Row Spreadsheet Import**: Paste multi-line TSV data straight from spreadsheets (`Name \t Desktop HTML \t Mobile HTML`).
- **Interactive Grid**: Edit individual items in the main editor; changes auto-save back to the table.
- **One-Click Export**: Export individual Desktop/Mobile columns or the entire TSV table directly to clipboard.

### 8. Formatting Tools & Limit Protections
- **Byte Counters**: Real-time counters with configurable size limits (Standard 128KB, Compact 30KB, Unlimited).
- **Beautifier**: Tokenizer-based formatter restoring minified one-liners into indented, readable structures.
- **Minifier**: Strips comments and excessive whitespace for production deployment.
- **Clean Word/Excel Utility**: Strips messy legacy MS Office tags (`o:`, `w:`, `m:`), `Mso*` classes, conditional comments, and curly smart quotes.

### 9. Feedback & Feature Pipeline
- **In-App Suggestion Queue**: Offline-first feedback drawer (`Ctrl+Shift+F`) capturing bug notes, feature suggestions, and automatic debug metadata.
- **Direct Export**: 1-click download as `feedback-roadmap-YYYY-MM-DD.md` ready for sprint planning.

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
