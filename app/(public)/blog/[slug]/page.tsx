import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CommentForm from '@/components/CommentForm'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await prisma.blog.findUnique({
    where: { slug: params.slug },
    select: { title: true, content: true, coverImageUrl: true, isPublished: true },
  })

  if (!blog || !blog.isPublished) return {}

  const description = blog.content.replace(/<[^>]*>/g, '').slice(0, 160)

  return {
    title: blog.title,
    description,
    openGraph: {
      title: blog.title,
      description,
      images: blog.coverImageUrl && blog.coverImageUrl !== 'placeholder'
        ? [{ url: blog.coverImageUrl }]
        : [],
    },
  }
}

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
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 pt-6 sm:pt-8">
        <div className="w-full rounded-xl overflow-hidden bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] flex items-center justify-center relative" style={{ aspectRatio: '21/9' }}>
          {blog.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={blog.coverImageUrl} alt={blog.title} className="w-full h-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 80px)' }} />
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
              </svg>
            </>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-[760px] mx-auto px-4 sm:px-8 py-8 sm:py-10">
        {/* Meta */}
        <div className="flex items-center gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-sm text-[#757575]">{formatDate(blog.createdAt)}</span>
          </div>
          <div className="w-px h-3.5 bg-[#e5e5e5]" />
          <div className="flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-sm text-[#757575]">เข้าชม {blog.viewCount.toLocaleString()} ครั้ง</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-[34px] font-bold text-[#242424] leading-[1.5] mb-8 tracking-[-0.3px]">
          {blog.title}
        </h1>

        {/* Article Body */}
        <div
          className="text-base sm:text-[17px] leading-[2] text-[#333]"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>

      {/* Gallery */}
      {blog.images.length > 0 && (
        <div className="max-w-[760px] mx-auto px-4 sm:px-8 pb-12">
          <h2 className="text-xl font-semibold text-[#242424] mb-5">รูปภาพประกอบ</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {blog.images.map(img => (
              <div key={img.id} className="rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="max-w-[760px] mx-auto px-4 sm:px-8">
        <div className="border-t border-[#eaeaea]" />
      </div>

      {/* Comments */}
      <div className="max-w-[760px] mx-auto px-4 sm:px-8 py-12">
        <h2 className="text-xl sm:text-[22px] font-semibold text-[#242424] mb-7">
          ความคิดเห็น <span className="text-base font-normal text-[#9ca3af]">({blog.comments.length})</span>
        </h2>

        {blog.comments.length > 0 && (
          <div className="flex flex-col gap-6 mb-10">
            {blog.comments.map(comment => (
              <div key={comment.id} className="px-5 sm:px-6 py-5 bg-[#fafafa] rounded-[10px] border border-[#f0f0f0]">
                <div className="flex items-center justify-between mb-2.5 gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#e5e5e5] flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-[#242424]">{comment.authorName}</span>
                  </div>
                  <span className="text-xs text-[#9ca3af]">{formatDateTime(comment.createdAt)}</span>
                </div>
                <p className="text-[15px] text-[#555] leading-[1.7] pl-[42px]">{comment.content}</p>
              </div>
            ))}
          </div>
        )}

        <CommentForm blogId={blog.id} />
      </div>
    </div>
  )
}
