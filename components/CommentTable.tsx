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
      <div className="flex gap-1.5 mb-5 bg-white border border-[#eaeaea] rounded-[10px] p-1.5 w-fit flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3.5 py-1.5 border-none rounded-md text-[13px] cursor-pointer font-[inherit] ${tab === activeFilter ? 'bg-[#242424] text-white font-medium' : 'bg-transparent text-[#757575] font-normal'}`}
          >
            {TAB_LABELS[tab]} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#eaeaea] rounded-[10px] overflow-hidden">
        <div className="overflow-x-auto">
          {/* Header */}
          <div className="grid gap-3 px-6 py-3.5 bg-[#fafafa] border-b border-[#eaeaea] text-xs font-semibold text-[#757575] uppercase tracking-[0.5px]" style={{ gridTemplateColumns: '140px 1fr 180px 150px 100px 160px', minWidth: 860 }}>
            <span>ชื่อผู้ส่ง</span>
            <span>ข้อความ</span>
            <span>บทความ</span>
            <span>วันเวลา</span>
            <span>สถานะ</span>
            <span className="text-right">Actions</span>
          </div>

          {filtered.map(comment => {
            const cfg = STATUS_CONFIG[comment.status]
            return (
              <div key={comment.id} className="grid gap-3 px-6 py-4 border-b border-[#f5f5f5] items-center" style={{ gridTemplateColumns: '140px 1fr 180px 150px 100px 160px', minWidth: 860 }}>
                {/* Name */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#e5e5e5] flex items-center justify-center shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-medium text-[#242424]">{comment.authorName}</span>
                </div>
                {/* Message */}
                <p className="text-[13px] text-[#555] leading-[1.5] line-clamp-2">
                  {comment.content}
                </p>
                {/* Blog */}
                <span className="text-xs text-[#757575] line-clamp-1">
                  {comment.blogTitle}
                </span>
                {/* Date */}
                <span className="text-xs text-[#9ca3af]">{formatDateTime(comment.createdAt)}</span>
                {/* Badge */}
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                    {cfg.text}
                  </span>
                </div>
                {/* Actions */}
                <div className="flex gap-1.5 justify-end">
                  {comment.status !== 'APPROVED' && (
                    <button
                      onClick={() => updateStatus(comment.id, 'APPROVED')}
                      className="px-2.5 py-1 border border-[#bbf7d0] rounded-md text-xs font-medium text-[#166534] bg-[#f0fdf4] cursor-pointer font-[inherit]"
                    >
                      Approve
                    </button>
                  )}
                  {comment.status !== 'REJECTED' && (
                    <button
                      onClick={() => updateStatus(comment.id, 'REJECTED')}
                      className="px-2.5 py-1 border border-[#fecaca] rounded-md text-xs font-medium text-[#ef4444] bg-white cursor-pointer font-[inherit]"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="px-8 py-[60px] text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d5d5d5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-[15px] text-[#757575]">ไม่มี Comment ในหมวดนี้</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
