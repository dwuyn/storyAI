'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Sidebar } from '@/components/Layout/Sidebar'
import { GENRE_LABELS, CONTENT_TYPE_LABELS } from '@/types'

interface Project {
  id: string
  title: string
  genre: string
  synopsis?: string
  contentType: string
  coverColor: string
  wordCount: number
  updatedAt: string
  _count: { chapters: number; characters: number }
}

const COVER_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#10B981',
  '#F59E0B', '#EF4444', '#06B6D4', '#84CC16'
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '', genre: 'fantasy', synopsis: '', contentType: 'story', coverColor: '#3B82F6'
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    if (status === 'authenticated') fetchProjects()
  }, [status])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch { toast.error('Không thể tải danh sách dự án') }
    finally { setLoading(false) }
  }

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      toast.success('Dự án đã được tạo!')
      setShowNewProject(false)
      setForm({ title: '', genre: 'fantasy', synopsis: '', contentType: 'story', coverColor: '#3B82F6' })
      router.push(`/projects/${data.id}`)
    } catch { toast.error('Lỗi tạo dự án') }
    finally { setCreating(false) }
  }

  const deleteProject = async (id: string, title: string) => {
    if (!confirm(`Xóa dự án "${title}"? Hành động này không thể hoàn tác.`)) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects((prev) => prev.filter((p) => p.id !== id))
    toast.success('Đã xóa dự án')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-sf-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sf-primary/30 border-t-sf-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-sf-bg">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-sf-text">
              Chào, {session?.user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sf-muted mt-1">{projects.length} dự án đang hoạt động</p>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 bg-sf-primary hover:bg-sf-primary-dark text-white px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-105"
          >
            <span className="text-lg">+</span> Dự án mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Tổng dự án', value: projects.length, icon: '📚' },
            { label: 'Tổng chương', value: projects.reduce((s, p) => s + p._count.chapters, 0), icon: '📝' },
            { label: 'Tổng từ viết', value: projects.reduce((s, p) => s + p.wordCount, 0).toLocaleString(), icon: '✍️' },
          ].map((stat) => (
            <div key={stat.label} className="bg-sf-surface border border-sf-border rounded-2xl p-5">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-sf-text">{stat.value}</div>
              <div className="text-sf-muted text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="bg-sf-surface border border-sf-border rounded-2xl overflow-hidden">
                <div className="h-24 shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-5 rounded shimmer" />
                  <div className="h-4 rounded shimmer w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 text-sf-muted">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-sf-subtext mb-2">Chưa có dự án nào</h3>
            <p className="mb-6">Hãy tạo dự án đầu tiên của bạn!</p>
            <button
              onClick={() => setShowNewProject(true)}
              className="bg-sf-primary hover:bg-sf-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Tạo dự án ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div key={project.id} className="bg-sf-surface border border-sf-border rounded-2xl overflow-hidden hover:border-sf-primary/30 transition-all group">
                {/* Color header */}
                <div
                  className="h-20 relative"
                  style={{ backgroundColor: project.coverColor + '33', borderBottom: `3px solid ${project.coverColor}` }}
                >
                  <div className="absolute inset-0 flex items-center px-5">
                    <span className="text-3xl">{CONTENT_TYPE_LABELS[project.contentType]?.split(' ')[0] || '📖'}</span>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => deleteProject(project.id, project.title)}
                      className="w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-lg text-white text-xs flex items-center justify-center"
                      title="Xóa dự án"
                    >✕</button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sf-text group-hover:text-sf-primary transition-colors line-clamp-1 flex-1">
                      {project.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-sf-elevated text-sf-muted px-2 py-0.5 rounded-full">
                      {GENRE_LABELS[project.genre] || project.genre}
                    </span>
                    <span className="text-xs bg-sf-elevated text-sf-muted px-2 py-0.5 rounded-full">
                      {CONTENT_TYPE_LABELS[project.contentType] || project.contentType}
                    </span>
                  </div>

                  {project.synopsis && (
                    <p className="text-sf-muted text-sm line-clamp-2 mb-4">{project.synopsis}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-sf-muted mb-4">
                    <span>📝 {project._count.chapters} chương</span>
                    <span>👥 {project._count.characters} nhân vật</span>
                    <span>✍️ {project.wordCount.toLocaleString()} từ</span>
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="block w-full text-center bg-sf-elevated hover:bg-sf-primary/10 hover:text-sf-primary border border-sf-border hover:border-sf-primary/30 text-sf-subtext py-2 rounded-xl text-sm font-medium transition-all"
                  >
                    Mở dự án →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewProject(false)}>
          <div className="bg-sf-surface border border-sf-border rounded-2xl p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-sf-text">✨ Tạo dự án mới</h2>
              <button onClick={() => setShowNewProject(false)} className="text-sf-muted hover:text-sf-text">✕</button>
            </div>

            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sf-subtext mb-2">Tên tác phẩm *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full bg-sf-bg border border-sf-border rounded-xl px-4 py-3 text-sf-text placeholder-sf-muted focus:outline-none focus:border-sf-primary transition-colors"
                  placeholder="Ví dụ: Vương Quốc Hắc Ám"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sf-subtext mb-2">Thể loại *</label>
                  <select
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    className="w-full bg-sf-bg border border-sf-border rounded-xl px-4 py-3 text-sf-text focus:outline-none focus:border-sf-primary transition-colors"
                  >
                    {Object.entries(GENRE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sf-subtext mb-2">Loại nội dung</label>
                  <select
                    value={form.contentType}
                    onChange={(e) => setForm({ ...form, contentType: e.target.value })}
                    className="w-full bg-sf-bg border border-sf-border rounded-xl px-4 py-3 text-sf-text focus:outline-none focus:border-sf-primary transition-colors"
                  >
                    {Object.entries(CONTENT_TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sf-subtext mb-2">Tóm tắt cốt truyện</label>
                <textarea
                  value={form.synopsis}
                  onChange={(e) => setForm({ ...form, synopsis: e.target.value })}
                  rows={3}
                  className="w-full bg-sf-bg border border-sf-border rounded-xl px-4 py-3 text-sf-text placeholder-sf-muted focus:outline-none focus:border-sf-primary transition-colors resize-none"
                  placeholder="Mô tả ngắn về câu chuyện (AI sẽ dùng thông tin này để giữ ngữ cảnh)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sf-subtext mb-2">Màu bìa</label>
                <div className="flex gap-2 flex-wrap">
                  {COVER_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, coverColor: color })}
                      className={`w-8 h-8 rounded-full transition-transform ${form.coverColor === color ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewProject(false)} className="flex-1 border border-sf-border text-sf-muted hover:text-sf-text py-3 rounded-xl transition-colors">
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-sf-primary hover:bg-sf-primary-dark disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  {creating ? 'Đang tạo...' : 'Tạo dự án'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
