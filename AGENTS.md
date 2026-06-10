# 🤖 Agent Coding Guidelines & Context

This document outlines the core architecture, style guidelines, and visual patterns required for maintaining and extending the PNC SPTS web application.

---

## 📌 Project Architecture

* **Framework Stack**: Vue 3 (Composition API) + Vite + Tailwind CSS + Vue Router
* **App Type**: Single Page Application (SPA) - Student Tracking System
* **Build Command**: `npm run build-only`
* **Lint/Format Command**: `npm run lint`
* **Directory Structure**: Admin views are located under `src/views/admin/`

---

## 🎨 Styling Conventions

> [!IMPORTANT]
> Always use Tailwind utility classes. Prefer `slate-*` over `gray-*` classes. Avoid applying `font-sans` (since Exo 2 is loaded as the default font).

### 📐 Reusable UI Patterns & Classes

| UI Element | CSS / Tailwind Classes | Visual Details |
| :--- | :--- | :--- |
| **Sidebar Secondary Text** | `text-slate-400` | Muted labels, icons, and captions |
| **Sidebar Headings** | `text-slate-700` | Bold titles and navigation headers |
| **Sidebar Surfaces** | `bg-slate-50` / `bg-white` | Alternating card or sidebar backgrounds |
| **Borders & Dividers** | `border-slate-200` | Light dividers and card borders |
| **Backdrop Overlay** | `bg-black/40 backdrop-blur-[2px]` | Consistent modal or drawer overlay |
| **Modal / Panel Box** | `bg-white rounded-lg shadow-xl` | Standardized padding, shadow, and rounded edges |
| **Status Badge** | `rounded-[3px] px-2.5 py-0.5 text-xs font-medium` | Colored dynamically based on status |
| **Student ID Badge** | `rounded-[3px] bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-medium` | Light neutral background badge |
| **Add New Button** | `rounded-[3px] bg-slate-900 text-white px-3 py-1.5 text-xs font-medium` | High-contrast dark action button |
| **Table Header Row** | `text-xs font-semibold text-slate-500 uppercase tracking-wider` | Compact, uppercase table head styling |

