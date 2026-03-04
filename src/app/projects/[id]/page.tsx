'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Sidebar } from '@/components/Layout/Sidebar'
import { GENRE_LABELS, CONTENT_TYPE_LABELS } from '@/types'

interface Character {
  id: string; name: string; age?: number; gender?: string
  appearance?: string; personality?: string; backstory?: string; imagePrompt?: string
}

interface Chapter {
  id: string; number: number; title: string
  content?: string; summary?: string; wordCount: number; updatedAt: string
}

interface Project {
  id: string; title: string; genre: string; synopsis?: string
  contentType: string; coverColor: string; wordCount: number
  characters: Character[]; chapters: Chapter[]
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'chapters' | 'characters'>('chapters')
  const [showNewChapter, setShowNewChapter] = useState(false)
  const [showNewChar, setShowNewChar] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [newChar, setNewChar] = useState({ name: '', age: '', gender: '', appearance: '', personality: '', backstory: '', imagePrompt: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchProject() }, [id])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`)
      if (!res.ok) { router.push('/dashboard'); return }
      setProject(await res.json())
    } catch { toast.error('Không thể tải dự án') }
    finally { setLoading(false) }
  }

  const createChapter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChapterTitle.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, title: newChapterTitle }),
      })
      const chapter = await res.json()
      toast.success('Đã tạo chương mới!')
      setShowNewChapter(false)
      setNewChapterTitle('')
      router.push(`/projects/${id}/chapters/${chapter.id}`)
    } catch { toast.error('Lỗi tạo chương') }
    finally { setCreating(false) }
  }

  const createCharacter = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, ...newChar }),
      })
      if (!res.ok) { toast.error('Lỗi tạo nhân vật'); return }
      toast.success('Đã thêm nhân vật!')
      setShowNewChar(false)
      setNewChar({ name: '', age: '', gender: '', appearance: '', personality: '', backstory: '', imagePrompt: '' })
      fetchProject()
    } catch { toast.error('Lỗi kết nối') }
    finally { setCreating(false) }
  }

  const deleteChapter = async (chapterId: string) => {
    if (!confirm('Xóa chương này?')) return
    await fetch(`/api/chapters?id=${chapterId}`, { method: 'DELETE' })
    fetchProject()
    toast.success('Đã xóa chương')
  }

  const deleteCharacter = async (charId: string) => {
    if (!confirm('Xóa nhân vật này?')) return
    await fetch(`/api/characters?id=${charId}`, { method: 'DELETE' })
    fetchProject()
    toast.success('Đã xóa nhân vật')
  }

  const exportProject = async (format: 'txt' | 'json') => {
    const res = await fetch(`/api/export?projectId=${id}&format=${format}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project?.title || 'project'}.${format}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Đã xuất file .${format}`)
  }

  if (loading) return (
    <div className="flex min-h-screen bg-sf-bg">
      <Sidebar />
      <main className="flex-1 ml-64 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sf-primary/30 border-t-sf-primary rounded-full animate-spin" />
      </main>
    </div>
  )

  if (!project) return null

  return (
    <div className="flex min-h-screen bg-sf-bg">
      <Sidebar />
      <main className="flex-1 ml-64">
        {/* Project Header */}
        <div className="border-b border-sf-border px-8 py-6" style={{ borderBottomColor: project.coverColor + '44' }}>
          <div className="flex items-start justify-between">
            <div>
              <Link href="/dashboard" className="text-sf-muted hover:text-sf-text text-sm mb-2 inline-flex items-center gap-1">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-sf-text mt-1">{project.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs bg-sf-elevated text-sf-muted px-3 py-1 rounded-full">
                  {GENRE_LABELS[project.genre] || project.genre}
                </span>
                <span className="text-xs bg-sf-elevated text-sf-muted px-3 py-1 rounded-full">
                  {CONTENT_TYPE_LABELS[project.contentType] || project.contentType}
                </span>
                <span className="text-xs text-sf-muted">✍️ {project.wordCount.toLocaleString()} từ</span>
              </div>
              {project.synopsis && (
                <p className="text-sf-muted text-sm mt-2 max-w-2xl">{project.synopsis}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => exportProject('txt')} className="flex items-center gap-1.5 bg-sf-elevated hover:bg-sf-border border border-sf-border text-sf-subtext hover:text-sf-text px-4 py-2 rounded-xl text-sm transition-colors">
                📤 TXT
              </button>
              <button onClick={() => exportProject('json')} className="flex items-center gap-1.5 bg-sf-elevated hover:bg-sf-border border border-sf-border text-sf-subtext hover:text-sf-text px-4 py-2 rounded-xl text-sm transition-colors">
                📤 JSON
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-sf-surface border border-sf-border rounded-xl p-1 w-fit">
            {(['chapters', 'characters'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab ? 'bg-sf-primary text-white' : 'text-sf-muted hover:text-sf-text'
                }`}
              >
                {tab === 'chapters' ? `📝 Chương (${project.chapters.length})` : `👥 Nhân vật (${project.characters.length})`}
              </button>
            ))}
          </div>

          {/* CHAPTERS TAB */}
          {activeTab === 'chapters' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-sf-text">Danh sách chương</h2>
                <button
                  onClick={() => setShowNewChapter(true)}
                  className="flex items-center gap-2 bg-sf-primary hover:bg-sf-primary-dark text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  + Chương mới
                </button>
              </div>

              {project.chapters.length === 0 ? (
                <div className="text-center py-16 text-sf-muted bg-sf-surface border border-sf-border rounded-2xl">
                  <div className="text-4xl mb-3">📖</div>
                  <p className="text-sf-subtext font-medium mb-1">Chưa có chương nào</p>
                  <p className="text-sm mb-4">Tạo chương đầu tiên để bắt đầu sáng tác</p>
                  <button
                    onClick={() => setShowNewChapter(true)}
                    className="bg-sf-primary hover:bg-sf-primary-dark text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    + Tạo chương 1
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {project.chapters.map((ch) => (
                    <div key={ch.id} className="flex items-center gap-4 bg-sf-surface border border-sf-border rounded-xl p-4 hover:border-sf-primary/30 transition-all group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-sf-primary bg-sf-primary/10 flex-shrink-0">
                        {ch.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sf-text group-hover:text-sf-primary transition-colors">{ch.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-sf-muted mt-1">
                          <span>✍️ {ch.wordCount.toLocaleString()} từ</span>
                          {ch.summary && <span className="text-green-400">✅ Đã tóm tắt</span>}
                          <span>{new Date(ch.updatedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/projects/${id}/chapters/${ch.id}`}
                          className="bg-sf-primary/10 hover:bg-sf-primary text-sf-primary hover:text-white border border-sf-primary/30 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                        >
                          Mở editor ✏️
                        </Link>
                        <button
                          onClick={() => deleteChapter(ch.id)}
                          className="text-sf-muted hover:text-sf-danger p-1.5 rounded-lg transition-colors"
                          title="Xóa chương"
                        >✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CHARACTERS TAB */}
          {activeTab === 'characters' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-sf-text">Nhân vật</h2>
                <button
                  onClick={() => setShowNewChar(true)}
                  className="flex items-center gap-2 bg-sf-primary hover:bg-sf-primary-dark text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  + Thêm nhân vật
                </button>
              </div>

              {project.characters.length === 0 ? (
                <div className="text-center py-16 text-sf-muted bg-sf-surface border border-sf-border rounded-2xl">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="text-sf-subtext font-medium mb-1">Chưa có nhân vật nào</p>
                  <p className="text-sm mb-4">Thêm nhân vật để AI giữ nhất quán xuyên suốt tác phẩm</p>
                  <button
                    onClick={() => setShowNewChar(true)}
                    className="bg-sf-primary hover:bg-sf-primary-dark text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    + Thêm nhân vật đầu tiên
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.characters.map((char) => {
                    const personalityArr = char.personality ? JSON.parse(char.personality) : []
                    return (
                      <div key={char.id} className="bg-sf-surface border border-sf-border rounded-2xl p-5 group relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-600/30 border border-sf-border flex items-center justify-center text-xl">
                              {char.gender === 'female' ? '👩' : char.gender === 'male' ? '👨' : '🧑'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-sf-text">{char.name}</h3>
                              <p className="text-xs text-sf-muted">
                                {char.age ? `${char.age} tuổi` : ''}{char.age && char.gender ? ', ' : ''}{char.gender === 'female' ? 'Nữ' : char.gender === 'male' ? 'Nam' : ''}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteCharacter(char.id)}
                            className="opacity-0 group-hover:opacity-100 text-sf-muted hover:text-sf-danger transition-all p-1"
                          >✕</button>
                        </div>
                        
                        {char.appearance && (
                          <p className="text-sm text-sf-muted mb-2"><span className="text-sf-subtext font-medium">Ngoại hình: </span>{char.appearance}</p>
                        )}
                        {personalityArr.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {personalityArr.map((trait: string) => (
                              <span key={trait} className="text-xs bg-violet-500/15 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-full">{trait}</span>
                            ))}
                          </div>
                        )}
                        {char.backstory && (
                          <p className="text-xs text-sf-muted line-clamp-2">{char.backstory}</p>
                        )}
                        {char.imagePrompt && (
                          <div className="mt-3 pt-3 border-t border-sf-border">
                            <p className="text-xs text-sf-muted font-medium mb-1">🎨 AI Image Prompt:</p>
                            <p className="text-xs text-blue-300 font-mono line-clamp-2">{char.imagePrompt}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* New Chapter Modal */}
      {showNewChapter && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewChapter(false)}>
          <div className="bg-sf-surface border border-sf-border rounded-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-sf-text mb-6">📝 Tạo chương mới</h2>
            <form onSubmit={createChapter}>
              <label className="block text-sm font-medium text-sf-subtext mb-2">Tiêu đề chương</label>
              <input
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                required
                autoFocus
                className="w-full bg-sf-bg border border-sf-border rounded-xl px-4 py-3 text-sf-text placeholder-sf-muted focus:outline-none focus:border-sf-primary mb-6"
                placeholder={`Chương ${(project.chapters.length + 1)}: Tiêu đề...`}
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowNewChapter(false)} className="flex-1 border border-sf-border text-sf-muted py-3 rounded-xl transition-colors hover:text-sf-text">Huỷ</button>
                <button type="submit" disabled={creating} className="flex-1 bg-sf-primary hover:bg-sf-primary-dark disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors">
                  {creating ? 'Đang tạo...' : 'Tạo & Mở Editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Character Modal */}
      {showNewChar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewChar(false)}>
          <div className="bg-sf-surface border border-sf-border rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-sf-text">👤 Thêm nhân vật</h2>
              <button onClick={() => setShowNewChar(false)} className="text-sf-muted hover:text-sf-text">✕</button>
            </div>
            <form onSubmit={createCharacter} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sf-subtext mb-2">Tên nhân vật *</label>
                  <input value={newChar.name} onChange={(e) => setNewChar({ ...newChar, name: e.target.value })} required
                    className="w-full bg-sf-bg border border-sf-border rounded-xl px-4 py-2.5 text-sf-text focus:outline-none focus:border-sf-primary text-sm" placeholder="Tên đầy đủ" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sf-subtext mb-2">Tuổi</label>
                  <input type="number" value={newChar.age} onChange={(e) => setNewChar({ ...newChar, age: e.target.value })}
                    className="w-full bg-sf-bg border border-sf-border rounded-xl px-4 py-2.5 text-sf-text focus:outline-none focus:border-sf-primary text-sm" placeholder="20" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-sf-subtext mb-2">Giới tính</label>
                <select value={newChar.gender} onChange={(e) => setNewChar({ ...newChar, gender: e.target.value })}
                  className="w-full bg-sf-bg border border-sf-border rounded-xl px-4 py-2.5 text-sf-text focus:outline-none focus:border-sf-primary text-sm">
                  <option value="">Không xác định</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-sf-subtext mb-2">Ngoại hình</label>
                <textarea value={newChar.appearance} onChange={(e) => setNewChar({ ...newChar, appearance: e.target.value })} rows={2}
                  className="w-full bg-sf-bg border border-sf-border rounded-xl px-4 py-2.5 text-sf-text placeholder-sf-muted focus:outline-none focus:border-sf-primary text-sm resize-none"
                  placeholder="Mô tả ngoại hình: tóc, mắt, chiều cao, đặc điểm nổi bật..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-sf-subtext mb-2">Tính cách (cách nhau bởi dấu phẩy)</label>
                <input value={newChar.personality} onChange={(e) => setNewChar({ ...newChar, personality: e.target.value })}
                  className="w-full bg-sf-bg border border-sf-border rounded-xl px-4 py-2.5 text-sf-text placeholder-sf-muted focus:outline-none focus:border-sf-primary text-sm"
                  placeholder="dũng cảm, nội tâm, hay hoài nghi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-sf-subtext mb-2">Lịch sử / Backstory</label>
                <textarea value={newChar.backstory} onChange={(e) => setNewChar({ ...newChar, backstory: e.target.value })} rows={3}
                  className="w-full bg-sf-bg border border-sf-border rounded-xl px-4 py-2.5 text-sf-text placeholder-sf-muted focus:outline-none focus:border-sf-primary text-sm resize-none"
                  placeholder="Tiểu sử, quá khứ, động lực của nhân vật..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-sf-subtext mb-2">🎨 Image Prompt (cho sinh ảnh AI)</label>
                <textarea value={newChar.imagePrompt} onChange={(e) => setNewChar({ ...newChar, imagePrompt: e.target.value })} rows={2}
                  className="w-full bg-sf-bg border border-sf-border rounded-xl px-4 py-2.5 text-sf-text placeholder-sf-muted focus:outline-none focus:border-sf-primary text-sm resize-none font-mono"
                  placeholder="young Vietnamese woman, long black hair, brown eyes, scar on neck..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewChar(false)} className="flex-1 border border-sf-border text-sf-muted hover:text-sf-text py-3 rounded-xl transition-colors">Huỷ</button>
                <button type="submit" disabled={creating} className="flex-1 bg-sf-primary hover:bg-sf-primary-dark disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors">
                  {creating ? 'Đang lưu...' : 'Thêm nhân vật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
