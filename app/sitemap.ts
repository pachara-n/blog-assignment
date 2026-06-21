import { prisma } from '@/lib/prisma'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await prisma.blog.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://blog.pachara.app'

  const blogEntries = blogs.map(blog => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...blogEntries,
  ]
}
