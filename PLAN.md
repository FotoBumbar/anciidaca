# David & Anči — roadmap

A private, romantic home for David and Anči: every shared photo from their Google Drive, organised into stages of their story, with memories and comments on each photo, their "Knjiga bez tačke" (book, cover, poems, quotes) that they keep writing together, their YouTube film, and public share links.

## Milestone 1 — The product surface ✅ (done)
- Entry gate: beating heart + code `2703` (their date, 27.03.), remembered per browser.
- Home: rotating hero of shared photos (a new random set each visit), live "together since 27.03.2026 1:14h" counter, turtle tagline, stats, YouTube film, stage cards, book teaser.
- Album: 425 photos + 92 videos from the Drive folder (snapshot in `src/data/drive-photos.json`), grouped by month into stages with special-day badges; polaroid cards that each get their own emoji/quote/tilt; photos shown in their exact original format (never cropped); lightbox with memory (title + note), comments, album membership, download original, share.
- Custom albums ("Naše omiljene" + any new one), public share links for a photo / stage / album (`/podeli?a=…`, no code needed).
- Book page: cover, PDF read/download, chapter list, poems, quotes wall, autosaving editors for the next chapters (31. jul, 31. avgust, 18. septembar, Daljina) + new chapters, and "Napravi novu knjigu (PDF)" via the browser's print-to-PDF.
- User data uses `src/data/store.ts` and Netlify Database server functions; old browser data is imported once.

## Milestone 2 — Shared memories in the cloud (implemented; deploy validation pending)
- Netlify Database (Drizzle) tables: `memories`, `comments`, `albums`, `book_chapters`, `stage_settings`. Album membership is stored with its album record.
- Replace the localStorage implementation in `src/data/store.ts` with server functions; keep the same `actions` API so the UI doesn't change.
- One-time import of anything already saved in a browser (read the old localStorage key and upload it).

## Milestone 3 — Accounts for David and Anči
- Netlify Identity with exactly two invited users (David: foto.d.bumbar@gmail.com, Anči: ana.jankucic@gmail.com); invite-only registration.
- The 2703 heart gate stays as the welcome screen; Identity is the real protection for writing data. The author of each comment/memory comes from the logged-in user instead of the "David/Anči" switch.

## Milestone 4 — Automatic Google Drive sync
- Scheduled Netlify Function (e.g. every few hours) runs the logic of `scripts/sync-drive.mjs` and stores the item list in Netlify Blobs; the site reads that list, so new Drive photos appear without a redeploy.
- Optional: read real photo dates (EXIF/Drive metadata) for files whose names have no date.

## Milestone 5 — Uploading our own photos
- "Dodaj uspomenu" upload straight from the phone into Netlify Blobs, shown alongside Drive photos, with date/title/note.

## Milestone 6 — The book grows by itself
- Server-side PDF generation (pdf-lib): original PDF + cover + all chapters written on the site → "Knjiga bez tačke — sveska 2" stored in Blobs, with version history.
- Optional: attach photos to chapters.

## Milestone 7 — Polish
- Short, revocable share links stored in the database (instead of long URLs).
- "Add to home screen" (PWA) icon so Anči can open it like an app when she misses David.
- Notifications when the other person leaves a comment.

## Requested design revision
- Reworked the interface around the supplied reference: white, blush, peach, soft paper, animated hearts, and full, uncropped photos.
- Album and stage names and cover photos can be changed; stage covers appear on the home page too.
- Full original book text, including poems, is available in an editable reader with stage filters, previous/next navigation, and printing the revised book.
- Database schema and migrations were prepared; live database behavior still requires the deployment migration lifecycle.
- Device speech is available when a Serbian voice is installed. ElevenLabs AI narration was implemented with Serbian speech, bounded parts, and cached MP3 audio in Netlify Blobs. The server API key was configured for production and deploy previews. Live audio generation remains to be verified after deployment.
