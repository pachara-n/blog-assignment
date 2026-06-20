import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// withAuth ตรวจสอบ JWT token ใน cookie ก่อน request จะถึง page/route handler
// ถ้าไม่มี token หรือ token หมดอายุ จะ redirect ไป signIn โดยอัตโนมัติ
export default withAuth(
  function middleware() {
    return NextResponse.next()
  },
  {
    pages: {
      signIn: '/admin/login',
    },
  }
)

// matcher กำหนดว่า middleware นี้จะทำงานกับ path ไหนบ้าง
// /admin/:path* หมายถึงทุก path ที่ขึ้นต้นด้วย /admin/ รวมถึง nested routes ทั้งหมด
export const config = {
  matcher: ['/admin/:path*'],
}
