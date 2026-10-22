# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Build for production (SSR)
npm run generate   # Build as static site
npm run preview    # Preview production build
```

No linting or test scripts are configured.

## Architecture

Portfolio web de **Sofía Ortiz** — comunicadora audiovisual en Lima. Nuxt 4 app-directory layout, deployed to Netlify (Node 22).

### Structure

```
app/
  app.vue              # Root: <NuxtPage /> only
  pages/
    index.vue          # Single-page portfolio (home)
    trabajo/[id].vue   # Video player + case study page
  components/
    WorkCard.vue        # Video card with hover/intersection autoplay
    Odometer.vue        # Animated digit counter
    Icon.vue            # Inline SVG icon set (stroke-only paths)
  composables/
    useSite.ts          # All site content + Work type + useWorks()
  assets/css/main.css  # Global styles
public/videos/         # Video assets (poster-N.jpg, preview-N.mp4, video-N.mp4)
```

### Content model (`useSite.ts`)

All site content lives in one file. There are two exports:

- **`site`** — static data object: name, bio, stats, services, steps, quotes, contacts. Strings wrapped in `[corchetes]` are placeholders Sofía must fill.
- **`useWorks()`** — returns categorized `Work[]` arrays: `reel`, `hero`, `redes`, `horizontal`, `contenido`, `all`. Currently uses generated placeholder data (videos cycle through 3 real files). Planned migration: videos from Supabase, texts from an admin panel.

### Work sections

| section key   | used in             |
|---------------|---------------------|
| `reel`        | Hero stair, `/trabajo/reel` |
| `best`        | Hero stair grid     |
| `redes`       | TikTok/Reels section |
| `horizontal`  | 16/9 university projects |
| `contenido`   | Case studies with metrics |

### Key patterns

- **Auto-imports**: `ref`, `computed`, `onMounted`, etc. are auto-imported by Nuxt — no explicit Vue imports needed. The root `tsconfig.json` extends `.nuxt/tsconfig.json` for editor support.
- **WorkCard autoplay**: uses `IntersectionObserver` on touch devices; `pointerenter`/`focus` on pointer devices. Respects `prefers-reduced-motion`.
- **Reveal animations**: `data-reveal` attribute on sections + JS in `index.vue` adds `rv`/`in` classes via `IntersectionObserver`.
- **Icon component**: pass `name` prop matching a key in the `paths` record. Only `play` fills with `currentColor`; all others are stroke.
- **Odometer**: animates on intersection. Pre-renders the final value (SSR-safe); motion only activates client-side.
