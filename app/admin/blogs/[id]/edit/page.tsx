import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BlogEditor from '@/components/BlogEditor'

export const dynamic = 'force-dynamic'

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const blog = await prisma.blog.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: 'asc' } } },
  })
  if (!blog) notFound()

  return (
    <BlogEditor
      mode="edit"
      blogId={blog.id}
      initialTitle={blog.title}
      initialSlug={blog.slug}
      initialContent={blog.content}
      initialCoverUrl={blog.coverImageUrl}
      initialImages={blog.images.map(img => ({ id: img.id, url: img.url }))}
    />
  )
}
