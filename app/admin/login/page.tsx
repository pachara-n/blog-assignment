'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError(false)
    if (!username.trim() || !password.trim()) { setError(true); return }
    setLoading(true)
    const result = await signIn('credentials', { username, password, redirect: false })
    setLoading(false)
    if (result?.error) { setError(true); return }
    router.push('/admin/blogs')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: "'Noto Sans Thai', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ fontSize: 26, fontWeight: 700, color: '#242424', textDecoration: 'none', letterSpacing: '-0.3px' }}>
            PacharaBlog
          </Link>
          <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 8 }}>เข้าสู่ระบบจัดการ</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, padding: '36px 32px' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#242424', marginBottom: 28 }}>Admin Login</h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#242424', marginBottom: 6 }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(false) }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="กรอก username"
                style={{ width: '100%', height: 46, padding: '0 14px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', color: '#242424', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#242424', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false) }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="กรอกรหัสผ่าน"
                style={{ width: '100%', height: 46, padding: '0 14px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', color: '#242424', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Username หรือ Password ไม่ถูกต้อง
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{ width: '100%', height: 46, background: loading ? '#555' : '#242424', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/" style={{ fontSize: 14, color: '#757575', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            กลับหน้าเว็บ Blog
          </Link>
        </div>
      </div>
    </div>
  )
}
