import { prisma } from '@/lib/prisma'
import Link from 'next/link'

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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px' }}>
      {/* Title & Search */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, gap: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#242424', marginBottom: 6 }}>บทความทั้งหมด</h1>
          <p style={{ fontSize: 15, color: '#757575' }}>เทคโนโลยี การเขียนโปรแกรม และเทรนด์ดิจิทัลล่าสุด</p>
        </div>
        <form method="GET">
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <input
              name="q"
              type="text"
              defaultValue={q}
              placeholder="ค้นหาบทความ..."
              style={{
                width: 320, height: 44, padding: '0 16px 0 42px',
                border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14,
                fontFamily: 'inherit', color: '#242424', outline: 'none', background: '#fafafa',
              }}
            />
          </div>
        </form>
      </div>

      {/* Result info */}
      {total > 0 && (
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>
            แสดง {start + 1}–{Math.min(start + perPage, total)} จาก {total} บทความ
          </span>
        </div>
      )}

      {/* No results */}
      {blogs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d5d5d5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <p style={{ fontSize: 17, color: '#757575', marginBottom: 8 }}>ไม่พบบทความที่ค้นหา</p>
          <p style={{ fontSize: 14, color: '#9ca3af' }}>ลองค้นหาด้วยคำอื่นดู</p>
        </div>
      )}

      {/* Blog Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {blogs.map((blog, i) => {
          const gradient = GRADIENTS[i % GRADIENTS.length]
          const excerpt = blog.content.replace(/<[^>]*>/g, '').slice(0, 120) + '...'
          return (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              style={{
                display: 'block', borderRadius: 10, overflow: 'hidden',
                border: '1px solid #eaeaea', textDecoration: 'none',
                background: '#fff', transition: 'all 0.2s ease',
              }}
            >
              {/* Thumbnail */}
              <div style={{ width: '100%', aspectRatio: '16/10', position: 'relative', background: blog.coverImageUrl ? undefined : gradient, overflow: 'hidden' }}>
                {blog.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={blog.coverImageUrl} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>
              {/* Card Content */}
              <div style={{ padding: 20 }}>
                <h3 style={{
                  fontSize: 16, fontWeight: 600, color: '#242424', marginBottom: 10,
                  lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {blog.title}
                </h3>
                <p style={{
                  fontSize: 14, color: '#757575', lineHeight: 1.7, marginBottom: 16,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {excerpt}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>{formatDate(blog.createdAt)}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 48 }}>
          {page > 1 && (
            <a href={`?q=${q}&page=${page - 1}`} style={{
              height: 38, padding: '0 18px', border: '1px solid #e5e5e5', borderRadius: 8,
              background: '#fff', color: '#242424', fontSize: 14, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center',
            }}>← ก่อนหน้า</a>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <a key={p} href={`?q=${q}&page=${p}`} style={{
              minWidth: 38, height: 38, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: p === page ? '#242424' : '#fff',
              color: p === page ? '#fff' : '#242424',
              borderRadius: 8, fontSize: 14, fontWeight: p === page ? 500 : 400,
              border: p === page ? 'none' : '1px solid #e5e5e5',
              textDecoration: 'none',
            }}>{p}</a>
          ))}
          {page < totalPages && (
            <a href={`?q=${q}&page=${page + 1}`} style={{
              height: 38, padding: '0 18px', border: '1px solid #e5e5e5', borderRadius: 8,
              background: '#fff', color: '#242424', fontSize: 14, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center',
            }}>ถัดไป →</a>
          )}
        </div>
      )}
    </div>
  )
}
