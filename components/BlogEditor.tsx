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

function generateSlug() {
  return `blog-${Math.floor(Date.now() / 1000)}`
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
  const [slug, setSlug] = useState(initialSlug || generateSlug())
  const [content, setContent] = useState(initialContent)
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl === 'placeholder' ? '' : initialCoverUrl)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(initialImages)
  // autoSlug: true = slug สร้างจาก title อัตโนมัติ, false = user พิมพ์เอง
  // เริ่มต้นที่ true ในโหมด create แต่จะปิดทันทีที่ user แตะ slug field
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
      router.refresh()
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
    <div className="min-h-screen bg-[#f7f7f8]" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
      <AdminNav />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/admin/blogs" className="text-[#757575] no-underline">จัดการบทความ</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="text-[#242424] font-medium">{isEdit ? 'แก้ไขบทความ' : 'สร้าง Blog ใหม่'}</span>
        </div>

        <div className="flex flex-col lg:grid gap-6 items-start" style={{ gridTemplateColumns: '1fr 360px' }}>
          {/* Main Form */}
          <div className="w-full bg-white border border-[#eaeaea] rounded-[10px] p-6 sm:p-8">
            <h1 className="text-xl font-semibold text-[#242424] mb-7">
              {isEdit ? 'แก้ไขบทความ' : 'สร้าง Blog ใหม่'}
            </h1>
            <div className="flex flex-col gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1.5">
                  ชื่อ Blog <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="กรอกชื่อบทความ"
                  className="w-full h-[46px] px-3.5 border border-[#e5e5e5] rounded-lg text-[15px] font-[inherit] text-[#242424] outline-none bg-white box-border"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1.5">URL Slug</label>
                <div className="flex items-center">
                  <span className="h-[46px] px-3 bg-[#fafafa] border border-[#e5e5e5] border-r-0 rounded-l-lg text-[13px] text-[#9ca3af] flex items-center whitespace-nowrap">
                    blog.pachara.app/blog/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="auto-generated-slug"
                    className="flex-1 min-w-0 h-[46px] px-3.5 border border-[#e5e5e5] rounded-r-lg text-sm font-mono text-[#242424] outline-none bg-white box-border"
                  />
                </div>
                <p className="text-xs text-[#9ca3af] mt-1">Slug จะถูกสร้างอัตโนมัติ หรือพิมพ์เองได้</p>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-[#242424] mb-1.5">
                  เนื้อหา Blog <span className="text-[#ef4444]">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="เขียนเนื้อหาบทความของคุณที่นี่..."
                  rows={16}
                  className="w-full px-3.5 py-4 border border-[#e5e5e5] rounded-lg text-[15px] font-[inherit] text-[#242424] outline-none resize-y bg-white leading-[1.8] box-border"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full flex flex-col gap-5">
            {/* Cover Image */}
            <div className="bg-white border border-[#eaeaea] rounded-[10px] p-6">
              <h3 className="text-[15px] font-semibold text-[#242424] mb-4">รูปปก</h3>
              {coverUrl ? (
                <div className="relative mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverUrl} alt="" className="w-full object-cover rounded-lg" style={{ aspectRatio: '16/10' }} />
                  <button
                    onClick={() => setCoverUrl('')}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full border-none cursor-pointer flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
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
                  className="w-full border-2 border-dashed border-[#e0e0e0] rounded-lg bg-[#fafafa] flex flex-col items-center justify-center gap-2 font-[inherit]"
                  style={{ aspectRatio: '16/10', cursor: savedBlogId.current ? 'pointer' : 'not-allowed', opacity: savedBlogId.current ? 1 : 0.5 }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                  </svg>
                  <span className="text-[13px] text-[#9ca3af]">คลิกเพื่ออัปโหลดรูปปก</span>
                </button>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              {!savedBlogId.current && (
                <p className="text-xs text-[#f59e0b] mt-2">กรุณาบันทึกบทความก่อนอัปโหลดรูป</p>
              )}
            </div>

            {/* Gallery */}
            <div className="bg-white border border-[#eaeaea] rounded-[10px] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-[#242424]">รูปเพิ่มเติม</h3>
                <span className="text-xs text-[#9ca3af]">{galleryImages.length} / 6 รูป</span>
              </div>
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {galleryImages.map(img => (
                    <div key={img.id} className="relative rounded-md overflow-hidden" style={{ aspectRatio: '1' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeGalleryImage(img.id)}
                        className="absolute top-1 right-1 w-[22px] h-[22px] rounded-full border-none cursor-pointer flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.5)' }}
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
                  className="w-full h-10 border border-dashed border-[#e0e0e0] rounded-md bg-transparent flex items-center justify-center gap-1.5 text-[13px] text-[#9ca3af] font-[inherit]"
                  style={{ cursor: savedBlogId.current ? 'pointer' : 'not-allowed', opacity: savedBlogId.current ? 1 : 0.5 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  เพิ่มรูป
                </button>
              )}
              <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryChange} />
            </div>

            {/* Actions */}
            <div className="bg-white border border-[#eaeaea] rounded-[10px] p-6">
              <div className="flex flex-col gap-2.5">
                {error && (
                  <div className="px-3.5 py-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-[#b91c1c] text-[13px]">{error}</div>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-11 border-none rounded-lg text-sm font-medium font-[inherit] text-white"
                  style={{ background: saving ? '#555' : '#242424', cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <Link
                  href="/admin/blogs"
                  className="w-full h-11 border border-[#e5e5e5] rounded-lg text-sm text-[#757575] no-underline flex items-center justify-center"
                >
                  ยกเลิก
                </Link>
              </div>
            </div>

            {saveSuccess && (
              <div className="px-[18px] py-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg text-[#166534] text-[13px] flex items-center gap-2">
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
