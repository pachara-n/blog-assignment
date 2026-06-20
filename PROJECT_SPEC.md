# Project Spec: Blog System (Recruitment Assignment)

## 1. ภาพรวมโปรเจกต์

เว็บไซต์ Blog แบบง่าย มี 2 ฝั่ง:
- **Public**: ผู้ใช้ทั่วไปเข้ามาอ่าน Blog และ comment ได้โดยไม่ต้อง login
- **Admin**: ต้อง login เพื่อจัดการ Blog และ comment

---

## 2. Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Framework | Next.js 14+ (App Router), TypeScript |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| File Storage | Supabase Storage (เก็บรูป Blog) |
| Auth | NextAuth.js (Credentials Provider) — admin role เดียว |
| Styling | Tailwind CSS |
| Deploy | Vercel |

### Environment Variables ที่ต้องใช้
```
DATABASE_URL=           # Supabase Postgres connection string (pooled, สำหรับ runtime)
DIRECT_URL=              # Supabase Postgres direct connection (สำหรับ Prisma migrate)
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # ใช้ฝั่ง server สำหรับอัปโหลดไฟล์เข้า Storage
```

---

## 3. Database Schema (Prisma)

```prisma
model Admin {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // hashed ด้วย bcrypt
  createdAt DateTime @default(now())
}

model Blog {
  id           String    @id @default(cuid())
  title        String
  slug         String    @unique
  content      String    @db.Text
  coverImageUrl String
  viewCount    Int       @default(0)
  isPublished  Boolean   @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  images    BlogImage[]
  comments  Comment[]
}

model BlogImage {
  id      String @id @default(cuid())
  url     String
  order   Int    @default(0)
  blogId  String
  blog    Blog   @relation(fields: [blogId], references: [id], onDelete: Cascade)
}

model Comment {
  id         String        @id @default(cuid())
  authorName String
  content    String        @db.Text
  status     CommentStatus @default(PENDING)
  createdAt  DateTime      @default(now())
  blogId     String
  blog       Blog          @relation(fields: [blogId], references: [id], onDelete: Cascade)
}

enum CommentStatus {
  PENDING
  APPROVED
  REJECTED
}
```

**หมายเหตุ:**
- `coverImageUrl` แยกจาก `BlogImage` เพราะรูปปกเป็น field บังคับของ Blog โดยตรง ส่วน `BlogImage` คือรูปเพิ่มเติม (สูงสุด 6 รายการ ต้อง validate ที่ application layer)
- `viewCount` เพิ่มขึ้นทุกครั้งที่มีคนเปิดหน้า Blog Detail (เพิ่มแบบ atomic increment ฝั่ง server)

---

## 4. Functional Requirements

### 4.1 หน้ารวม Blog (`/`)
- แสดง Blog ที่ `isPublished = true` เท่านั้น เรียงจากใหม่ไปเก่า (`createdAt desc`)
- แสดงต่อรายการ: รูปปก, ชื่อ Blog, เนื้อหาอย่างย่อ (ตัด content ~150 ตัวอักษรแล้วเติม "..."), วันที่โพสต์
- Search: ค้นหาจากชื่อ Blog (`title`) แบบ case-insensitive partial match
- Pagination: หน้าละ 10 รายการ ใช้ query param เช่น `?page=1`

### 4.2 หน้ารายละเอียด Blog (`/blog/[slug]`)
- เข้าถึงผ่าน slug เท่านั้น
- ถ้า Blog เป็น `isPublished = false` ให้ return 404
- แสดง: รูปปก + รูปเพิ่มเติม (gallery, สูงสุด 6 รูป), ชื่อ Blog, วันที่โพสต์, เนื้อหาเต็ม, จำนวนผู้เข้าชม
- เพิ่ม `viewCount` +1 ทุกครั้งที่โหลดหน้า (ฝั่ง server, กันการเพิ่มซ้ำจาก React strict mode/double render)
- แสดงรายการ comment ที่ `status = APPROVED` เท่านั้น เรียงจากเก่าไปใหม่หรือใหม่ไปเก่าได้
- ฟอร์ม submit comment ใหม่ (ดูรายละเอียด validation ในข้อ 4.3)

### 4.3 ระบบ Comment
**Input ที่ต้องกรอก:**
- `authorName` (required, ห้ามว่าง)
- `content` (required, ห้ามว่าง)

**Validation สำหรับ `content`:**
- อนุญาตเฉพาะ: ตัวอักษรภาษาไทย (รวมวรรณยุกต์/สระ), ตัวเลข (0-9 หรือเลขไทย ๐-๙), เว้นวรรค, และเครื่องหมายวรรคตอนพื้นฐาน (เช่น `. , ! ?`)
- **แนวทาง validate ที่แนะนำ:** ใช้ regex ตรวจสอบฝั่ง client (UX ทันที) และตรวจซ้ำฝั่ง server (security — ห้ามเชื่อ client เพียงอย่างเดียว)
  ```regex
  /^[ก-๙0-9\s.,!?]+$/u
  ```
  - ช่วง `ก-๙` ครอบคลุมตัวอักษรไทยทั้งหมดรวมเลขไทย (เป็นช่วง unicode ต่อเนื่องในตาราง Thai block)
  - ถ้าพบอักขระอื่น (อังกฤษ, สัญลักษณ์พิเศษ, emoji) ให้ reject พร้อม error message ชัดเจน
- Comment ใหม่ทุกรายการ สถานะเริ่มต้นคือ `PENDING` — **ไม่แสดงบนหน้า Blog Detail จนกว่า admin จะ approve**

### 4.4 Admin Panel

**Authentication:**
- ทุก route ใต้ `/admin/*` ต้อง login ก่อนเข้าถึง (ใช้ NextAuth middleware)
- หน้า login: `/admin/login` — กรอก username/password ตรวจกับ table `Admin` (เทียบ password ที่ hash ด้วย bcrypt)
- Session-based, redirect ไป `/admin/login` ถ้ายังไม่ login และพยายามเข้า `/admin/*`

**Blog Management (`/admin/blogs`):**
- แสดงรายการ Blog ทั้งหมด (รวมทั้ง published และ unpublished)
- Action ต่อรายการ: Edit, Delete, Toggle Publish/Unpublish
- ปุ่ม "สร้าง Blog ใหม่" → ไปหน้า `/admin/blogs/new`

**Create/Edit Blog (`/admin/blogs/new`, `/admin/blogs/[id]/edit`):**
- ฟอร์ม: title, slug (auto-generate จาก title แต่แก้ไขเองได้, ต้อง unique), content, cover image (อัปโหลด 1 รูป, required), additional images (อัปโหลดได้สูงสุด 6 รูป)
- Validate: slug ต้อง unique (เช็คกับ DB ก่อน save, ถ้าซ้ำแสดง error)
- Validate: additional images ต้องไม่เกิน 6 รูป (reject ที่ฝั่ง client และ server)
- รูปอัปโหลดไปที่ Supabase Storage bucket แยกสำหรับ blog images

**Delete Blog:**
- Hard delete หรือ confirm dialog ก่อนลบ (แนะนำ confirm dialog ป้องกันลบพลาด)
- ลบ Blog แล้ว cascade ลบ `BlogImage` และ `Comment` ที่เกี่ยวข้องด้วย (Prisma `onDelete: Cascade` จัดการให้แล้วใน schema)

**Comment Management (`/admin/comments`):**
- แสดงรายการ comment ทั้งหมด (ทุกสถานะ) พร้อม filter ตามสถานะ (All / Pending / Approved / Rejected)
- แสดง: authorName, content, ชื่อ Blog ที่ comment อยู่, วันเวลา, สถานะ
- Action: Approve (PENDING/REJECTED → APPROVED), Reject (PENDING/APPROVED → REJECTED)
- **สำคัญ: ต้อง reject comment ที่เคย approve ไปแล้วได้ด้วย** (ไม่ใช่ one-way transition)

---

## 5. UI Reference

มี UI mockup ที่ออกแบบไว้แล้วจาก Claude Design (อ้างอิงไฟล์/ลิงก์ design ที่ส่งมาพร้อม spec นี้) ครอบคลุม 6 หน้า:
1. Blog Listing (public)
2. Blog Detail (public)
3. Admin Login
4. Admin Blog Management
5. Admin Create/Edit Blog
6. Admin Comment Management

ให้ใช้ mockup เป็น reference หลักสำหรับ layout, สี, และ component structure

---

## 6. Non-Functional / Deploy Requirements

- Deploy บน Vercel, เชื่อมต่อ Supabase Postgres ผ่าน connection pooling (`DATABASE_URL`) สำหรับ runtime queries และ direct connection (`DIRECT_URL`) สำหรับ Prisma migration
- **ไม่มีหน้า register/sign-up สำหรับ admin** (ยืนยัน — นี่คือ assignment ทดสอบ ไม่ใช่ production) ใช้ seed script สร้าง admin account เดียวสำหรับทดสอบเท่านั้น:
  - ตัวอย่าง credential: username `admin`, password `admin1234`
  - **ห้าม hardcode password เป็น plain text ในโค้ดหรือ schema** — ต้อง hash ด้วย bcrypt ก่อนเก็บลง DB แม้เป็นแค่ test account ก็ตาม (ป้องกันไม่ให้เห็น password ตรงๆ ใน public GitHub repo)
  - เขียนเป็น `prisma/seed.ts` รันด้วย `npx prisma db seed` ครั้งเดียวตอน setup
  - ระบุ credential สำหรับทดสอบไว้ใน README ตรงๆ (ไม่ใช่ในโค้ด) เพื่อให้กรรมการ login ทดสอบได้ทันที
- README ต้องมีคำอธิบาย:
  - วิธี setup local (env vars, migrate, seed)
  - แนวทาง validate ภาษาไทย/ตัวเลขสำหรับ comment (ตามข้อ 4.3)
  - Trade-off หรือข้อจำกัดที่เลือกในการ implement (ถ้ามี)

---

## 7. Out of Scope (ยืนยันจากโจทย์)

- ไม่มีระบบ user registration/login สำหรับผู้อ่านทั่วไป (อ่าน + comment ได้โดยไม่ login)
- ไม่มีระบบ multi-admin role หรือ permission level (admin เดียวพอ)
- ไม่มี requirement เรื่อง category/tag ของ Blog (ไม่ต้องทำเพิ่มถ้าไม่ได้ระบุ)