# 🎨 Admin Visual Style Guide & Cleanup Checklist

This style guide defines the design tokens, components, page layouts, and the quality assurance checklist for the admin view namespace in the Student Follow-Up System.

---

## 🎨 Color Palette Reference

| Role | Tailwind Token | Visual Application / Usage |
| :--- | :--- | :--- |
| **Primary Text** | `text-slate-700` | Section headings, body copies, input labels |
| **Secondary Text** | `text-slate-400` | Captions, hints, help blocks, dates |
| **Tertiary / Muted** | `text-slate-500` | Table headers, form labels, cancel buttons |
| **Surface Background** | `bg-white` | Cards, panel contents, modals, drawers |
| **Alt Surface** | `bg-slate-50` | Background sections, alternating table rows |
| **Border / Divider** | `border-slate-200` | Layout dividers, inputs, table boundaries |
| **Modal Overlay** | `bg-black/40 backdrop-blur-[2px]` | Backdrop overlay behind active dialog panels |
| **Primary Action** | `bg-slate-900 text-white` | "Add New" buttons and main submissions |

> [!WARNING]
> **Avoid `gray-*` classes and do not specify `font-sans` manually.** 
> Slate is the design standard; font-sans is automatically inherited via body defaults.

---

## 📐 Reusable UI Patterns

### 🏷️ Status Badges
```html
<span class="rounded-[3px] px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700">
  Active
</span>
```
* Use semantic status variants:
  * Green: `bg-green-100 text-green-700`
  * Yellow: `bg-yellow-100 text-yellow-700`
  * Red: `bg-red-100 text-red-700`

### 🆔 Student ID Badge
```html
<span class="rounded-[3px] bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-medium">
  STU-2024-001
</span>
```

### 🔘 Buttons
* **Primary / "Add New" Button**:
  ```html
  <button class="rounded-[3px] bg-slate-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors">
    Add Student
  </button>
  ```
* **Cancel / Secondary Button**:
  ```html
  <button class="rounded-[3px] bg-white text-slate-500 border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 transition-colors">
    Cancel
  </button>
  ```

### 📝 Form Text Inputs
```html
<input 
  type="text" 
  class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400" 
  placeholder="Enter name..."
/>
```

### 📋 Table Header Row
```html
<tr class="bg-slate-50/50 border-b border-slate-100">
  <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
    Field Label
  </th>
</tr>
```

### 💬 Modals & Dialog Panels
```html
<div class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center">
  <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
    <!-- Modal content here -->
  </div>
</div>
```

---

## 🏛️ Page Layout & Hierarchy

All views in the admin dashboard namespace must wrap their markup inside the following block:
```html
<div class="space-y-6 text-left max-w-[1600px] mx-auto pb-8">
  <!-- Section elements go here -->
</div>
```

Section subheaders inside wrappers:
```html
<h2 class="text-base font-semibold text-slate-700">Section Title</h2>
```

---

## 🔍 Cleanup & Quality Checklist

### ✅ Completed Milestones
- [x] **Dashboard**: Compact text styling and sidebar-matched navigation hierarchy.
- [x] **Student List**: Refactored grid table headers, badges, and filters.
- [x] **Follow-up Types**: Restyled type config page elements and borders.
- [x] **Email Log**: Styled timeline, action cards, and text spacing to match theme.
- [x] **Teacher Management**: Restructured tables, user info, and role status indicators.
- [x] **Calendar**: Applied consistent border colors and grid sizes.
- [x] **Placeholder Layouts**: Standardized headers and description sizes across incomplete pages.
- [x] **Student ID Badge**: Unified format with `rounded-[3px] bg-slate-100 text-slate-700`.
- [x] **Primary Buttons**: All "Add New" interfaces utilize the standardized `bg-slate-900` pattern.
- [x] **Modals/Popups**: Migrated customized popup wrappers to `bg-white rounded-lg shadow-xl`.
- [x] **Colors**: Replaced all instances of `gray-*` with `slate-*` within the admin namespace.
- [x] **Refactoring**:
  * Removed redundant `font-sans` declarations from root divisions.
  * Corrected invalid color tokens: `text-slate-850` changed to `text-slate-700`.
  * Corrected invalid border tokens: `border-slate-55` changed to `border-slate-100`.

### 📂 Modified Source Files
* `DashboardView.vue`
* `StudentListView.vue`
* `StudentDetailsView.vue`
* `TeacherManagementView.vue`
* `CalendarView.vue`
* `FollowUpTypesView.vue`
* `FollowUpTimelineView.vue`
* `PlaceholderView.vue`

