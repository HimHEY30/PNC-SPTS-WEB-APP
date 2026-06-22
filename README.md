# 🎓 PNC SPTS Web App
> **Student Follow-Up System** — A centralized platform for monitoring student activities, managing follow-up records, and tracking progress through a chronological timeline.

---

## 🌟 Key Features

* 📁 **Student Directory & Profiles**: A clean, searchable dashboard to quickly view individual student files.
* 📝 **Follow-Up Management**: An easy-to-use form for teachers to log new monitoring records, categorize incident types, and assign severity levels.
* 📎 **Document Attachments**: Secure file uploading to attach supporting documentation (PDFs, images, or forms) directly to any specific record.
* 🕒 **Chronological Timeline**: A unified, historical activity feed for each student that automatically orders notes, status updates, and uploaded files by date.

---

## ⚡ Tech Stack

The application is built using a modern, performant web development stack:

* 🟢 **Vue 3** (Composition API with `<script setup>`)
* 🔵 **TypeScript** (Strongly typed code structure)
* ⚡ **Vite 7** (Ultra-fast build tool and bundler)
* 🍍 **Pinia** (Modular state management)
* 🛣️ **Vue Router** (SPA client-side routing)
* 🎨 **Tailwind CSS 4** (Utility-first styling system)
* 🔣 **Tabler Icons** (Clean, modern SVG iconography)

---

## 🚀 Getting Started

### 📋 Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version `^20.19.0` or `>=22.12.0` is recommended).

### 🔧 Installation
Install the project dependencies using npm:
```bash
npm install
```

### 💻 Local Development
Start the hot-reloading development server:
```bash
npm run dev
```

### 🏗️ Production Build
Type-check, compile, and minify the application for production deployment:
```bash
npm run build
```

---

## 🧪 Quality Assurance & Scripts

Ensure code quality and run checks with the following commands:

| Command | Action / Purpose |
| :--- | :--- |
| `npm run test:unit` | Execute unit tests via Vitest |
| `npm run lint` | Run ESLint static code analysis with auto-fix enabled |
| `npm run type-check` | Run TypeScript compiler checks |
| `npm run format` | Prettier code formatter for consistent code style |
| `npm run clean` | Clean build outputs and delete `/dist` directory |

