'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import Link from 'next/link'

type GalleryImage = { id: string; url: string }

type Props = {
  mode: 'create' | 'edit'
  blogId?: string
  initialTitle?: string
  initialSlug?: string
  initialContent?: string
  initialCoverUrl?: string
  initialImages?: GalleryImage[]
}

function slugify(title: string) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function BlogEditor({
  mode,
  blogId,
  initialTitle = '',
  initialSlug = '',
  initialContent = '',
  initialCoverUrl = '',
  initialImages = [],
}: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [slug, setSlug] = useState(initialSlug)
  const [content, setContent] = useState(initialContent)
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(initialImages)
  // autoSlug: true = slug สร้างจาก title อัตโนมัติ, false = user พิมพ์เอง
  // เริ่มต้นที่ true ในโหมด create แต่จะปิดทันทีที่ user แตะ slug field
  const [autoSlug, setAutoSlug] = useState(mode === 'create')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  // useRef แทน useState เพราะไม่ต้องการให้ component re-render เมื่อ blogId เปลี่ยน
  // ใช้เก็บ id ของ blog ที่เพิ่ง create ได้ เพื่อให้ upload รูปได้ทันทีหลัง save
  const savedBlogId = useRef<string | undefined>(blogId)

  function handleTitleChange(val: string) {
    setTitle(val)
    if (autoSlug) setSlug(slugify(val))
  }

  async function uploadImage(file: File, type: 'cover' | 'gallery') {
    const id = savedBlogId.current
    if (!id) return null
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', type)
    const res = await fetch(`/api/blogs/${id}/images`, { method: 'POST', body: fd })
    if (!res.ok) return null
    return await res.json()
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!savedBlogId.current) { setError('กรุณาบันทึกบทความก่อนอัปโหลดรูป'); return }
    const result = await uploadImage(file, 'cover')
    if (result?.url) setCoverUrl(result.url)
  }

  async function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!savedBlogId.current) { setError('กรุณาบันทึกบทความก่อนอัปโหลดรูป'); return }
    if (galleryImages.length >= 6) { setError('อัปโหลดได้สูงสุด 6 รูป'); return }
    const result = await uploadImage(file, 'gallery')
    if (result?.id) setGalleryImages(prev => [...prev, { id: result.id, url: result.url }])
  }

  async function removeGalleryImage(imageId: string) {
    if (!savedBlogId.current) return
    await fetch(`/api/blogs/${savedBlogId.current}/images`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
    })
    setGalleryImages(prev => prev.filter(img => img.id !== imageId))
  }

  async function handleSave() {
    setError('')
    if (!title.trim() || !content.trim()) { setError('กรุณากรอกชื่อและเนื้อหาบทความ'); return }

    // coverImageUrl ต้องไม่ empty string เพราะ API validate required
    // ใส่ 'placeholder' ชั่วคราวถ้ายังไม่ได้อัปโหลดรูป — admin จะมาเพิ่มทีหลังได้
    const body = { title, slug, content, coverImageUrl: coverUrl || 'placeholder' }
    setSaving(true)

    if (mode === 'create') {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'เกิดข้อผิดพลาด')
        setSaving(false)
        return
      }
      const created = await res.json()
      savedBlogId.current = created.id
      setSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      router.push(`/admin/blogs/${created.id}/edit`)
    } else {
      const res = await fetch(`/api/blogs/${savedBlogId.current}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'เกิดข้อผิดพลาด')
        setSaving(false)
        return
      }
      setSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const isEdit = mode === 'edit'

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f8', fontFamily: "'Noto Sans Thai', sans-serif" }}>
      <AdminNav />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 32 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 14 }}>
          <Link href="/admin/blogs" style={{ color: '#757575', textDecoration: 'none' }}>จัดการบทความ</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span style={{ color: '#242424', fontWeight: 500 }}>{isEdit ? 'แก้ไขบทความ' : 'สร้าง Blog ใหม่'}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* Main Form */}
          <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 10, padding: 32 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#242424', marginBottom: 28 }}>
              {isEdit ? 'แก้ไขบทความ' : 'สร้าง Blog ใหม่'}
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#242424', marginBottom: 6 }}>
                  ชื่อ Blog <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="กรอกชื่อบทความ"
                  style={{ width: '100%', height: 46, padding: '0 14px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 15, fontFamily: 'inherit', color: '#242424', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              {/* Slug */}
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#242424', marginBottom: 6 }}>URL Slug</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ height: 46, padding: '0 12px', background: '#fafafa', border: '1px solid #e5e5e5', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: 13, color: '#9ca3af', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                    pacharablog.com/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => { setSlug(e.target.value); setAutoSlug(false) }}
                    placeholder="auto-generated-slug"
                    style={{ flex: 1, height: 46, padding: '0 14px', border: '1px solid #e5e5e5', borderRadius: '0 8px 8px 0', fontSize: 14, fontFamily: 'monospace', color: '#242424', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Slug จะถูกสร้างอัตโนมัติจากชื่อ Blog หรือพิมพ์เองได้</p>
              </div>

              {/* Content */}
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#242424', marginBottom: 6 }}>
                  เนื้อหา Blog <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ border: '1px solid #e5e5e5', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: 2, padding: '8px 10px', background: '#fafafa', borderBottom: '1px solid #e5e5e5', flexWrap: 'wrap' }}>
                    {['B', 'I', 'U'].map(t => (
                      <button key={t} style={{ width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: t === 'B' ? 700 : 400, fontStyle: t === 'I' ? 'italic' : 'normal', textDecoration: t === 'U' ? 'underline' : 'none', color: '#555', fontFamily: 'inherit' }}>
                        {t}
                      </button>
                    ))}
                    <div style={{ width: 1, height: 24, background: '#e0e0e0', margin: '4px 6px' }} />
                    {['H1', 'H2'].map(t => (
                      <button key={t} style={{ width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 4, cursor: 'pointer', fontSize: t === 'H2' ? 13 : 14, fontWeight: 700, color: '#555', fontFamily: 'inherit' }}>{t}</button>
                    ))}
                  </div>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="เขียนเนื้อหาบทความของคุณที่นี่..."
                    rows={16}
                    style={{ width: '100%', padding: '16px 14px', border: 'none', fontSize: 15, fontFamily: 'inherit', color: '#242424', outline: 'none', resize: 'vertical', background: '#fff', lineHeight: 1.8, boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Cover Image */}
            <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 10, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#242424', marginBottom: 16 }}>รูปปก</h3>
              {coverUrl ? (
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverUrl} alt="" style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', borderRadius: 8 }} />
                  <button
                    onClick={() => setCoverUrl('')}
                    style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => savedBlogId.current && coverInputRef.current?.click()}
                  disabled={!savedBlogId.current}
                  style={{ width: '100%', aspectRatio: '16/10', border: '2px dashed #e0e0e0', borderRadius: 8, background: '#fafafa', cursor: savedBlogId.current ? 'pointer' : 'not-allowed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', opacity: savedBlogId.current ? 1 : 0.5 }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                  </svg>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>คลิกเพื่ออัปโหลดรูปปก</span>
                </button>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
              {!savedBlogId.current && (
                <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>กรุณาบันทึกบทความก่อนอัปโหลดรูป</p>
              )}
            </div>

            {/* Gallery */}
            <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 10, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#242424' }}>รูปเพิ่มเติม</h3>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{galleryImages.length} / 6 รูป</span>
              </div>
              {galleryImages.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                  {galleryImages.map(img => (
                    <div key={img.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 6, overflow: 'hidden' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={() => removeGalleryImage(img.id)}
                        style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {galleryImages.length < 6 && (
                <button
                  onClick={() => savedBlogId.current && galleryInputRef.current?.click()}
                  disabled={!savedBlogId.current}
                  style={{ width: '100%', height: 40, border: '1px dashed #e0e0e0', borderRadius: 6, background: 'transparent', cursor: savedBlogId.current ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: '#9ca3af', fontFamily: 'inherit', opacity: savedBlogId.current ? 1 : 0.5 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  เพิ่มรูป
                </button>
              )}
              <input ref={galleryInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGalleryChange} />
            </div>

            {/* Actions */}
            <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 10, padding: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {error && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 13 }}>{error}</div>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{ width: '100%', height: 44, background: saving ? '#555' : '#242424', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, fontFamily: 'inherit', cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <Link
                  href="/admin/blogs"
                  style={{ width: '100%', height: 44, border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, color: '#757575', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ยกเลิก
                </Link>
              </div>
            </div>

            {saveSuccess && (
              <div style={{ padding: '14px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, color: '#166534', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                บันทึกเรียบร้อยแล้ว
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
