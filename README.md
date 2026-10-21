# KITAAAA — The Museum of You
React + TypeScript + Vite + Three.js (@react-three/fiber). Fully static; no backend or env vars.

## Run
`npm install && npm run dev` · production: `npm run build` (output `dist/`).

## Make it yours
Edit **`src/data/museum.ts`** only: names, quote, rooms, exhibits, dates, captions, and the final letter (`letter.lines`).
Put photos in `public/images/` and set `image: '/images/her.jpg'` on an exhibit. Missing images show a generated placeholder.
`public/audio/` is reserved; audio is not implemented yet.

## Deploy to Vercel
1. `git init && git add . && git commit -m "museum"`; push to GitHub.
2. vercel.com → Add New Project → import the repo. Framework preset **Vite**, build `npm run build`, output `dist`.
3. Deploy the preview, test it (enter, walk all rooms, open exhibits, read the letter), then promote to production.
No `vercel.json` needed (single route, no SPA rewrites).
