# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A two-tier blog system built as a recruitment assignment. Public visitors can browse published posts and submit comments without login. A single admin account manages content via a protected panel.

## Tech Stack

- **Framework**: Next.js 14.2 (App Router), TypeScript 5
- **Database**: Supabase (PostgreSQL) via Prisma 5 ORM
- **Auth**: NextAuth.js v4 (Credentials Provider) — single admin role, JWT session strategy
- **File Storage**: Supabase Storage (blog images)
- **Styling**: Tailwind CSS v3
- **Deploy**: Vercel

## Current Status

**All UI pages and API routes are complete.** The app is fully functional end-to-end.

### What exists
- `lib/prisma.ts` — singleton PrismaClient (prevents HMR connection pool exhaustion)
- `lib/supabase.ts` — public client (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) and admin client (`SUPABASE_SERVICE_ROLE_KEY`)
- `lib/auth.ts` — NextAuth options with CredentialsProvider + JWT callbacks
- `app/api/auth/[...nextauth]/route.ts` — NextAuth App Router handler
- `middleware.ts` — protects all `/admin/*` routes, redirects to `/admin/login` (uses `withAuth` + `pages.signIn`)
- `app/layout.tsx` — root layout, `lang="th"`, Noto Sans Thai font
- `app/globals.css` — Tailwind directives only
- `app/(public)/layout.tsx` — sticky header + footer shared across public pages
- `app/(public)/page.tsx` — blog listing (search, 3-col grid, pagination 10/page)
- `app/(public)/blog/[slug]/page.tsx` — blog detail (view count increment, gallery, approved comments)
- `app/admin/login/page.tsx` — NextAuth credentials signIn
- `app/admin/blogs/page.tsx` — blog management table (publish toggle, delete)
- `app/admin/blogs/new/page.tsx` — create blog
- `app/admin/blogs/[id]/edit/page.tsx` — edit blog
- `app/admin/comments/page.tsx` — comment moderation (filter tabs, approve/reject)
- `components/AdminNav.tsx` — shared admin top nav (active tab, signOut)
- `components/BlogTable.tsx` — client-side publish toggle + delete
- `components/BlogEditor.tsx` — slug auto-gen, cover + gallery upload (max 6)
- `components/CommentForm.tsx` — public comment submit with Thai regex validation
- `components/CommentTable.tsx` — approve/reject with optimistic UI
- `app/api/blogs/route.ts` — GET public listing (search + pagination), POST create (admin)
- `app/api/blogs/[id]/route.ts` — GET, PUT, DELETE
- `app/api/blogs/[id]/publish/route.ts` — PATCH toggle isPublished
- `app/api/blogs/[id]/images/route.ts` — POST/DELETE Supabase Storage (bucket from `SUPABASE_STORAGE_BUCKET` env var)
- `app/api/admin/blogs/route.ts` — GET all blogs including unpublished (admin only)
- `app/api/comments/route.ts` — POST submit (Thai regex enforced server-side)
- `app/api/comments/[id]/route.ts` — PATCH status (admin only)
- `prisma/schema.prisma` — full schema (Admin, Blog, BlogImage, Comment)
- `prisma/migrations/` — committed migration files
- `prisma/seed.ts` — seeds admin account + 15 published blogs + 1 draft + gallery images + comments (idempotent, skips existing slugs)
- `types/css.d.ts` — CSS module type declaration for TypeScript
- `.env.example` — template for all 8 required env vars (includes `SUPABASE_STORAGE_BUCKET`)
- `next.config.mjs` — MJS format required (Next.js 14 does not support `.ts` config); Supabase + Pexels image domains configured

### Setup required before dev (needs real Supabase credentials)
1. Copy `.env.example` → `.env` and fill in all values including `SUPABASE_STORAGE_BUCKET`
2. `npx prisma migrate dev --name init` — creates DB tables
3. Create Supabase Storage bucket (any name, public read access) and set the name in `.env`
4. `npx prisma db seed` — seeds admin + 16 blogs + gallery images + comments
5. `npm run dev`

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint
npx prisma migrate dev   # Run DB migrations
npx prisma db seed       # Seed admin account (run once on setup)
npx prisma studio        # Browse DB in browser
npx prisma generate      # Regenerate Prisma client after schema changes
```

## Environment Variables

```
DATABASE_URL=                    # Supabase Postgres pooled (runtime queries)
DIRECT_URL=                      # Supabase Postgres direct (Prisma migrations)
NEXTAUTH_SECRET=                 # Generate: openssl rand -base64 32
NEXTAUTH_URL=                    # http://localhost:3000 for local dev
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Server-side file uploads — never expose to browser
SUPABASE_STORAGE_BUCKET=         # Name of the Supabase Storage bucket for blog images
```

## Architecture

### Route Structure

```
app/
├── (public)/
│   ├── page.tsx                  # Blog listing with search + pagination
│   └── blog/[slug]/page.tsx      # Blog detail (404 if unpublished)
└── admin/
    ├── login/page.tsx
    ├── blogs/page.tsx            # Manage all blogs
    ├── blogs/new/page.tsx
    ├── blogs/[id]/edit/page.tsx
    └── comments/page.tsx         # Moderate comments
```

All `/admin/*` routes are protected by NextAuth middleware — unauthenticated requests redirect to `/admin/login`.

### Database Models

- **Admin**: Single account, bcrypt-hashed password. No registration UI — created via `prisma/seed.ts`.
- **Blog**: `slug` (unique, auto-generated from title but editable), `coverImageUrl` (required, separate from gallery), `isPublished`, `viewCount`.
- **BlogImage**: Up to 6 additional images per blog; enforced at both client and server. Cascade-deleted with Blog.
- **Comment**: `status` enum (`PENDING` / `APPROVED` / `REJECTED`). New comments start as `PENDING`. Status transitions are bidirectional. Cascade-deleted with Blog.

### Key Business Rules

**View count**: Increment atomically server-side on Blog Detail load to prevent double-counting from React Strict Mode double renders.

**Comment content validation** (both client and server):
```regex
/^[ก-๙0-9\s.,!?]+$/u
```
Range `ก-๙` covers all Thai characters including Thai numerals. Latin letters, symbols, and emoji are rejected with a clear error message.

**Blog listing**: Shows only `isPublished = true`, ordered `createdAt desc`. Search is case-insensitive partial match on `title`. Pagination at 10 per page via `?page=N`.

**Image uploads**: Use `supabaseAdmin` (service role) server-side. Reject more than 6 additional images at both client and server.

**Slug uniqueness**: Auto-generate from title but allow manual override. Check uniqueness against DB before saving; surface error if duplicate.

### Seed Script

`prisma/seed.ts` creates:
- Admin account (username: `admin`, password: `admin1234` hashed with bcrypt 12 rounds) via `upsert` — idempotent
- 15 published blogs + 1 draft, each with Thai content, Pexels cover image, gallery images (1–3), and realistic comments (APPROVED / PENDING / REJECTED mix)
- Skips blogs whose `slug` already exists — safe to re-run without duplicating data

To reset and re-seed from scratch, delete all rows first (comments → blogImages → blogs → admin) then run `npx prisma db seed`.

## Version Constraints (important)

These versions were pinned deliberately — do not upgrade without testing:

- **Prisma 5** (`prisma@5`, `@prisma/client@5`) — Prisma 7 has a completely different API and is incompatible
- **NextAuth v4** (`next-auth@4`) — v5/Auth.js beta has different configuration
- **Tailwind CSS v3** — v4 uses different config format
- **TypeScript 5** — v6 has breaking changes; tsconfig uses `"target": "ES2017"` (ES5 is deprecated in TS 5.x)
- **Next.js 14** — config file must be `next.config.mjs` (not `.ts`)
- Seed script runs via `ts-node --compiler-options {"module":"CommonJS"}` because tsconfig uses ESNext modules
