# AGENTS.md

Read this before changing anything. It explains what this repo is, the platform rules it must
follow, and (at the bottom) what this particular app does.

## What this repo is

One app in the **toyonix** platform: a family of static sites that look and behave as one.

- It is deployed to GitHub Pages at `https://toyonix.github.io/<repo-name>/`. **The repo name
  is the URL and the app id.** Renaming the repo changes the URL and breaks links.
  (`toyonix.github.io` itself is the root site at `/`.)
- It is a **Next.js App Router site, statically exported**. There is no server.
- The look, the shared header/nav/footer, the theme, storage, and all lint/format/TS configs
  come from the npm package **`@toyonix/web-kit`**. The deploy and CI steps come from
  reusable workflows in the `ToYoNiX/web-kit` repo.
- It was created from the `web-starter` template. Template files were copied once and are
  never synced, which is why almost everything lives in the kit instead.

## Hard constraints (static export on GitHub Pages)

Not available: API routes / route handlers with request-time logic, server actions,
middleware/proxy, ISR, `cookies()` / `headers()`, `rewrites` / `redirects` / `headers` in
next.config, dynamic routes without `generateStaticParams`, next/image optimization.

Anything dynamic happens in the browser, against an external service if needed.

## Where code belongs

- **Shared look and behavior go in the kit, not here.** Never copy or fork kit components or
  styles into this repo. If something reusable is missing, it should be added to
  `@toyonix/web-kit` (a PR to `ToYoNiX/web-kit`), then used here.
- App-specific pages, components, and logic live in this repo.

## Using the kit

- **Layout:** `app/layout.tsx` wraps every page in `<AppShell>` and puts `<ThemeScript>` in
  `<head>`. Keep both. Pass app-local links through `AppShell`'s `nav` prop.
- **Components:** import from `@toyonix/web-kit/react` (`Button`, `Card`, `CardGrid`,
  `Display`, `Prose`, `Field`, `Input`, `Dialog`, `Tabs`, …). Only import from the
  documented entry points; deep imports into the kit are lint errors.
- **Colors and fonts:** use the kit's tokens only, via Tailwind (`bg-surface`, `text-text-muted`,
  `text-accent-text`, `border-border`, `font-serif`, `font-mono`) or CSS variables
  (`var(--tx-accent)`). Tailwind's default palette is removed on purpose; don't hard-code
  colors.
- **Links:** in-app links use `next/link` (basePath is handled). Links to other toyonix
  apps use `<AppLink app="gen">` or `appHref("gen")`, never `next/link`. Raw in-app URLs
  (`fetch`, `<a href>`, assets in `public/`) go through `withBasePath()`.
- **Storage:** all toyonix apps share one origin. Use `storage` from
  `@toyonix/web-kit/storage` (`storage.app`, `storage.session`); IndexedDB names via
  `dbName()`; cookies with `Path=cookiePath()`. Direct `localStorage`, `sessionStorage`,
  `indexedDB`, and `document.cookie` are lint errors. Never store secrets in the browser.
- **Site identity:** title and description live in the `"toyonix"` field of `package.json`
  (read by `site.ts` and by the root site's nav). `status` is `live`, `beta`, or `archived`.

## Commands

```sh
npm ci
npm run dev          # http://localhost:3000/<repo-name>/
npm run check        # format, lint, typecheck, build: what CI runs
npm run preview      # serve the static export from ./out
npm run kit:update   # pull the newest compatible @toyonix/web-kit
```

## Dependencies and deploys

- `package-lock.json` is committed, so everything is reproducible, except `@toyonix/web-kit`,
  which CI and deploys float to the newest version in range (`npm update @toyonix/web-kit`).
  A kit release redeploys every site.
- Pushing to `main` deploys. PRs run CI (format, lint, typecheck, build).
- A failed deploy leaves the previous version live.

## Do not modify

- `.github/workflows/deploy.yml` (its file name is how the kit redeploys this site) and
  `ci.yml`, beyond what the kit's docs say.
- The `withWebKit()` call in `next.config.ts`: never set `output`, `basePath`, or
  `trailingSlash` yourself.
- `eslint.config.mjs`, `prettier.config.mjs`, and the `extends` in `tsconfig.json`. To change
  a rule for every site, change the kit. Disable a rule locally only with a comment
  explaining why.

---

## This app: notes

- **Purpose:** Assem's notes: journeys and explorations (homelab, Linux, DevOps, and whatever
  he's learning next), served at `/notes/`.
- **Content:** one Markdown file per note in `content/<slug>.md`; the file name is the URL
  (`/notes/<slug>/`). Front matter: `title` and `date` (YYYY-MM-DD) required; `description`,
  `tags`, `draft: true` optional. Drafts aren't built. Invalid front matter fails the build.
  Format rules are in `lib/notes.ts`.
- **Images:** in `public/images/`, referenced as `/images/<file>` (the build adds basePath,
  width/height, and lazy loading). Prefer WebP around 1600px on the long side. Always write
  real alt text. A missing image fails the build.
- **Rendering:** `lib/markdown.ts` (remark/rehype, GitHub-flavored Markdown). Raw HTML in notes
  is dropped. Article styles come from the kit's `Prose`; change them in the kit, not here.
- **Feeds:** `/notes/feed.xml` (RSS) and `/notes/feed.json` (JSON Feed 1.1), built from the
  same notes. **The root site reads `feed.json` in the browser** to show the latest notes on
  the landing page, so publishing a note never redeploys root. Keep `feed.json` a valid JSON
  Feed with `id`, `url`, `title`, `summary`, `date_published`, `tags` per item; root depends
  on it.
- **Licenses:** code is MIT (`LICENSE`); everything in `content/` and `public/images/` is
  CC BY-NC 4.0 (`LICENSE-content`).

### Decided for later: Obsidian sync

Notes will eventually be synced from Assem's Obsidian vault (a flat Zettelkasten). Not built
yet; decisions made so far:

- Only notes explicitly marked for publishing are copied (the mark is not chosen yet).
- If a published note `[[wikilinks]]` to a note that isn't published, the **sync fails** and
  lists the offending links. Never silently drop or expose them.
