# AGENTS.md

## Architecture

- **No bundler.** TypeScript is compiled in-browser by `@furryr/typescript-runtime` (loaded via CDN). All `<script>` tags use `type="text/typescript-tsx"`.
- **Custom JSX runtime.** JSX compiles to `window.jsx()` / `window.Fragment` (defined in `res/static/js/jsx-runtime.ts`). Not React.
- **`res/` is the GitHub Pages deploy root.** All pages, static assets, and posts live here.
- **SPA with client-side routing.** Router defined in `res/static/js/route.ts:12-20`. Routes dynamically import scene modules from `res/static/js/scene/`. Navigation uses `window.history` + `popstate`.
- **Scene = page.** Abstract `Scene` class in `res/static/js/scene.ts`. Each page (main, blog, about, archive) has a scene subclass with `new()` (enter) and `dispose()` (exit) lifecycle methods.

## Development commands

```
npm run dev              # Serve res/ at http://localhost:8080 (http-server, no caching)
npm run typecheck        # tsc --noEmit (uses root tsconfig.json)
npm run lint             # eslint . (typescript-eslint)
npm run format           # prettier --write
npm run format:check     # prettier --check
npm run create-post      # Interactive CLI wizard to scaffold a new post in res/posts/
npm run update-archive   # Scan res/posts/ HTML files and rebuild res/archive.html index
```

There is no test suite (`npm test` just echoes an error).

**Check order when making changes:** `typecheck` then `lint` (lint is broader and catches JS files in scripts/ too).

## Two tsconfig files

- **Root `tsconfig.json`** — for `tsc --noEmit` typechecking. Uses `noEmit: true`, `moduleResolution: "Bundler"`, path alias `/static/js/*` → `res/static/js/*`.
- **`res/tsconfig.browser.json`** — consumed by `@furryr/typescript-runtime` in-browser. Configures `jsxFactory`/`jsxFragmentFactory` and `sourceMap`.

When adding new source files, make sure they're covered by the root `include` glob: `res/static/js/**/*.ts` / `res/static/js/**/*.tsx`.

## Post file format

Posts are HTML files in `res/posts/` named by numeric ID (e.g. `1.html`). Each must contain:
- A `<blog>` element in `<head>` with children: `<author>`, `<time>`, `<category>`, `<tag>` (space-separated)
- An `<article>` element in `<body>` with the content
- The standard `<tsconfig>`, `<script>`, and `<link>` boilerplate (see existing posts or the `create-post` script output)

**After creating or editing a post, run `npm run update-archive`** or the archive page won't reflect the change. The CI deploy workflow does this automatically.

## CI / Deploy

- Push to `main` triggers `.github/workflows/deploy.yml`
- Steps: checkout → npm ci → `npm run update-archive` → copy `CNAME` to `res/` → deploy `res/` to GitHub Pages
- The CNAME file maps to `furryr.is-a.dev`

## Code style

- **Prettier:** `semi: false`, `singleQuote: true`, `trailingComma: "none"`, `arrowParens: "avoid"`, 2-space indent
- **ESLint:** `@typescript-eslint/no-explicit-any` is off; unused vars prefixed with `_` are ignored
- **Language:** UI text and comments are in Chinese; code identifiers are in English

## Key quirks

- `res/static/js/vendor.d.ts` has ambient module declarations for CDN-hosted highlight.js imports (dynamic `import()` from jsDelivr URLs). Don't touch these unless the highlight.js version changes.
- The `Effect` class (`res/static/js/effect.ts`) manages side-effect cleanup — used by scenes for stylesheet injection and interval timers.
- Scene transitions: `Scene.Transitions.loading()` shows loading spinners; `Scene.Disposes.foldAndFadeout()` is the default exit animation.
- The main entry `index.tsx` replaces the entire DOM body on load (saves original HTML to `history.state` for back/forward navigation).
