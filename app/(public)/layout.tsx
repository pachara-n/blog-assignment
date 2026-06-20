import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', color: '#242424' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #eaeaea',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 32px',
          height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ fontSize: 21, fontWeight: 700, color: '#242424', textDecoration: 'none', letterSpacing: '-0.3px' }}>
            PacharaBlog
          </Link>
          <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <Link href="/" style={{ fontSize: 14, color: '#242424', textDecoration: 'none', fontWeight: 500 }}>
              หน้าแรก
            </Link>
            <Link href="/admin/login" style={{ fontSize: 14, color: '#757575', textDecoration: 'none' }}>
              เข้าสู่ระบบ Admin
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>{children}</main>

      <footer style={{ borderTop: '1px solid #eaeaea', marginTop: 32 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>© 2026 PacharaBlog — สงวนลิขสิทธิ์</p>
        </div>
      </footer>
    </div>
  )
}
