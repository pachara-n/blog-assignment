import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CommentForm from '@/components/CommentForm'

function formatDate(date: Date) {
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateTime(date: Date) {
  return date.toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await prisma.blog.findUnique({
    where: { slug: params.slug },
    include: {
      images: { orderBy: { order: 'asc' } },
      comments: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  // ซ่อน unpublished blog จาก public — return 404 แทน 403
  // เพื่อไม่ให้ผู้ใช้รู้ว่า slug นั้นมีอยู่จริงหรือเปล่า
  if (!blog || !blog.isPublished) notFound()

  // increment แบบ atomic ใน DB โดยตรงแทนการ read → +1 → write
  // ถ้าทำแบบ read+write สองคนเปิดพร้อมกันจะนับแค่ครั้งเดียว (race condition)
  await prisma.blog.update({
    where: { id: blog.id },
    data: { viewCount: { increment: 1 } },
  })

  return (
    <div>
      {/* Hero Image */}
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '32px 32px 0' }}>
        <div style={{
          width: '100%', aspectRatio: '21/9', borderRadius: 12, overflow: 'hidden',
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          {blog.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={blog.coverImageUrl} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <>
              <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 80px)' }} />
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
              </svg>
            </>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 32px' }}>
        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style={{ fontSize: 14, color: '#757575' }}>{formatDate(blog.createdAt)}</span>
          </div>
          <div style={{ width: 1, height: 14, background: '#e5e5e5' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            <span style={{ fontSize: 14, color: '#757575' }}>เข้าชม {blog.viewCount.toLocaleString()} ครั้ง</span>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 34, fontWeight: 700, color: '#242424', lineHeight: 1.5, marginBottom: 32, letterSpacing: '-0.3px' }}>
          {blog.title}
        </h1>

        {/* Article Body */}
        <div
          style={{ fontSize: 17, lineHeight: 2, color: '#333' }}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>

      {/* Gallery */}
      {blog.images.length > 0 && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 48px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#242424', marginBottom: 20 }}>รูปภาพประกอบ</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {blog.images.map(img => (
                <div key={img.id} style={{ aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ borderTop: '1px solid #eaeaea' }} />
      </div>

      {/* Comments */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 32px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: '#242424', marginBottom: 28 }}>
          ความคิดเห็น <span style={{ fontSize: 16, fontWeight: 400, color: '#9ca3af' }}>({blog.comments.length})</span>
        </h2>

        {blog.comments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 40 }}>
            {blog.comments.map(comment => (
              <div key={comment.id} style={{ padding: '20px 24px', background: '#fafafa', borderRadius: 10, border: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#242424' }}>{comment.authorName}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{formatDateTime(comment.createdAt)}</span>
                </div>
                <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, paddingLeft: 42 }}>{comment.content}</p>
              </div>
            ))}
          </div>
        )}

        <CommentForm blogId={blog.id} />
      </div>
    </div>
  )
}
