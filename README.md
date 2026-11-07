# Canvasly Editor

A visual website editor built with React, TypeScript, and Vite. Drag-and-drop page building with a powerful component system, responsive design tools, and a real-time preview iframe.

## Features

- **Visual Drag & Drop** — Intuitive component palette with drag-and-drop placement
- **Component System** — Flexible frame-based layout model with presets (hero, features, forms, buttons, etc.)
- **Responsive Design** — Edit for desktop, tablet, and mobile with breakpoint-specific overrides
- **Real-time Preview** — Live iframe preview with injected theme and styles
- **Undo/Redo** — Patch-based history system for smooth undo/redo
- **Component Library** — Save and reuse custom components across pages (local storage)
- **AI Page Generation** — Mock AI flow to generate page sections from a prompt (local-only)
- **Theme System** — Built-in theme management with CSS custom properties
- **Layer Panel** — Tree view of page components for quick navigation
- **Property Inspector** — Full property editing (layout, spacing, typography, colors, effects)
- **Multi-language** — Locale support with localized content editing
- **Keyboard Shortcuts** — Cmd+Z/Cmd+Shift+Z for undo/redo, Cmd+C/V for copy/paste, etc.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19, TypeScript 5.9 |
| Build | Vite 7 |
| State | Zustand 5, Immer |
| Styling | Tailwind CSS 4 |
| Drag & Drop | @dnd-kit |
| Routing | react-router-dom v7 |
| DSL Schema | Custom type system for components, frames, themes |
| Renderer | Custom iframe-based preview engine |

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The editor will be available at `http://localhost:3001`.

## Project Structure

```
canvasly/
├── apps/
│   └── editor/          # Main Vite/React application
│       ├── src/
│       │   ├── components/   # UI components (canvas, palette, properties, layout, etc.)
│       │   ├── hooks/        # React hooks (page sync, theme, keyboard shortcuts)
│       │   ├── store/        # Zustand stores (editor, history, AI generation)
│       │   ├── lib/          # API mocks, utilities
│       │   ├── contexts/     # Theme context
│       │   └── types/        # TypeScript type definitions
│       └── index.html
├── packages/
│   ├── dsl-schema/     # Type system for components, frames, themes
│   └── components/     # React renderer components for the preview iframe
└── package.json
```

## Architecture

The editor uses a normalized page state model:

- **Page State** — Flat `Record<string, Component>` with a `componentOrder` array for hierarchy
- **Components** — Frame-based layout model with props for size, position, spacing, text, style, etc.
- **Responsiveness** — Breakpoint overrides stored per-component
- **History** — Immer patch-based undo/redo (memory efficient)

## Local-Only Mode

Canvasly runs fully standalone with no backend required. All API calls are replaced with mock implementations:

- Page data is initialized from mock data
- Save operations update in-memory state
- Component library uses localStorage
- AI generation uses local mock responses
- Asset uploads use Blob URLs

## License

MIT
