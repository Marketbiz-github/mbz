# Style Guide — MarketBiz Dashboard

> **Versi:** 1.0  
> **Tanggal:** 2026-06-27  
> **Berlaku untuk:** Admin Dashboard & Client Portal

---

## 1. Design Philosophy

MarketBiz Dashboard menggunakan desain **Dark Futuristic / High-Tech** dengan nuansa glassmorphism dan neon accent. Kesan yang ingin dicapai: **premium, modern, dan profesional** — cocok untuk agency digital yang mengelola data klien.

---

## 2. Color System

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--cyan-500` | `#06B6D4` | Primary accent, active states, CTA buttons, sidebar active |
| `--cyan-400` | `#22D3EE` | Hover states, glow effects |
| `--cyan-500/10` | `rgba(6,182,212,0.1)` | Background accent cards |
| `--cyan-500/20` | `rgba(6,182,212,0.2)` | Border accent |

### Secondary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--purple-500` | `#A855F7` | Secondary accent, gradients |
| `--indigo-500` | `#6366F1` | Email Blast service, client portal accent |
| `--indigo-400` | `#818CF8` | Email metrics, client portal active |

### Platform Colors

| Platform | Color | Hex |
|----------|-------|-----|
| Instagram | Pink | `#E1306C` / `text-pink-400` |
| TikTok | Cyan | `#00F2EA` / `text-cyan-400` |
| LinkedIn | Blue | `#0A66C2` / `text-blue-400` |
| Facebook | Blue | `#1877F2` / `text-blue-500` |

### Service Colors (Baru)

| Service | Color Accent | Background | Border |
|---------|-------------|------------|--------|
| Sosmed | `cyan-500` | `bg-cyan-500/10` | `border-cyan-500/20` |
| Email Blast | `indigo-500` | `bg-indigo-500/10` | `border-indigo-500/20` |
| WA Blast | `green-500` | `bg-green-500/10` | `border-green-500/20` |
| SEO | `emerald-500` | `bg-emerald-500/10` | `border-emerald-500/20` |
| Web Dev | `amber-500` | `bg-amber-500/10` | `border-amber-500/20` |

### Status Colors

| Status | Color | Usage |
|--------|-------|-------|
| Active / Online / Success | `emerald-400` | `bg-emerald-500/10 text-emerald-400 border-emerald-500/20` |
| Warning / Pending | `amber-400` | `bg-amber-500/10 text-amber-400 border-amber-500/20` |
| Error / Danger | `red-400` | `bg-red-500/10 text-red-400 border-red-500/20` |
| Inactive / Disabled | `slate-400` | `bg-slate-500/10 text-slate-400 border-white/10` |

### Neutral Palette

| Token | Usage |
|-------|-------|
| `bg-black` / `bg-black/95` | Sidebar background |
| `bg-slate-950` | Client portal background |
| `bg-white/5` | Card background, input background |
| `bg-white/10` | Hover states |
| `border-white/10` | Default borders |
| `border-white/20` | Hover borders |
| `text-white` | Primary text |
| `text-slate-300` | Secondary text |
| `text-slate-400` | Muted text, labels |
| `text-slate-500` | Disabled text, placeholders |

---

## 3. Typography

### Font Stack
```css
--font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
--font-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace;
```

### Text Scale

| Element | Class | Weight | Case |
|---------|-------|--------|------|
| Page Title | `text-3xl font-bold text-white tracking-tight` | Bold | Normal |
| Section Title | `text-lg font-bold text-white` | Bold | Normal |
| Card Label | `text-xs font-bold text-slate-400 uppercase tracking-widest` | Bold | Uppercase |
| Metric Label | `text-xs font-semibold text-slate-400 uppercase tracking-widest` | Semibold | Uppercase |
| Metric Value | `text-4xl font-bold text-white` | Bold | Normal |
| Small Metric | `text-2xl font-bold text-white` | Bold | Normal |
| Body Text | `text-sm text-slate-400` | Regular | Normal |
| Tiny Label | `text-[10px] font-bold text-slate-500 uppercase tracking-widest` | Bold | Uppercase |
| Badge/Pill | `text-[10px] font-bold uppercase tracking-widest` | Bold | Uppercase |

---

## 4. Component Library

### 4.1 Glass Card (`high-tech-card`)

Komponen utama untuk container konten. Didefinisikan di `globals.css`:

```css
@utility glass-panel {
  background-color: color-mix(in srgb, white 5%, transparent);
  border-width: 1px;
  border-color: color-mix(in srgb, white 10%, transparent);
  backdrop-filter: blur(12px);
  border-radius: 0.75rem;
}

@utility high-tech-border {
  border-width: 1px;
  border-color: color-mix(in srgb, var(--color-cyan-500) 30%, transparent);
  box-shadow: 0 0 15px color-mix(in srgb, var(--color-cyan-500) 10%, transparent);
}

@utility high-tech-card {
  @apply glass-panel high-tech-border;
  transition-property: all;
  transition-duration: 300ms;
  &:hover {
    border-color: color-mix(in srgb, var(--color-cyan-400) 50%, transparent);
  }
}
```

**Usage:**
```tsx
<div className="high-tech-card p-6">
  {/* content */}
</div>
```

---

### 4.2 Stat Card

Pattern untuk menampilkan metric besar:

```tsx
<div className="high-tech-card p-6 flex items-center gap-4">
  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 
                  flex items-center justify-center text-cyan-400">
    <Icon className="w-6 h-6" />
  </div>
  <div>
    <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">
      Label
    </p>
    <h3 className="text-2xl font-bold text-white">Value</h3>
  </div>
</div>
```

---

### 4.3 Data Table

Pattern untuk tabel data:

```tsx
<div className="high-tech-card overflow-hidden">
  {/* Search/Filter Bar */}
  <div className="p-6 border-b border-white/10 flex items-center justify-between">
    {/* search input, filters */}
  </div>
  
  <div className="overflow-x-auto">
    <table className="w-full text-left min-w-[700px]">
      <thead>
        <tr className="bg-white/5 border-b border-white/10">
          <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Column
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        <tr className="hover:bg-white/2 transition-colors group">
          <td className="px-6 py-4">
            {/* content */}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

### 4.4 Status Badge / Pill

```tsx
{/* Active / Success */}
<span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest 
                 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  Active
</span>

{/* Warning */}
<span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest 
                 bg-amber-500/10 text-amber-400 border border-amber-500/20">
  Pending
</span>

{/* Service Tag */}
<span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded 
                 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
  SOSMED
</span>
```

---

### 4.5 Button Variants

#### Primary CTA (Cyan)
```tsx
<button className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-bold 
                   hover:bg-cyan-400 transition-all 
                   shadow-[0_0_20px_rgba(6,182,212,0.4)] 
                   active:scale-95">
  ACTION
</button>
```

#### Secondary CTA (Gradient Purple)
```tsx
<button className="bg-linear-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 
                   rounded-xl font-bold hover:opacity-90 transition-all 
                   shadow-[0_0_20px_rgba(168,85,247,0.4)]">
  ACTION
</button>
```

#### Ghost / Outline
```tsx
<button className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg 
                   text-xs font-bold text-slate-300 hover:text-white 
                   hover:bg-white/10 transition-all">
  ACTION
</button>
```

#### Danger
```tsx
<button className="text-red-400 hover:bg-red-500/10 rounded-lg p-3 transition-all">
  <Trash2 className="w-5 h-5" />
</button>
```

---

### 4.6 Form Input

```tsx
<div>
  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
    Label
  </label>
  <input 
    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 
               text-sm text-white outline-none 
               focus:border-cyan-500/50 transition-all
               placeholder-slate-500" 
    placeholder="Placeholder..."
  />
</div>
```

#### Select Input
```tsx
<select className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 
                   text-xs text-white focus:outline-none focus:border-cyan-500/50">
  <option className="bg-slate-900">Option</option>
</select>
```

---

### 4.7 Modal

```tsx
<div className="fixed inset-0 z-100 flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
  <div className="relative w-full max-w-lg high-tech-card p-6 md:p-8 
                  bg-slate-900 border-cyan-500/30 
                  animate-in zoom-in-95 duration-200">
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <button onClick={onClose} className="text-slate-500 hover:text-white">
        <X className="w-6 h-6" />
      </button>
    </div>
    {/* Content */}
    <form className="space-y-6">
      {/* form fields */}
    </form>
  </div>
</div>
```

---

### 4.8 Avatar / Initial Badge

```tsx
{/* Gradient avatar */}
<div className="w-8 h-8 rounded bg-linear-to-br from-cyan-500 to-purple-500 
               flex items-center justify-center font-bold text-white text-xs">
  {name[0]}
</div>

{/* User avatar circle */}
<div className="w-10 h-10 rounded-full bg-cyan-500/20 
               flex items-center justify-center text-cyan-400 
               border border-cyan-500/30">
  <User className="w-5 h-5" />
</div>
```

---

## 5. Sidebar

### Admin Sidebar
- Width: `w-64`
- Background: `bg-black/95 backdrop-blur-2xl`
- Border: `border-r border-white/10`
- Logo: Cyan square (`bg-cyan-500`) + "MARKETBIZ" text gradient
- Active item: `bg-cyan-500/10 text-cyan-400 border border-cyan-500/20`
- Inactive item: `text-slate-400 hover:text-white hover:bg-white/5`
- Mobile: Slide-in overlay with backdrop blur

### Client Sidebar
- Same width and structure
- Accent color: `indigo-500` instead of `cyan-500`
- Logo: Indigo square + "CLIENT PORTAL" text
- Active item: `bg-indigo-500/10 text-indigo-400 border border-indigo-500/20`

---

## 6. Charts (Recharts)

### Color Theme
```tsx
const chartTooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: 10
};

// Grid
<CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />

// Axis
<XAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
<YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />

// Bar
<Bar radius={[4, 4, 0, 0]} barSize={24} />
```

### Area Chart Gradient
```tsx
<defs>
  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor={accentColor} stopOpacity={0.3}/>
    <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
  </linearGradient>
</defs>
<Area strokeWidth={3} fillOpacity={1} fill="url(#colorGradient)" />
```

---

## 7. Layout & Spacing

### Page Layout
```
┌──────┬───────────────────────────────────────┐
│      │  Main Content                         │
│ Side │  ┌─────────────────────────────────┐  │
│ bar  │  │  max-w-7xl mx-auto             │  │
│      │  │  p-4 md:p-8                    │  │
│ w-64 │  │  space-y-8                     │  │
│      │  └─────────────────────────────────┘  │
└──────┴───────────────────────────────────────┘
```

### Spacing Scale
| Usage | Class |
|-------|-------|
| Page sections | `space-y-8` |
| Card internal padding | `p-6` |
| Card grid gap | `gap-4 md:gap-6` |
| Form field spacing | `space-y-4` atau `space-y-6` |
| Section header margin | `mb-4` atau `mb-6` |

### Grid Patterns
```tsx
{/* Stats row */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" />

{/* 3-column layout */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6" />

{/* Content + sidebar */}
<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
  <div className="xl:col-span-2">{/* main */}</div>
  <div>{/* sidebar */}</div>
</div>
```

---

## 8. Animation & Transitions

### Page Transitions
```tsx
// Fade in
className="animate-in fade-in duration-500"

// Slide from right
className="animate-in slide-in-from-right-4 duration-500"

// Slide from bottom
className="animate-in slide-in-from-bottom-4 duration-500"

// Zoom in (modal)
className="animate-in zoom-in-95 duration-200"
```

### Micro-interactions
```tsx
// Hover scale
className="active:scale-95 transition-all"

// Icon slide on hover
className="group-hover:translate-x-0.5 transition-transform"

// Glow on hover
className="hover:border-cyan-500/50 transition-all"
```

---

## 9. Responsive Breakpoints

| Breakpoint | Prefix | Usage |
|------------|--------|-------|
| 0-639px | (default) | Mobile: single column, stacked layout |
| 640px+ | `sm:` | Small tablets: 2-column grids |
| 768px+ | `md:` | Tablets: side-by-side content |
| 1024px+ | `lg:` | Desktop: sidebar visible, full grids |
| 1280px+ | `xl:` | Wide desktop: 3-column layouts |

### Mobile-specific Rules
- Sidebar: hidden, toggle with hamburger menu
- Mobile header: `h-16 bg-black/50 backdrop-blur-xl border-b border-white/10 z-[60]`
- Tables: `overflow-x-auto` dengan `min-w-[700px]`
- Cards: single column stack
- Buttons: `w-full md:w-auto`

---

## 10. Icon Library

Menggunakan **Lucide React** (`lucide-react`).

### Commonly Used Icons

| Icon | Component | Usage |
|------|-----------|-------|
| Dashboard | `LayoutDashboard` | Sidebar: Sosmed |
| Mail | `Mail` | Sidebar: Email Blast |
| Search/SEO | `Search` / `Globe` | Sidebar: SEO |
| Users | `Users2` | Sidebar: Client |
| Settings | `Settings` | Sidebar: Settings |
| Camera | `Camera` | Platform: Instagram |
| Video | `Video` | Platform: TikTok |
| Briefcase | `Briefcase` | Platform: LinkedIn |
| TrendingUp | `TrendingUp` | Growth metrics |
| Plus | `Plus` | Add/Create buttons |
| Edit | `Edit2` | Edit actions |
| Trash | `Trash2` | Delete actions |
| ChevronRight | `ChevronRight` | Navigation, active indicators |
| ChevronLeft | `ChevronLeft` | Back navigation |
| Loader2 | `Loader2` | Loading spinner (+ `animate-spin`) |
| LogOut | `LogOut` | Sign out button |

---

## 11. Background Effects

### Glow Blobs
```tsx
{/* Cyan glow - top right */}
<div className="fixed top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] 
               bg-cyan-500/5 rounded-full blur-[80px] md:blur-[120px] -z-10" />

{/* Purple glow - bottom left */}
<div className="fixed bottom-0 left-0 lg:left-64 w-[250px] md:w-[400px] h-[250px] md:h-[400px] 
               bg-purple-500/5 rounded-full blur-[70px] md:blur-[100px] -z-10" />
```

### Card Glow Effect
```tsx
<div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 
               transition-opacity group-hover:opacity-40 bg-cyan-500" />
```

---

## 12. Z-Index Scale

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Background effects | `-z-10` | Glow blobs |
| Content | `z-10` | Card content above glows |
| Mobile header | `z-[60]` | Fixed mobile top bar |
| Sidebar overlay | `z-[70]` | Backdrop behind sidebar |
| Sidebar | `z-[80]` | Sidebar panel |
| Modal | `z-[100]` | Modal dialogs |

---

## 13. Naming Conventions

### Files & Routes
- Route folders: lowercase kebab-case (`email-blast`, `ai-generator`)
- Components: PascalCase (`Sidebar.tsx`, `ClientNavbar.tsx`)
- Utilities: camelCase (`utils.ts`)

### CSS Classes
- Utility classes: TailwindCSS v4 (via `@import "tailwindcss"`)
- Custom utilities: `@utility` directive di `globals.css`
- Naming: kebab-case (`high-tech-card`, `glass-panel`)

### Database
- Tables: snake_case plural (`sosmed_reports`, `email_blast_reports`)
- Columns: snake_case (`created_at`, `open_rate`)
- Foreign keys: `{entity}_id` (`client_id`, `project_id`)
