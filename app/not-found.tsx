import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans Thai', sans-serif", background: '#f7f7f8' }}>
      <p style={{ fontSize: 96, fontWeight: 700, color: '#e5e5e5', lineHeight: 1, margin: 0 }}>404</p>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#242424', marginTop: 16, marginBottom: 8 }}>ไม่พบหน้าที่ต้องการ</h1>
      <p style={{ fontSize: 15, color: '#9ca3af', marginBottom: 32 }}>บทความนี้อาจถูกลบหรือ URL ไม่ถูกต้อง</p>
      <Link
        href="/"
        style={{ height: 42, padding: '0 24px', background: '#242424', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
      >
        กลับหน้าหลัก
      </Link>
    </div>
  )
}
