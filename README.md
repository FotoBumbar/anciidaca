# David & Anči 💞

A private little website for David and Anči — "kad ti nedostajem, otvori ovo". It shows every shared photo from their Google Drive in its original format, sorted into stages of their story, lets them leave memories and comments on each photo, build albums and share public links, and holds their book *Knjiga bez tačke* (PDF, cover, poems, quotes) which they keep writing together. Entry code: their date, `2703`.

## Tech
- TanStack Start (React 19) + Tailwind CSS 4, deployed on Netlify
- Photos served directly from the public Google Drive folder (thumbnail URLs keep the original aspect ratio)
- Book cover via Netlify Image CDN, book PDF as a static file
- YouTube embed for the film

## Run locally
```bash
pnpm install
netlify dev    # or: pnpm dev
```

## Refresh photos from Google Drive
```bash
node scripts/sync-drive.mjs   # rewrites src/data/drive-photos.json, then deploy
```

## Roadmap
Memories, comments, albums and book chapters are currently saved per browser. Next up (see `PLAN.md`): shared cloud storage on Netlify Database, logins for David and Anči, automatic Drive sync, photo uploads, and automatic regeneration of the book PDF.
