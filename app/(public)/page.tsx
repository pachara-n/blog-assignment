import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const GRADIENTS = [
  'linear-gradient(135deg, #4f46e5, #7c3aed)',
  'linear-gradient(135deg, #059669, #047857)',
  'linear-gradient(135deg, #0891b2, #0e7490)',
  'linear-gradient(135deg, #6366f1, #818cf8)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #2563eb, #1d4ed8)',
  'linear-gradient(135deg, #2563eb, #3b82f6)',
  'linear-gradient(135deg, #64748b, #475569)',
  'linear-gradient(135deg, #ea580c, #c2410c)',
  'linear-gradient(135deg, #16a34a, #15803d)',
]

function formatDate(date: Date) {
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const q = searchParams.q ?? ''
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const perPage = 10

  const where = {
    isPublished: true,
    ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
  }

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: perPage,
      skip: (page - 1) * perPage,
      select: { id: true, title: true, slug: true, coverImageUrl: true, createdAt: true, content: true },
    }),
    prisma.blog.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage) || 1
  const start = (page - 1) * perPage

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Title & Search */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-9">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#242424] mb-1.5">บทความทั้งหมด</h1>
          <p className="text-[15px] text-[#757575]">เทคโนโลยี การเขียนโปรแกรม และเทรนด์ดิจิทัลล่าสุด</p>
        </div>
        <form method="GET" className="w-full sm:w-auto">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              name="q"
              type="text"
              defaultValue={q}
              placeholder="ค้นหาบทความ..."
              className="w-full sm:w-80 h-11 pl-10 pr-4 border border-[#e5e5e5] rounded-lg text-sm font-[inherit] text-[#242424] outline-none bg-[#fafafa]"
            />
          </div>
        </form>
      </div>

      {/* Result info */}
      {total > 0 && (
        <div className="mb-5">
          <span className="text-[13px] text-[#9ca3af]">
            แสดง {start + 1}–{Math.min(start + perPage, total)} จาก {total} บทความ
          </span>
        </div>
      )}

      {/* No results */}
      {blogs.length === 0 && (
        <div className="text-center py-20">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d5d5d5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <p className="text-[17px] text-[#757575] mb-2">ไม่พบบทความที่ค้นหา</p>
          <p className="text-sm text-[#9ca3af]">ลองค้นหาด้วยคำอื่นดู</p>
        </div>
      )}

      {/* Blog Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog, i) => {
          const gradient = GRADIENTS[i % GRADIENTS.length]
          const excerpt = blog.content.replace(/<[^>]*>/g, '').slice(0, 120) + '...'
          return (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="block rounded-[10px] overflow-hidden border border-[#eaeaea] no-underline bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Thumbnail */}
              <div className="w-full overflow-hidden" style={{ aspectRatio: '16/10', background: blog.coverImageUrl ? undefined : gradient }}>
                {blog.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={blog.coverImageUrl} alt={blog.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: gradient }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Card Content */}
              <div className="p-5">
                <h3 className="text-base font-semibold text-[#242424] mb-2.5 leading-relaxed line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-sm text-[#757575] leading-[1.7] mb-4 line-clamp-2">
                  {excerpt}
                </p>
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="text-[13px] text-[#9ca3af]">{formatDate(blog.createdAt)}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
          {page > 1 && (
            <a href={`?q=${q}&page=${page - 1}`} className="h-[38px] px-[18px] border border-[#e5e5e5] rounded-lg bg-white text-[#242424] text-sm no-underline inline-flex items-center">
              ← ก่อนหน้า
            </a>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <a key={p} href={`?q=${q}&page=${p}`} className={`min-w-[38px] h-[38px] inline-flex items-center justify-center rounded-lg text-sm no-underline ${p === page ? 'bg-[#242424] text-white font-medium border-0' : 'bg-white text-[#242424] border border-[#e5e5e5]'}`}>
              {p}
            </a>
          ))}
          {page < totalPages && (
            <a href={`?q=${q}&page=${page + 1}`} className="h-[38px] px-[18px] border border-[#e5e5e5] rounded-lg bg-white text-[#242424] text-sm no-underline inline-flex items-center">
              ถัดไป →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
