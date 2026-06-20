'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function AdminNav() {
  const pathname = usePathname()
  const isBlogsActive = pathname.startsWith('/admin/blogs')
  const isCommentsActive = pathname.startsWith('/admin/comments')

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #eaeaea' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link href="/admin/blogs" style={{ fontSize: 18, fontWeight: 700, color: '#242424', textDecoration: 'none', letterSpacing: '-0.3px' }}>
            PacharaBlog <span style={{ fontWeight: 400, fontSize: 13, color: '#9ca3af', marginLeft: 4 }}>Admin</span>
          </Link>
          <div style={{ display: 'flex', gap: 4 }}>
            <Link
              href="/admin/blogs"
              style={{
                fontSize: 14, textDecoration: 'none', fontWeight: isBlogsActive ? 500 : 400,
                padding: '8px 14px', borderRadius: 6,
                background: isBlogsActive ? '#f0f0f0' : 'transparent',
                color: isBlogsActive ? '#242424' : '#757575',
              }}
            >
              จัดการบทความ
            </Link>
            <Link
              href="/admin/comments"
              style={{
                fontSize: 14, textDecoration: 'none', fontWeight: isCommentsActive ? 500 : 400,
                padding: '8px 14px', borderRadius: 6,
                background: isCommentsActive ? '#f0f0f0' : 'transparent',
                color: isCommentsActive ? '#242424' : '#757575',
              }}
            >
              จัดการ Comment
            </Link>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" target="_blank" style={{ fontSize: 13, color: '#757575', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            ดูเว็บ Blog
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            style={{ fontSize: 13, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  )
}
