'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Blog = {
  id: string
  title: string
  slug: string
  isPublished: boolean
  createdAt: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BlogTable({ initialBlogs }: { initialBlogs: Blog[] }) {
  const [blogs, setBlogs] = useState(initialBlogs)
  const router = useRouter()

  async function togglePublish(id: string) {
    const res = await fetch(`/api/blogs/${id}/publish`, { method: 'PATCH' })
    if (!res.ok) return
    const updated = await res.json()
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, isPublished: updated.isPublished } : b))
  }

  async function deleteBlog(id: string) {
    if (!confirm('ยืนยันการลบบทความนี้?')) return
    const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' })
    if (!res.ok) return
    setBlogs(prev => prev.filter(b => b.id !== id))
    router.refresh()
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 10, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 120px 130px 180px', gap: 16, padding: '14px 24px', background: '#fafafa', borderBottom: '1px solid #eaeaea', fontSize: 12, fontWeight: 600, color: '#757575', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        <span>ชื่อบทความ</span>
        <span>URL Slug</span>
        <span>สถานะ</span>
        <span>วันที่โพสต์</span>
        <span style={{ textAlign: 'right' }}>Actions</span>
      </div>

      {blogs.map(blog => (
        <div
          key={blog.id}
          style={{ display: 'grid', gridTemplateColumns: '1fr 200px 120px 130px 180px', gap: 16, padding: '16px 24px', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}
        >
          <p style={{ fontSize: 14, fontWeight: 500, color: '#242424' }}>{blog.title}</p>
          <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' }}>{blog.slug}</span>
          <div>
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              background: blog.isPublished ? '#f0fdf4' : '#f5f5f5',
              color: blog.isPublished ? '#166534' : '#757575',
              border: `1px solid ${blog.isPublished ? '#bbf7d0' : '#e5e5e5'}`,
            }}>
              {blog.isPublished ? 'Published' : 'Unpublished'}
            </span>
          </div>
          <span style={{ fontSize: 13, color: '#757575' }}>{formatDate(blog.createdAt)}</span>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Link
              href={`/admin/blogs/${blog.id}/edit`}
              style={{ padding: '6px 12px', border: '1px solid #e5e5e5', borderRadius: 6, fontSize: 12, fontWeight: 500, color: '#242424', textDecoration: 'none' }}
            >
              แก้ไข
            </Link>
            <button
              onClick={() => togglePublish(blog.id)}
              style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                border: blog.isPublished ? '1px solid #e5e5e5' : '1px solid #bbf7d0',
                background: blog.isPublished ? '#fff' : '#f0fdf4',
                color: blog.isPublished ? '#757575' : '#166534',
              }}
            >
              {blog.isPublished ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={() => deleteBlog(blog.id)}
              style={{ padding: '6px 12px', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, fontWeight: 500, color: '#ef4444', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ลบ
            </button>
          </div>
        </div>
      ))}

      {blogs.length === 0 && (
        <div style={{ padding: '60px 32px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
          ยังไม่มีบทความ
        </div>
      )}
    </div>
  )
}
