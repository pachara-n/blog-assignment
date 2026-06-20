'use client'

import { useState } from 'react'

const THAI_REGEX = /^[ก-๙0-9\s.,!?]+$/u

export default function CommentForm({ blogId }: { blogId: string }) {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError('')
    if (!name.trim() || !text.trim()) { setError('กรุณากรอกข้อมูลให้ครบถ้วน'); return }
    if (!THAI_REGEX.test(text.trim())) { setError('ข้อความรองรับเฉพาะภาษาไทยและตัวเลขเท่านั้น'); return }

    setLoading(true)
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blogId, authorName: name, content: text }),
    })
    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'เกิดข้อผิดพลาด')
      return
    }

    setName('')
    setText('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 4000)
  }

  return (
    <div style={{ borderTop: '1px solid #eaeaea', paddingTop: 32 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#242424', marginBottom: 20 }}>แสดงความคิดเห็น</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#242424', marginBottom: 6 }}>
            ชื่อผู้ส่ง <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="กรอกชื่อของคุณ"
            style={{
              width: '100%', height: 44, padding: '0 14px',
              border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14,
              fontFamily: 'inherit', color: '#242424', outline: 'none', background: '#fff',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#242424', marginBottom: 6 }}>
            ข้อความ <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="เขียนความคิดเห็นของคุณ..."
            rows={4}
            style={{
              width: '100%', padding: '12px 14px',
              border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14,
              fontFamily: 'inherit', color: '#242424', outline: 'none',
              resize: 'vertical', background: '#fff', lineHeight: 1.7,
            }}
          />
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>รองรับภาษาไทยและตัวเลขเท่านั้น</p>
        </div>

        {error && (
          <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Comment จะแสดงหลังได้รับการอนุมัติจากผู้ดูแล
          </p>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              height: 42, padding: '0 28px', background: loading ? '#555' : '#242424',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 14,
              fontWeight: 500, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
          </button>
        </div>

        {success && (
          <div style={{ padding: '14px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, color: '#166534', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            ส่งความคิดเห็นเรียบร้อยแล้ว รอการอนุมัติจากผู้ดูแล
          </div>
        )}
      </div>
    </div>
  )
}
