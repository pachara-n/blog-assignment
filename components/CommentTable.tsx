'use client'

import { useState } from 'react'

type Comment = {
  id: string
  authorName: string
  content: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  blogTitle: string
}

type FilterTab = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED'

const STATUS_CONFIG = {
  PENDING: { text: 'Pending', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  APPROVED: { text: 'Approved', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  REJECTED: { text: 'Rejected', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
}

const TAB_LABELS: Record<FilterTab, string> = {
  all: 'ทั้งหมด',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function CommentTable({ initialComments }: { initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  async function updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) return
    setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  const tabs: FilterTab[] = ['all', 'PENDING', 'APPROVED', 'REJECTED']
  const counts: Record<FilterTab, number> = {
    all: comments.length,
    PENDING: comments.filter(c => c.status === 'PENDING').length,
    APPROVED: comments.filter(c => c.status === 'APPROVED').length,
    REJECTED: comments.filter(c => c.status === 'REJECTED').length,
  }

  const filtered = activeFilter === 'all' ? comments : comments.filter(c => c.status === activeFilter)

  return (
    <div>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: '#fff', border: '1px solid #eaeaea', borderRadius: 10, padding: 6, width: 'fit-content' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            style={{
              padding: '6px 14px', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              background: tab === activeFilter ? '#242424' : 'transparent',
              color: tab === activeFilter ? '#fff' : '#757575',
              fontWeight: tab === activeFilter ? 500 : 400,
            }}
          >
            {TAB_LABELS[tab]} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 10, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 180px 150px 100px 160px', gap: 12, padding: '14px 24px', background: '#fafafa', borderBottom: '1px solid #eaeaea', fontSize: 12, fontWeight: 600, color: '#757575', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <span>ชื่อผู้ส่ง</span>
          <span>ข้อความ</span>
          <span>บทความ</span>
          <span>วันเวลา</span>
          <span>สถานะ</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {filtered.map(comment => {
          const cfg = STATUS_CONFIG[comment.status]
          return (
            <div key={comment.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 180px 150px 100px 160px', gap: 12, padding: '16px 24px', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#242424' }}>{comment.authorName}</span>
              </div>
              {/* Message */}
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {comment.content}
              </p>
              {/* Blog */}
              <span style={{ fontSize: 12, color: '#757575', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {comment.blogTitle}
              </span>
              {/* Date */}
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{formatDateTime(comment.createdAt)}</span>
              {/* Badge */}
              <div>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  {cfg.text}
                </span>
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                {comment.status !== 'APPROVED' && (
                  <button
                    onClick={() => updateStatus(comment.id, 'APPROVED')}
                    style={{ padding: '5px 10px', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 12, fontWeight: 500, color: '#166534', background: '#f0fdf4', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Approve
                  </button>
                )}
                {comment.status !== 'REJECTED' && (
                  <button
                    onClick={() => updateStatus(comment.id, 'REJECTED')}
                    style={{ padding: '5px 10px', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, fontWeight: 500, color: '#ef4444', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div style={{ padding: '60px 32px', textAlign: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d5d5d5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p style={{ fontSize: 15, color: '#757575' }}>ไม่มี Comment ในหมวดนี้</p>
          </div>
        )}
      </div>
    </div>
  )
}
