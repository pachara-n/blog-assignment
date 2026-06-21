import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#242424]">
      <header className="sticky top-0 z-[100] bg-white/[0.96] backdrop-blur-[10px] border-b border-[#eaeaea]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-[60px] flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-[21px] font-bold text-[#242424] no-underline tracking-[-0.3px]">
            PacharaBlog
          </Link>
          <nav className="flex gap-4 sm:gap-7 items-center">
            <Link href="/" className="text-sm text-[#242424] no-underline font-medium">
              หน้าแรก
            </Link>
            <Link href="/admin/login" className="text-sm text-[#757575] no-underline">
              เข้าสู่ระบบ Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#eaeaea] mt-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 text-center">
          <p className="text-[13px] text-[#9ca3af]">© 2026 PacharaBlog — สงวนลิขสิทธิ์</p>
        </div>
      </footer>
    </div>
  )
}
