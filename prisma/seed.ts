import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const blogs = [
  {
    title: 'เริ่มต้นกับ Next.js 14 App Router',
    slug: 'nextjs-14-app-router',
    content:
      'Next.js 14 มาพร้อม App Router ที่เปลี่ยนวิธีคิดเรื่อง routing ไปอย่างสิ้นเชิง ทั้ง Server Components, Layouts ที่ซ้อนกันได้, และ Streaming ที่ทำให้ UX ดีขึ้นมาก\n\nก่อนหน้านี้เราใช้ Pages Router ซึ่งทุกไฟล์ใน pages/ จะกลายเป็น route อัตโนมัติ แต่ App Router ใช้โฟลเดอร์ app/ แทน และทุก component เป็น Server Component โดย default ซึ่งหมายความว่า JavaScript ของ component นั้นจะไม่ถูกส่งไปยัง browser เลย\n\nการใช้ App Router ทำให้เราสามารถแยก Server Component และ Client Component ออกจากกันได้อย่างชัดเจน โดยใช้ directive "use client" เฉพาะในส่วนที่ต้องการ interactivity เท่านั้น ช่วยลด JavaScript bundle size ได้อย่างมีนัยสำคัญ\n\nนอกจากนี้ App Router ยังรองรับ Nested Layouts ที่ทำให้เราแชร์ UI ระหว่าง route ได้โดยไม่ต้อง re-render ส่วนที่ไม่เปลี่ยน และ loading.tsx กับ error.tsx ที่ทำให้จัดการ state ของหน้าได้ง่ายขึ้นมาก\n\nการ deploy ก็ง่ายมากเพียงแค่ push ขึ้น Vercel ซึ่งรองรับ Next.js ได้อย่างสมบูรณ์แบบ ทั้ง Edge Runtime, Image Optimization และ ISR โดยไม่ต้องตั้งค่าอะไรเพิ่มเติม',
    coverImageUrl: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    viewCount: 128,
    images: [
      'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    comments: [
      { authorName: 'สมชาย ใจดี', content: 'บทความดีมากเลยครับ อ่านแล้วเข้าใจง่าย ขอบคุณมากๆ', status: 'APPROVED' as const },
      { authorName: 'มานี รักเรียน', content: 'ขอบคุณสำหรับบทความนี้นะคะ มีประโยชน์มากเลยค่ะ', status: 'APPROVED' as const },
      { authorName: 'วิชัย เก่งกาจ', content: 'ลองทำตามแล้วได้ผลเลยครับ ขอบคุณครับ', status: 'APPROVED' as const },
      { authorName: 'สุดา ขยันเรียน', content: 'รบกวนถามเพิ่มเติมได้ไหมคะ ตรงส่วน layout ยังงงอยู่นิดนึงค่ะ', status: 'PENDING' as const },
      { authorName: 'ธนากร มั่นคง', content: 'อยากให้เพิ่มตัวอย่างการใช้งาน loading และ error boundary ด้วยครับ', status: 'PENDING' as const },
      { authorName: 'ปิยะ สุขสม', content: 'ดีมากครับ แต่อยากได้ตัวอย่างเพิ่มเติมสักนิดนึงครับ', status: 'REJECTED' as const },
    ],
  },
  {
    title: 'Prisma ORM กับ Supabase ใช้ร่วมกันอย่างไร',
    slug: 'prisma-with-supabase',
    content:
      'Supabase ให้ PostgreSQL ฟรีพร้อม dashboard ที่ใช้งานง่าย แต่การใช้ Prisma ควบคู่ทำให้ได้ type-safety เต็มรูปแบบและจัดการ migration ได้ง่ายกว่ามาก\n\nสิ่งที่คนมักสับสนคือความแตกต่างระหว่าง DATABASE_URL และ DIRECT_URL ในไฟล์ .env โดย DATABASE_URL ใช้ connection pooler ของ Supabase (port 6543) เหมาะสำหรับ runtime queries ที่มีการเรียกใช้บ่อย ส่วน DIRECT_URL เชื่อมต่อตรงกับ PostgreSQL (port 5432) ใช้สำหรับ Prisma migrations เท่านั้น\n\nการตั้งค่า connection pool ที่เหมาะสมเป็นเรื่องสำคัญมาก โดยปกติ Supabase free tier จะให้ connection ไม่เกิน 60 connections ถ้าไม่ใช้ pooler อาจทำให้ connection หมดได้ง่ายในสภาพแวดล้อม serverless\n\nสำหรับ Prisma Studio ซึ่งเป็น GUI สำหรับดูและแก้ไขข้อมูลใน database สามารถรันได้ด้วยคำสั่ง npx prisma studio แล้วเปิด browser ที่ localhost:5555 ได้เลย มีประโยชน์มากในช่วง development\n\nการ seed ข้อมูลตัวอย่างด้วย prisma/seed.ts ทำให้ทีมทุกคนมีข้อมูลเริ่มต้นเหมือนกันตั้งแต่ต้น และการใช้ upsert แทน create ทำให้ run seed ซ้ำได้โดยไม่เกิด error',
    coverImageUrl: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    viewCount: 74,
    images: [
      'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/270360/pexels-photo-270360.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    comments: [
      { authorName: 'กมลชนก ใจงาม', content: 'เพิ่งเริ่มใช้ Supabase ครั้งแรกเลยค่ะ บทความนี้ช่วยได้มากเลย', status: 'APPROVED' as const },
      { authorName: 'ณัฐพล รักษ์ดี', content: 'ขอบคุณครับ ปัญหา connection pool ที่ผมเจออยู่แก้ได้แล้ว', status: 'APPROVED' as const },
      { authorName: 'อรุณี สดใส', content: 'อยากทราบเพิ่มเติมเรื่อง Row Level Security ด้วยค่ะ', status: 'PENDING' as const },
    ],
  },
  {
    title: 'ทำ Authentication ด้วย NextAuth.js v4',
    slug: 'nextauth-v4-credentials',
    content:
      'NextAuth.js v4 กับ Credentials Provider เหมาะสำหรับระบบที่ต้องการ login ด้วย username และ password โดยไม่ต้องพึ่ง OAuth provider ภายนอก เหมาะมากสำหรับระบบ admin ที่มี user เดียว\n\nขั้นตอนแรกคือติดตั้ง next-auth แล้วสร้างไฟล์ app/api/auth/[...nextauth]/route.ts ซึ่งเป็น catch-all route ที่ NextAuth ใช้จัดการทุก request ที่เกี่ยวกับ authentication\n\nการตั้งค่า JWT session strategy ทำให้ไม่ต้องเก็บ session ใน database แต่เข้ารหัสข้อมูลไว้ใน cookie แทน ทำให้ scale ได้ง่ายกว่า แต่ต้องระวังว่า JWT จะ invalidate ได้ยากกว่า database session\n\nการป้องกัน route ด้วย middleware เป็นวิธีที่สะอาดที่สุด โดยสร้างไฟล์ middleware.ts ที่ root ของ project แล้วใช้ withAuth จาก next-auth/middleware ซึ่งจะ redirect ไปหน้า login อัตโนมัติถ้ายังไม่ได้ login\n\nสิ่งสำคัญที่สุดคือ NEXTAUTH_SECRET ต้องเป็น random string ที่ยาวและคาดเดาไม่ได้ สามารถ generate ได้ด้วยคำสั่ง openssl rand -base64 32 และต้องไม่ commit ลง git repository เด็ดขาด',
    coverImageUrl: 'https://images.pexels.com/photos/5483240/pexels-photo-5483240.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    viewCount: 52,
    images: [
      'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    comments: [
      { authorName: 'พิมพ์ใจ ดวงดี', content: 'ทำตามแล้วใช้งานได้เลยค่ะ ขอบคุณมากนะคะ', status: 'APPROVED' as const },
      { authorName: 'ชาญชัย เชี่ยวชาญ', content: 'อยากให้มีตัวอย่าง refresh token ด้วยครับ', status: 'APPROVED' as const },
      { authorName: 'วรรณา สุขใจ', content: 'บทความนี้ช่วยได้มากค่ะ เข้าใจเรื่อง JWT ชัดขึ้นมากเลย', status: 'APPROVED' as const },
      { authorName: 'สิทธิชัย มุ่งมั่น', content: 'ขอถามเรื่อง session expiry ได้ไหมครับ ตั้งค่ายังไงดีครับ', status: 'PENDING' as const },
    ],
  },
  {
    title: 'Tailwind CSS v3 Tips ที่ใช้บ่อย',
    slug: 'tailwind-css-v3-tips',
    content:
      'Tailwind CSS เปลี่ยนวิธีการเขียน CSS ไปอย่างสิ้นเชิงด้วยแนวคิด utility-first ที่ให้เราใส่ class ตรงๆ ใน HTML แทนการเขียน CSS แยก ทำให้ไม่ต้องคิดชื่อ class และลด context switching\n\nหนึ่งในฟีเจอร์ที่มีประโยชน์มากคือ group modifier ที่ทำให้ style child element ตาม state ของ parent ได้ เช่น group-hover:opacity-100 จะทำงานเมื่อ hover บน parent ที่มี class group ส่วน peer modifier ทำงานคล้ายกันแต่กับ sibling element\n\nการใช้ arbitrary values เช่น w-[327px] หรือ bg-[#1a1a1a] ทำให้ไม่ต้องออกนอก Tailwind เพื่อเขียน CSS custom เลย และ JIT (Just-In-Time) compiler ที่เปิดใช้โดย default ใน v3 ทำให้ generate เฉพาะ class ที่ใช้จริงเท่านั้น\n\nสำหรับ responsive design ใช้ prefix sm: md: lg: xl: 2xl: ตามลำดับ โดยทำงานแบบ mobile-first คือ class ที่ไม่มี prefix จะใช้กับทุกขนาด และ prefix จะ override เมื่อถึง breakpoint นั้นๆ\n\nการสร้าง dark mode ทำได้ง่ายโดยเพิ่ม darkMode: "class" ใน tailwind.config.js แล้วใช้ dark: prefix เช่น dark:bg-gray-900 จากนั้นเพิ่ม class dark ที่ html element เพื่อเปิด dark mode',
    coverImageUrl: 'https://images.pexels.com/photos/1972464/pexels-photo-1972464.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    viewCount: 200,
    images: [
      'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    comments: [
      { authorName: 'นภา รุ่งเรือง', content: 'ใช้ Tailwind มาสักพักแล้วแต่เพิ่งรู้เรื่อง peer modifier นี่เองค่ะ ขอบคุณมากนะคะ', status: 'APPROVED' as const },
      { authorName: 'เกรียงไกร ยิ่งใหญ่', content: 'บทความนี้ดีมากครับ ใช้ group hover ได้สวยมากเลย', status: 'APPROVED' as const },
      { authorName: 'ลลิตา สวยงาม', content: 'ขอบคุณค่ะ เพิ่งย้ายจาก Bootstrap มาใช้ Tailwind พอดีเลย', status: 'APPROVED' as const },
      { authorName: 'อภิชาต ฉลาดเฉลียว', content: 'อยากให้เพิ่มเรื่อง dark mode แบบ manual toggle ด้วยครับ', status: 'APPROVED' as const },
      { authorName: 'ธิดารัตน์ งามพร้อม', content: 'ติดตามบทความนี้มาตลอดเลยค่ะ เขียนได้ชัดเจนมากๆ', status: 'PENDING' as const },
      { authorName: 'ไม่ประสงค์ออกนาม', content: 'คลิกที่นี่เพื่อรับรางวัล', status: 'REJECTED' as const },
    ],
  },
  {
    title: 'TypeScript Generics ฉบับเข้าใจง่าย',
    slug: 'typescript-generics-easy',
    content:
      'Generics เป็นส่วนที่คนมักข้ามเพราะดูยาก แต่พอเข้าใจแล้วจะเขียน TypeScript ได้ type-safe มากขึ้น บทความนี้ยังอยู่ระหว่างเขียน จะครอบคลุม Generic function, Generic interface, Conditional Types และ Mapped Types',
    coverImageUrl: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: false,
    viewCount: 0,
    images: [],
    comments: [],
  },
  {
    title: 'React Server Components คืออะไร และใช้ยังไง',
    slug: 'react-server-components-guide',
    content:
      'React Server Components หรือ RSC เป็นฟีเจอร์ที่เปลี่ยนวิธีที่เรา render UI ไปอย่างสิ้นเชิง โดย component ทำงานบน server และส่งผลลัพธ์เป็น serialized representation ของ UI มาให้ browser แทนที่จะส่ง JavaScript ทั้งก้อน\n\nความแตกต่างหลักระหว่าง Server Component และ Client Component คือ Server Component ไม่มี state, ไม่ใช้ event handlers, ไม่ใช้ browser-only API แต่สามารถ fetch ข้อมูลได้โดยตรง เข้าถึง file system และ database ได้เลยโดยไม่ต้องผ่าน API\n\nใน Next.js 14 App Router ทุก component เป็น Server Component โดย default การเพิ่ม "use client" ที่ด้านบนของไฟล์จะเปลี่ยนเป็น Client Component ซึ่งควรทำเฉพาะเมื่อต้องการ useState, useEffect, event handlers หรือ browser API เท่านั้น\n\nหลักการสำคัญคือควร push Client Component ลงไปให้ลึกที่สุดในต้นไม้ component เพื่อให้ส่วนใหญ่ของแอปยังคงเป็น Server Component และได้ประโยชน์จากการลด JavaScript ที่ส่งไปยัง browser',
    coverImageUrl: 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    viewCount: 95,
    images: [
      'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    comments: [
      { authorName: 'ปริญญา เรืองรอง', content: 'เพิ่งเข้าใจเรื่อง Server Component เลยค่ะ ขอบคุณมากๆ', status: 'APPROVED' as const },
      { authorName: 'สุรศักดิ์ แข็งแกร่ง', content: 'อยากให้เพิ่มตัวอย่างการ fetch data ใน Server Component ด้วยครับ', status: 'PENDING' as const },
    ],
  },
  {
    title: 'Docker สำหรับ Next.js ฉบับเริ่มต้น',
    slug: 'docker-for-nextjs-beginners',
    content:
      'Docker ช่วยให้เรา package แอปพลิเคชันพร้อม dependencies ทั้งหมดลงใน container ทำให้ run ได้เหมือนกันทุกที่ไม่ว่าจะเป็น local, staging หรือ production\n\nการเขียน Dockerfile สำหรับ Next.js ที่ดีควรใช้ multi-stage build โดยแบ่งเป็น deps stage สำหรับติดตั้ง dependencies, builder stage สำหรับ build แอป และ runner stage สำหรับ run production เท่านั้น ทำให้ image สุดท้ายมีขนาดเล็กที่สุด\n\nการใช้ .dockerignore เพื่อ exclude ไฟล์ที่ไม่จำเป็นออกจาก build context เช่น node_modules, .next, .env ช่วยทำให้ build เร็วขึ้นมากและลดความเสี่ยงที่ secrets จะรั่วไหลเข้าไปใน image\n\nสำหรับ development ใช้ docker-compose.yml ในการ run ทั้ง Next.js app และ PostgreSQL database พร้อมกัน ทำให้ทีมทุกคน setup environment ได้เหมือนกันด้วยคำสั่งเดียวคือ docker-compose up',
    coverImageUrl: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    viewCount: 61,
    images: [
      'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    comments: [
      { authorName: 'วรพล ตั้งใจ', content: 'ขอบคุณครับ ทำตามแล้วรันได้เลย ไม่ยากอย่างที่คิด', status: 'APPROVED' as const },
      { authorName: 'กานต์ดา มีสุข', content: 'อยากให้มีตัวอย่าง nginx reverse proxy ด้วยค่ะ', status: 'APPROVED' as const },
      { authorName: 'ภูมิพัฒน์ ก้าวไกล', content: 'ใช้ได้เลยครับ ขอบคุณมากๆ', status: 'PENDING' as const },
    ],
  },
  {
    title: 'Git Flow สำหรับทีม Developer',
    slug: 'git-flow-for-teams',
    content:
      'การจัดการ branch ใน Git ให้เป็นระบบเป็นสิ่งสำคัญมากเมื่อทีมมีขนาดใหญ่ขึ้น บทความนี้เปรียบเทียบสามแนวทางหลักคือ Git Flow, GitHub Flow และ Trunk Based Development\n\nGit Flow เหมาะกับโปรเจกต์ที่มี release cycle ชัดเจน โดยแบ่ง branch หลักเป็น main สำหรับ production และ develop สำหรับ integration พร้อม branch ย่อยอย่าง feature, release และ hotfix\n\nGitHub Flow เรียบง่ายกว่ามาก มีแค่ main branch และ feature branch โดยทุก feature branch merge กลับ main โดยตรงผ่าน Pull Request เหมาะกับทีมที่ deploy บ่อยและไม่มี release แบบ versioned\n\nTrunk Based Development เป็นแนวทางที่ aggressive ที่สุด โดย developer ทุกคน commit ลง main branch โดยตรงหรือใช้ short-lived feature branch ที่อยู่ได้ไม่เกิน 1-2 วัน ต้องใช้ feature flags เพื่อควบคุมการ release\n\nการตั้งค่า branch protection rules บน GitHub เพื่อบังคับให้ทุก merge ผ่าน Pull Request และผ่าน CI checks ก่อน เป็นสิ่งสำคัญที่ทีมทุกขนาดควรทำ',
    coverImageUrl: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    viewCount: 143,
    images: [
      'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    comments: [
      { authorName: 'ทวีศักดิ์ มั่นใจ', content: 'บทความนี้ดีมากครับ ทีมผมเพิ่งนำไปใช้ได้เลย', status: 'APPROVED' as const },
      { authorName: 'รัตนา สุขสันต์', content: 'ขอบคุณค่ะ เข้าใจ Git Flow ชัดขึ้นมากเลย', status: 'APPROVED' as const },
    ],
  },
  {
    title: 'REST API vs GraphQL เลือกอะไรดี',
    slug: 'rest-api-vs-graphql',
    content:
      'REST และ GraphQL เป็นสองแนวทางหลักในการออกแบบ API ที่มีปรัชญาต่างกันอย่างสิ้นเชิง การเลือกใช้ขึ้นอยู่กับ use case และความต้องการของโปรเจกต์\n\nREST ใช้ HTTP methods และ URL เป็นตัวกำหนด resource โดยแต่ละ endpoint return ข้อมูลในรูปแบบที่ server กำหนดไว้ ข้อดีคือเข้าใจง่าย caching ทำได้ตรงไปตรงมาด้วย HTTP cache headers และ tooling มีพร้อมมาก\n\nGraphQL ให้ client เป็นผู้กำหนดว่าต้องการข้อมูลอะไร ทำให้แก้ปัญหา over-fetching และ under-fetching ได้ดี เหมาะมากสำหรับ mobile app ที่ bandwidth จำกัด และ frontend หลายแบบที่ต้องการข้อมูลต่างกัน\n\nในแง่ performance REST อาจเร็วกว่าสำหรับ simple queries เพราะไม่มี overhead ของ query parsing แต่ GraphQL ชนะในกรณีที่ต้องดึงข้อมูลจากหลาย resource ในครั้งเดียว\n\nสำหรับโปรเจกต์ส่วนใหญ่ REST เพียงพอและง่ายกว่า ควรพิจารณา GraphQL เมื่อมี frontend หลายแบบ, ข้อมูลซับซ้อน หรือต้องการ real-time subscriptions',
    coverImageUrl: 'https://images.pexels.com/photos/270360/pexels-photo-270360.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    viewCount: 178,
    images: [
      'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    comments: [
      { authorName: 'ชนินทร์ ฉลาดล้ำ', content: 'อ่านแล้วตัดสินใจได้เลยครับว่าจะใช้อะไร ขอบคุณมากๆ', status: 'APPROVED' as const },
      { authorName: 'พรรณิภา งามวิไล', content: 'ขอบคุณค่ะ บทความนี้ช่วยได้มากเลย', status: 'APPROVED' as const },
      { authorName: 'เจษฎา กล้าหาญ', content: 'อยากให้เพิ่มตัวอย่าง subscription ของ GraphQL ด้วยครับ', status: 'PENDING' as const },
    ],
  },
  {
    title: 'Web Performance Optimization เบื้องต้น',
    slug: 'web-performance-optimization',
    content:
      'ความเร็วของเว็บไซต์ส่งผลโดยตรงต่อ user experience, conversion rate และ SEO โดย Google ใช้ Core Web Vitals เป็นส่วนหนึ่งของ ranking signal ตั้งแต่ปี 2021\n\nCore Web Vitals ประกอบด้วย LCP (Largest Contentful Paint) ที่วัดความเร็วในการโหลด content หลัก, FID (First Input Delay) หรือ INP ที่วัด responsiveness และ CLS (Cumulative Layout Shift) ที่วัดความเสถียรของ layout\n\nเทคนิคที่ช่วยได้มากที่สุดคือการ optimize รูปภาพ ซึ่งมักเป็นสาเหตุหลักของหน้าเว็บที่โหลดช้า ควรใช้ format WebP หรือ AVIF, กำหนด width และ height ที่ถูกต้อง, และใช้ lazy loading สำหรับรูปที่ไม่อยู่ใน viewport แรก\n\nCode splitting และ lazy loading component ช่วยลด JavaScript ที่ต้องโหลดและ parse ตั้งแต่แรก โดยใช้ dynamic import ใน Next.js เพื่อแยก component ขนาดใหญ่ออกเป็น chunk แยกต่างหาก\n\nการตั้งค่า Cache-Control headers ที่เหมาะสมสำหรับ static assets ช่วยให้ browser cache ไฟล์ได้นานขึ้น ลดการ request ซ้ำ ซึ่ง Vercel ทำสิ่งนี้ให้อัตโนมัติสำหรับ Next.js',
    coverImageUrl: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    viewCount: 89,
    images: [
      'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    comments: [
      { authorName: 'ไพบูลย์ ดีเลิศ', content: 'นำไปใช้แล้วได้ 100 คะแนน Lighthouse เลยครับ', status: 'APPROVED' as const },
      { authorName: 'ศิริพร งามสง่า', content: 'ขอบคุณค่ะ เพิ่งรู้จัก Core Web Vitals ครั้งแรกเลย', status: 'APPROVED' as const },
      { authorName: 'วัชรพล เข้มแข็ง', content: 'อยากให้เพิ่มเรื่อง service worker ด้วยครับ', status: 'PENDING' as const },
    ],
  },
  {
    title: 'PostgreSQL Index ทำงานอย่างไร',
    slug: 'postgresql-index-explained',
    content:
      'Index คือโครงสร้างข้อมูลเสริมที่ช่วยให้ database ค้นหาข้อมูลได้เร็วขึ้นโดยไม่ต้อง scan ทุก row ในตาราง แต่ก็มีต้นทุนในแง่ของ storage และ write performance\n\nประเภท Index หลักใน PostgreSQL คือ B-tree ซึ่งเป็น default และเหมาะกับ equality และ range queries ส่วน Hash Index เหมาะกับ equality เท่านั้นแต่เร็วกว่า B-tree สำหรับกรณีนั้น GIN Index เหมาะกับ full-text search และ array/jsonb และ GiST เหมาะกับ geospatial data\n\nการใช้ EXPLAIN ANALYZE ก่อน query ช่วยให้เห็น query plan ของ PostgreSQL ว่าใช้ Index หรือเปล่า และ cost ของแต่ละ operation เป็นเครื่องมือที่ขาดไม่ได้ในการ optimize\n\nสิ่งที่ต้องระวังคือ Index ที่มากเกินไปจะทำให้ INSERT, UPDATE, DELETE ช้าลงเพราะต้องอัปเดต Index ทุกครั้ง ควรสร้าง Index เฉพาะ column ที่ใช้ใน WHERE clause บ่อยๆ และมี cardinality สูง (มีค่าหลากหลาย)',
    coverImageUrl: 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    viewCount: 56,
    images: [
      'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/270360/pexels-photo-270360.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    comments: [
      { authorName: 'สมพงษ์ รู้จริง', content: 'ขอบคุณครับ เพิ่งเข้าใจว่าทำไม query ถึงช้า', status: 'APPROVED' as const },
      { authorName: 'จิราภรณ์ ละเอียด', content: 'บทความนี้ดีมากค่ะ อธิบายได้ชัดเจนมากเลย', status: 'PENDING' as const },
    ],
  },
  {
    title: 'CI/CD ด้วย GitHub Actions ตั้งแต่ศูนย์',
    slug: 'cicd-github-actions-zero-to-hero',
    content:
      'GitHub Actions ช่วยให้เราทำ CI/CD ได้โดยไม่ต้องพึ่งบริการภายนอกอย่าง Jenkins หรือ CircleCI เพราะรวมอยู่ใน GitHub repository เลย\n\nพื้นฐานของ GitHub Actions คือ workflow file ในรูปแบบ YAML ที่เก็บใน .github/workflows/ โดย workflow ประกอบด้วย trigger (เช่น push, pull_request), jobs และ steps ที่รันตามลำดับ\n\nการทำ CI pipeline ขั้นพื้นฐานควรมีการ install dependencies, run linter, run type check และ run tests ทุกครั้งที่มี push หรือ pull request เพื่อ catch bug ก่อน merge\n\nสำหรับ CD การ deploy ไปยัง Vercel สามารถทำได้ง่ายผ่าน Vercel CLI หรือ vercel/action โดยใช้ VERCEL_TOKEN ที่เก็บใน GitHub Secrets ซึ่งจะถูก inject เข้า environment ตอน run workflow โดยไม่ปรากฏใน log\n\nการใช้ matrix strategy ช่วยให้ test บน Node.js หลาย version หรือ OS หลายแบบพร้อมกันได้ในครั้งเดียว ประหยัดเวลาได้มากเมื่อต้องการ compatibility testing',
    coverImageUrl: 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    viewCount: 112,
    images: [
      'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    comments: [
      { authorName: 'ประสิทธิ์ เก่งมาก', content: 'ทำตามแล้ว deploy อัตโนมัติได้เลยครับ ดีมากๆ', status: 'APPROVED' as const },
      { authorName: 'นงลักษณ์ ใจดี', content: 'ขอบคุณค่ะ ตามได้เลยเพราะอธิบายละเอียดมาก', status: 'APPROVED' as const },
      { authorName: 'อำนาจ กล้าดี', content: 'อยากให้เพิ่มตัวอย่าง matrix strategy ด้วยครับ', status: 'PENDING' as const },
      { authorName: 'ไม่ระบุตัวตน', content: 'สแปมสแปมสแปม', status: 'REJECTED' as const },
    ],
  },
  {
    title: 'Zod กับ TypeScript Validation ที่สมบูรณ์แบบ',
    slug: 'zod-typescript-validation',
    content:
      'Zod เป็น schema validation library ที่ออกแบบมาสำหรับ TypeScript โดยเฉพาะ จุดเด่นสำคัญคือสามารถ infer TypeScript type จาก schema ได้โดยอัตโนมัติ ทำให้ไม่ต้องเขียน type และ validation แยกกัน\n\nการใช้ Zod ใน API route ช่วยป้องกัน invalid data จาก client ได้อย่างมีประสิทธิภาพ โดย parse request body ผ่าน schema ก่อนนำไปใช้ ถ้า validation ไม่ผ่านจะ throw ZodError ที่มี error message ละเอียดมาก\n\nการสร้าง custom validator ทำได้ด้วย .refine() หรือ .superRefine() เช่น validate ว่า email มีอยู่จริงใน database หรือว่าตัวเลขอยู่ในช่วงที่ต้องการ\n\nการใช้ Zod ร่วมกับ React Hook Form ผ่าน @hookform/resolvers/zod ทำให้ validation ทำงานทั้ง client-side และ server-side โดยใช้ schema เดียวกัน ลด code duplication ได้มาก\n\nสำหรับ error message ภาษาไทย สามารถ custom ได้ผ่าน errorMap option หรือใส่ message ใน schema โดยตรง เช่น z.string().min(1, "กรุณากรอกข้อมูล")',
    coverImageUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    viewCount: 67,
    images: [
      'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    comments: [
      { authorName: 'ภาวิณี ฉลาดเฉลียว', content: 'ใช้ Zod กับ React Hook Form แล้วชีวิตง่ายขึ้นมากเลยค่ะ', status: 'APPROVED' as const },
      { authorName: 'ดำรงค์ มุ่งมั่น', content: 'ขอบคุณครับ เพิ่งย้ายจาก yup มาใช้ Zod พอดีเลย', status: 'APPROVED' as const },
    ],
  },
  {
    title: 'Vercel Edge Functions ทำงานอย่างไร',
    slug: 'vercel-edge-functions-explained',
    content:
      'Edge Functions รัน code ที่ edge nodes ของ CDN ทั่วโลก ทำให้ latency ต่ำมากเพราะ code รันใกล้กับผู้ใช้มากที่สุด แทนที่จะรันที่ server กลาง\n\nความแตกต่างหลักระหว่าง Edge Runtime กับ Node.js Runtime คือ Edge Runtime ใช้ Web Standard APIs เช่น Fetch API, Web Crypto ไม่มี Node.js built-in modules และมี cold start time ที่เร็วกว่ามาก\n\nใน Next.js การตั้งค่า Edge Runtime ทำได้ด้วยการ export runtime = "edge" ในไฟล์ middleware หรือ route handler ซึ่งเหมาะมากสำหรับงานอย่าง authentication middleware, A/B testing, geolocation-based redirects\n\nข้อจำกัดสำคัญของ Edge Runtime คือไม่สามารถใช้ Node.js APIs ได้ ทำให้ Prisma ซึ่งต้องการ Node.js ไม่สามารถใช้งานได้ใน Edge ต้องใช้ HTTP-based database client แทน\n\nการเลือกระหว่าง Edge และ Node.js ควรพิจารณาจาก latency requirements, library compatibility และ complexity ของ logic เป็นหลัก',
    coverImageUrl: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    viewCount: 44,
    images: [
      'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    comments: [
      { authorName: 'ปณิธาน ยิ่งใหญ่', content: 'เพิ่งรู้จัก Edge Function ครั้งแรกเลยครับ ขอบคุณมากๆ', status: 'APPROVED' as const },
      { authorName: 'สุภาพร เปี่ยมสุข', content: 'อยากได้ตัวอย่าง geolocation routing ด้วยค่ะ', status: 'PENDING' as const },
    ],
  },
  {
    title: 'React Query กับการจัดการ Server State',
    slug: 'react-query-server-state',
    content:
      'React Query หรือ TanStack Query เปลี่ยนวิธีที่เรา manage server state ใน React application โดยแยก server state (ข้อมูลจาก API) ออกจาก client state (UI state) อย่างชัดเจน\n\nuseQuery เป็น hook หลักสำหรับ fetch ข้อมูล โดย React Query จัดการ loading, error, caching และ background refetching ให้อัตโนมัติ ไม่ต้องเขียน useEffect สำหรับ fetch อีกต่อไป\n\nการตั้งค่า staleTime กำหนดว่าข้อมูลใน cache จะ "เก่า" เมื่อไหร่ ถ้าตั้งเป็น 5 นาที React Query จะไม่ refetch ถ้า component mount ภายใน 5 นาทีหลัง fetch ครั้งล่าสุด ช่วยลด unnecessary requests ได้มาก\n\nuseMutation ใช้สำหรับ create, update, delete และรองรับ optimistic update ซึ่งอัปเดต UI ทันทีก่อนที่ server จะ response แล้วค่อย rollback ถ้า error เกิดขึ้น ทำให้ UX ดูเร็วขึ้นมาก\n\nสำหรับ pagination ใช้ useInfiniteQuery ที่รองรับ infinite scroll และ load more pattern ได้อย่างสวยงาม โดย React Query จัดการ page cursor และการ merge ข้อมูลให้อัตโนมัติ',
    coverImageUrl: 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=800',
    isPublished: true,
    viewCount: 83,
    images: [
      'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800',
    ],
    comments: [
      { authorName: 'ชัยวัฒน์ สุดยอด', content: 'ใช้ React Query แล้วไม่อยากกลับไปใช้ useEffect fetch ข้อมูลแล้วครับ', status: 'APPROVED' as const },
      { authorName: 'กัลยา รักดี', content: 'ขอบคุณค่ะ อธิบาย staleTime ได้ชัดมากเลย', status: 'APPROVED' as const },
      { authorName: 'วิโรจน์ ตั้งมั่น', content: 'อยากให้มีตัวอย่าง infinite scroll ด้วยครับ', status: 'PENDING' as const },
    ],
  },
]

async function main() {
  const hashedPassword = await bcrypt.hash('admin1234', 12)

  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashedPassword },
  })
  console.log('Seeded admin:', admin.username)

  for (const { comments, images, ...blogData } of blogs) {
    const existing = await prisma.blog.findUnique({ where: { slug: blogData.slug } })
    if (existing) {
      console.log('ข้ามเพราะมีอยู่แล้ว:', blogData.slug)
      continue
    }

    const created = await prisma.blog.create({ data: blogData })

    if (images.length > 0) {
      await prisma.blogImage.createMany({
        data: images.map((url, order) => ({ url, order, blogId: created.id })),
      })
    }

    if (comments.length > 0) {
      await prisma.comment.createMany({
        data: comments.map((c) => ({ ...c, blogId: created.id })),
      })
    }

    console.log('Seeded blog:', blogData.slug, `(${images.length} images, ${comments.length} comments)`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
