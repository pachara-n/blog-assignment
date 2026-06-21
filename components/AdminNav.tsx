'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function AdminNav() {
  const pathname = usePathname()
  const isBlogsActive = pathname.startsWith('/admin/blogs')
  const isCommentsActive = pathname.startsWith('/admin/comments')

  return (
    <div className="bg-white border-b border-[#eaeaea]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        {/* แถวบน: logo + right actions */}
        <div className="h-14 flex items-center justify-between">
          <Link href="/admin/blogs" className="text-lg font-bold text-[#242424] no-underline tracking-[-0.3px]">
            PacharaBlog <span className="font-normal text-[13px] text-[#9ca3af] ml-1">Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-[13px] text-[#757575] no-underline flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span className="hidden sm:inline">ดูเว็บ Blog</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="text-[13px] text-[#ef4444] bg-transparent border-none cursor-pointer font-[inherit]"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
        {/* แถวล่าง: nav tabs */}
        <div className="flex gap-1 pb-0 -mb-px">
          <Link
            href="/admin/blogs"
            className={`text-sm no-underline px-3.5 py-2.5 border-b-2 transition-colors ${isBlogsActive ? 'font-medium border-[#242424] text-[#242424]' : 'font-normal border-transparent text-[#757575]'}`}
          >
            จัดการบทความ
          </Link>
          <Link
            href="/admin/comments"
            className={`text-sm no-underline px-3.5 py-2.5 border-b-2 transition-colors ${isCommentsActive ? 'font-medium border-[#242424] text-[#242424]' : 'font-normal border-transparent text-[#757575]'}`}
          >
            จัดการ Comment
          </Link>
        </div>
      </div>
    </div>
  )
}
