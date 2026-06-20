# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A two-tier blog system built as a recruitment assignment. Public visitors can browse published posts and submit comments without login. A single admin account manages content via a protected panel.

## Tech Stack

- **Framework**: Next.js 14+ (App Router), TypeScript
- **Database**: Supabase (PostgreSQL) via Prisma ORM
- **Auth**: NextAuth.js (Credentials Provider) — single admin role
- **File Storage**: Supabase Storage (blog images)
- **Styling**: Tailwind CSS
- **Deploy**: Vercel

## Commands

Once the project is initialized, standard commands will be:

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npx prisma migrate dev   # Run DB migrations
npx prisma db seed       # Seed admin account (run once on setup)
npx prisma studio        # Browse DB in browser
```

## Environment Variables

```
DATABASE_URL=                    # Supabase Postgres pooled (runtime queries)
DIRECT_URL=                      # Supabase Postgres direct (Prisma migrations)
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Server-side file uploads to Supabase Storage
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
- **Comment**: `status` enum (`PENDING` / `APPROVED` / `REJECTED`). New comments start as `PENDING`. Status transitions are bidirectional (approved comments can be rejected and vice versa). Cascade-deleted with Blog.

### Key Business Rules

**View count**: Increment atomically server-side on Blog Detail load to prevent double-counting from React Strict Mode double renders.

**Comment content validation** (both client and server):
```regex
/^[ก-๙0-9\s.,!?]+$/u
```
Range `ก-๙` covers all Thai characters including Thai numerals. Latin letters, symbols, and emoji are rejected with a clear error message.

**Blog listing**: Shows only `isPublished = true`, ordered `createdAt desc`. Search is case-insensitive partial match on `title`. Pagination at 10 per page via `?page=N`.

**Image uploads**: Go to a dedicated Supabase Storage bucket. Use `SUPABASE_SERVICE_ROLE_KEY` server-side for uploads. Reject more than 6 additional images at both client and server.

**Slug uniqueness**: Auto-generate from title but allow manual override. Check uniqueness against DB before saving; surface an error if duplicate.

### Seed Script

`prisma/seed.ts` creates the single test admin (username: `admin`, password: `admin1234` hashed with bcrypt). Never store plain-text passwords in code. Test credentials are documented in README for evaluators.
