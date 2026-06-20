# PacharaBlog

ระบบ Blog ภาษาไทย สร้างด้วย Next.js 14 App Router พร้อม Admin Panel สำหรับจัดการเนื้อหาและอนุมัติ Comment

## Tech Stack

- **Framework**: Next.js 14.2 (App Router), TypeScript 5
- **Database**: Supabase (PostgreSQL) via Prisma 5 ORM
- **Auth**: NextAuth.js v4 — Credentials Provider, JWT session
- **Storage**: Supabase Storage (รูปภาพ Blog)
- **Styling**: Tailwind CSS v3
- **Deploy**: Vercel

## Features

### สาธารณะ
- แสดงรายการ Blog พร้อมรูปปก ชื่อ เนื้อหาย่อ และวันที่
- ค้นหาจากชื่อ Blog (case-insensitive)
- Pagination 10 รายการต่อหน้า
- หน้ารายละเอียด Blog พร้อม Gallery และจำนวนผู้เข้าชม
- ส่ง Comment (ต้องเป็นภาษาไทยและ/หรือตัวเลขเท่านั้น) — รอ Admin อนุมัติก่อนแสดง

### Admin Panel (ต้อง Login)
- สร้าง / แก้ไข / ลบ Blog
- Publish / Unpublish Blog
- แก้ไข URL Slug
- อัปโหลดรูปปก 1 รูป และรูปเพิ่มเติมได้อีกสูงสุด 6 รูป
- อนุมัติ / ปฏิเสธ Comment (สามารถเปลี่ยนสถานะย้อนกลับได้)

## การติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

```bash
cp .env.example .env
```

เติมค่าทั้งหมดใน `.env`:

```
DATABASE_URL=          # Supabase Postgres pooled (runtime)
DIRECT_URL=            # Supabase Postgres direct (migrations)
NEXTAUTH_SECRET=       # สร้างด้วย: openssl rand -base64 32
NEXTAUTH_URL=          # http://localhost:3000 สำหรับ local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=   # ชื่อ bucket ใน Supabase Storage
```

### 3. สร้าง Supabase Storage Bucket

ใน Supabase Dashboard → Storage → สร้าง bucket ใหม่ (Public) แล้วใส่ชื่อใน `SUPABASE_STORAGE_BUCKET`

### 4. รัน Database Migration

```bash
npx prisma migrate dev --name init
```

### 5. Seed ข้อมูลตัวอย่าง

```bash
npx prisma db seed
```

สร้าง Admin account + 16 Blog + comments ตัวอย่าง

**Admin credentials (สำหรับทดสอบ):**
| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin1234` |

### 6. รัน Dev Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

Admin Panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Commands

```bash
npm run dev              # Dev server
npm run build            # Production build
npm run lint             # ESLint
npx prisma migrate dev   # รัน migration
npx prisma db seed       # Seed ข้อมูล
npx prisma studio        # GUI ดู Database
npx prisma generate      # Regenerate Prisma client
```

## โครงสร้างโปรเจกต์

```
app/
├── (public)/
│   ├── page.tsx                  # หน้ารายการ Blog
│   └── blog/[slug]/page.tsx      # หน้ารายละเอียด Blog
└── admin/
    ├── login/page.tsx
    ├── blogs/page.tsx            # จัดการ Blog ทั้งหมด
    ├── blogs/new/page.tsx        # สร้าง Blog ใหม่
    ├── blogs/[id]/edit/page.tsx  # แก้ไข Blog
    └── comments/page.tsx         # จัดการ Comment
```

## Comment Validation

ข้อความ Comment ต้องตรงกับ regex นี้ทั้งฝั่ง client และ server:

```
/^[ก-๙0-9\s.,!?]+$/u
```

รองรับตัวอักษรไทยทั้งหมด (รวม เลขไทย), ตัวเลขอารบิก และเครื่องหมายวรรคตอนพื้นฐาน — ปฏิเสธตัวอักษรภาษาอื่น สัญลักษณ์ และ Emoji
