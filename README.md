# Heyama Objects

A small full-stack application to create, list, and delete "Objects" — built as a technical
assessment for a Full Stack Developer position at Heyama.

## Overview

Users can create an Object (title, description, image), see it appear instantly in every
connected browser via Socket.IO, and delete it with the same instant propagation. The interface
is optimized for a fast first load and a smooth live demo — no cold starts, no polling.

## Features

- Create / list / view / delete Objects
- Image upload to Cloudflare R2 (S3-compatible), with real MIME-type sniffing (not just the
  declared extension) and a 5 MB size limit
- Real-time updates across all connected clients via Socket.IO (`object.created`, `object.deleted`)
- Loading / empty / error / success states throughout
- Responsive, glassmorphism-inspired UI built with shadcn/ui components

## Architecture

```
USER / RECRUITER
      │
      ▼
   VERCEL (Next.js, shadcn/ui)
      │  REST API + Socket.IO
      ▼
   RAILWAY (NestJS)
      │              │
      ▼              ▼
MongoDB Atlas   Cloudflare R2
```

Vercel and Railway were chosen specifically because neither puts the app to sleep between
requests — the top priority for this project was to avoid a cold-start delay during a live
recruiter demo.

## Tech Stack

**Frontend:** Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui components, Socket.IO
client
**Backend:** NestJS, TypeScript (ESM/NodeNext), Mongoose, Socket.IO, AWS SDK v3 (S3-compatible,
pointed at Cloudflare R2)
**Infra:** GitHub, Vercel, Railway, MongoDB Atlas, Cloudflare R2
**Testing:** Vitest (backend unit tests)

## Project Structure

```
heyama-test/
├── apps/
│   ├── web/     # Next.js app
│   └── api/     # NestJS app
├── packages/
│   └── shared/  # Shared TypeScript types (ObjectDto, socket event names)
├── .env.example
└── pnpm-workspace.yaml
```

## Environment Variables

See `.env.example` at the repo root. Frontend variables go in `apps/web/.env.local`, backend
variables go in `apps/api/.env`.

```
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Backend
NODE_ENV=development
PORT=4000
MONGODB_URI=
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
FRONTEND_URL=http://localhost:3000
```

R2 credentials never reach the browser — the frontend only ever talks to the NestJS API.

## Installation

Requires Node.js 20+ and pnpm.

```bash
corepack enable
pnpm install
```

Then create `apps/api/.env` and `apps/web/.env.local` from `.env.example`.

## Development

```bash
pnpm dev:api   # NestJS on http://localhost:4000
pnpm dev:web   # Next.js on http://localhost:3000
```

## API Endpoints

| Method | Path            | Description                        |
|--------|-----------------|-------------------------------------|
| POST   | `/objects`      | Create an object (multipart/form-data: title, description, image) |
| GET    | `/objects`      | List all objects                    |
| GET    | `/objects/:id`  | Get a single object                 |
| DELETE | `/objects/:id`  | Delete an object (and its R2 image) |

Responses use `201`, `200`, `204`, `400`, `404`, `413`, and `500` as appropriate — never a blanket
`200`.

## Socket.IO Events

| Event             | Payload                       | Emitted when                  |
|--------------------|-------------------------------|--------------------------------|
| `object.created`  | full Object                    | after a successful `POST`      |
| `object.deleted`  | `{ id: string }`               | after a successful `DELETE`    |

## Deployment

1. **Object storage — Cloudflare R2 or an S3-compatible alternative** (e.g. Backblaze B2, which
   requires no credit card for its free tier) — create a bucket, enable public access, and
   generate API credentials. For a non-R2 provider, set `R2_REGION` to the provider's actual
   region (R2 accepts `auto`; most others don't).
2. **MongoDB Atlas** — create a free M0 cluster, a database user, and allow the Railway egress IP
   (or `0.0.0.0/0` for the demo).
3. **Railway** — deploy `apps/api`, set the backend env vars above.
4. **Vercel** — deploy `apps/web`, set `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SOCKET_URL` to the
   Railway URL.

If your R2 public URL uses a custom domain, add it to `remotePatterns` in
`apps/web/next.config.ts` alongside the default `r2.dev` / `r2.cloudflarestorage.com` patterns.

## Security

- Global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted`
- MongoDB `ObjectId` validated before every lookup
- CORS restricted to `FRONTEND_URL` (no wildcard origin)
- Upload validated by real file signature (not just the client-declared MIME type), capped at 5 MB
- Server-generated UUID filenames — user input never controls the storage key
- R2 credentials only ever live server-side
- Centralized exception filter — internal error details are never sent to the client

## Performance

- Server Components by default; `"use client"` only where interactivity is required (form, socket
  listener, delete dialog)
- `next/image` with explicit `sizes`, lazy loading
- No polling — the object list updates purely through Socket.IO push events
- System font stack (no external font request) to keep the first paint fast and dependency-free
- Minimal dependency footprint on both apps

## Demo

1. Open the Vercel URL — the page should load quickly.
2. Create an Object with an image.
3. Open a second browser tab — the new Object should appear instantly, live.
4. Delete it from either tab — it disappears from both.
5. Refresh — the data persists correctly.
