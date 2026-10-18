# notes

Journeys and explorations, at <https://toyonix.github.io/notes/>. A toyonix site built on
[`@toyonix/web-kit`](https://github.com/ToYoNiX/web-kit) from the `web-starter` template.

## Writing a note

Add `content/<slug>.md` (the file name becomes the URL):

```md
---
title: My note
date: 2026-10-18
description: One line for the list and link previews.
tags: [homelab]
---

The note, in Markdown. Images go in `public/images/` and are referenced as `/images/name.webp`.
```

Push to `main` and it's live. See [AGENTS.md](AGENTS.md) for the details.

```sh
npm ci
npm run dev     # http://localhost:3000/notes/
npm run check   # format, lint, typecheck, build
```

## License

Code: MIT ([LICENSE](LICENSE)). Writing and images (`content/`, `public/images/`):
CC BY-NC 4.0 ([LICENSE-content](LICENSE-content)).
