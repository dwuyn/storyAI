'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Chapter {
  id: string; number: number; title: string; content: string
  summary?: string; wordCount: number; projectId: string
}

interface Project {
  id: string; title: string; genre: string; contentType: string
  chapters: { id: string; number: number; title: string }[]
}

type GenerateMode = 'new_paragraph' | 'continue' | 'rewrite' | 'comic_panel' | 'summarize'

export default function ChapterEditorPage() {
  const { id: projectId, chapterId } = useParams<{ id: string; chapterId: string }>()
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [generateMode, setGenerateMode] = useState<GenerateMode>('continue')
  const [showAiPanel, setShowAiPanel] = useState(true)
  const [generatedPreview, setGeneratedPreview] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [zenMode, setZenMode] = useState(false)

  useEffect(() => {
    fetchData()
  }, [chapterId])

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length
    setWordCount(content.trim() ? words : 0)
  }, [content])

  // Auto-save
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(() => {
      saveChapter(true)
    }, 3000)
  }, [content, title])

  useEffect(() => {
    if (chapter && (content !== chapter.content || title !== chapter.title)) {
      scheduleAutoSave()
    }
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current) }
  }, [content, title])

  const fetchData = async () => {
    try {
      const [chRes, projRes] = await Promise.all([
        fetch(`/api/chapters/${chapterId}`),
        fetch(`/api/projects/${projectId}`),
      ])
      const [ch, proj] = await Promise.all([chRes.json(), projRes.json()])
      setChapter(ch)
      setProject(proj)
      setContent(ch.content || '')
      setTitle(ch.title)
    } catch { toast.error('Không thể tải chapter') }
    finally { setLoading(false) }
  }

  const saveChapter = async (silent = false) => {
    if (!chapter) return
    setSaving(true)
    try {
      await fetch('/api/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: chapter.id, title, content }),
      })
      setLastSaved(new Date())
      if (!silent) toast.success('Đã lưu!')
    } catch { if (!silent) toast.error('Lỗi lưu') }
    finally { setSaving(false) }
  }

  const generateContent = async () => {
    if (!chapter || generating) return
    setGenerating(true)
    setGeneratedPreview('')

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          chapterId: chapter.id,
          prompt: aiPrompt,
          mode: generateMode,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Lỗi AI')
        return
      }

      if (generateMode === 'summarize') {
        setChapter(prev => prev ? { ...prev, summary: data.text } : null)
        toast.success('✅ Đã tóm tắt chương!')
      } else {
        setGeneratedPreview(data.text)
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi kết nối')
    } finally {
      setGenerating(false)
    }
  }

  const acceptGenerated = () => {
    if (!generatedPreview) return
    const newContent = generateMode === 'rewrite'
      ? generatedPreview
      : content + (content.endsWith('\n') || !content ? '' : '\n\n') + generatedPreview
    setContent(newContent)
    setGeneratedPreview('')
    toast.success('Đã chèn nội dung vào editor')
  }

  const rejectGenerated = () => {
    setGeneratedPreview('')
  }

  const modes: { key: GenerateMode; label: string; desc: string; icon: string }[] = [
    { key: 'continue', label: 'Tiếp tục', desc: 'AI viết tiếp từ chỗ đang dừng', icon: '' },
    { key: 'new_paragraph', label: 'Đoạn mới', desc: 'Viết đoạn văn theo gợi ý', icon: '' },
    { key: 'rewrite', label: 'Viết lại', desc: 'Thay thế toàn bộ nội dung chương', icon: '' },
    { key: 'comic_panel', label: 'Comic Script', desc: 'Tạo kịch bản truyện tranh', icon: '' },
    { key: 'summarize', label: 'Tóm tắt', desc: 'AI tóm tắt chương để dùng làm context', icon: '' },
  ]

  if (loading) return (
    <div className="min-h-screen bg-sf-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-sf-primary/30 border-t-sf-primary rounded-full animate-spin" />
    </div>
  )

  if (!chapter || !project) return null

  return (
    <div className={`min-h-screen bg-sf-bg flex flex-col ${zenMode ? 'zen' : ''}`}>
      {/* Top Bar */}
      {!zenMode && (
        <header className="h-14 border-b border-sf-border bg-sf-surface flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-30">
          <Link href={`/projects/${projectId}`} className="text-sf-muted hover:text-sf-text text-sm flex items-center gap-1 transition-colors">
            ← {project.title}
          </Link>
          
          <div className="h-4 w-px bg-sf-border" />
          
          <span className="text-sm text-sf-subtext font-medium">Chương {chapter.number}:</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 max-w-xs bg-transparent text-sf-text font-medium focus:outline-none border-b border-transparent focus:border-sf-primary/50 transition-colors text-sm"
          />

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-sf-muted">{wordCount.toLocaleString()} từ</span>
            {lastSaved && (
              <span className="text-xs text-sf-muted">
                {saving ? ' Đang lưu...' : `✅ ${lastSaved.toLocaleTimeString('vi-VN')}`}
              </span>
            )}
            <button
              onClick={() => setZenMode(true)}
              className="text-xs text-sf-muted hover:text-sf-text border border-sf-border px-3 py-1.5 rounded-lg transition-colors"
              title="Chế độ tập trung"
            > Zen</button>
            <button
              onClick={() => saveChapter(false)}
              disabled={saving}
              className="flex items-center gap-1.5 bg-sf-primary hover:bg-sf-primary-dark disabled:opacity-60 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? '...' : 'Lưu'}
            </button>
          </div>
        </header>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* EDITOR */}
        <div className={`flex-1 flex flex-col ${showAiPanel && !zenMode ? 'mr-0' : ''}`}>
          {zenMode && (
            <div className="fixed top-4 right-4 z-50 flex gap-2">
              <button onClick={() => setZenMode(false)} className="bg-sf-surface border border-sf-border text-sf-muted px-3 py-1.5 rounded-lg text-sm hover:text-sf-text transition-colors">← Thoát Zen</button>
              <button onClick={() => saveChapter(false)} className="bg-sf-primary text-white px-3 py-1.5 rounded-lg text-sm transition-colors">Lưu</button>
            </div>
          )}
          
          <div className={`flex-1 flex flex-col overflow-y-auto ${zenMode ? 'max-w-3xl mx-auto w-full px-8 py-16' : 'px-8 py-8'}`}>
            {!zenMode && (
              <div className="max-w-3xl mx-auto w-full mb-3">
                <div className="flex items-center justify-between text-xs text-sf-muted mb-4">
                  <span>Chương {chapter.number} · {project.contentType === 'comic' ? 'Comic Script' : 'Nội dung truyện'}</span>
                  {chapter.summary && (
                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full">✅ Đã có tóm tắt context</span>
                  )}
                </div>
              </div>
            )}

            <div className="max-w-3xl mx-auto w-full flex-1">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="story-editor w-full"
                placeholder={`Bắt đầu viết Chương ${chapter.number}: ${title}...\n\nHoặc dùng panel AI bên phải để AI viết cho bạn.`}
              />
            </div>

            {/* Generated Preview */}
            {generatedPreview && (
              <div className="max-w-3xl mx-auto w-full mt-6">
                <div className="border border-sf-primary/30 bg-sf-primary/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-sf-primary animate-pulse" />
                      <span className="text-sm font-medium text-sf-primary">🤖 Nội dung AI đề xuất</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={acceptGenerated}
                        className="flex items-center gap-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >✅ Chèn vào</button>
                      <button
                        onClick={rejectGenerated}
                        className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-1.5 rounded-lg text-sm transition-colors"
                      >✕ Bỏ qua</button>
                    </div>
                  </div>
                  <div className="prose-story whitespace-pre-wrap text-sf-subtext text-sm leading-relaxed max-h-80 overflow-y-auto">
                    {generatedPreview}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI PANEL */}
        {!zenMode && (
          <aside className="w-80 bg-sf-surface border-l border-sf-border flex flex-col overflow-y-auto flex-shrink-0">
            <div className="p-5 border-b border-sf-border">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sf-text flex items-center gap-2">
                  <span className="w-5 h-5 bg-gradient-to-br from-blue-500 to-violet-600 rounded flex items-center justify-center text-xs">✦</span>
                  Gemini AI
                </h2>
                <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">Đang kết nối</span>
              </div>
              <p className="text-xs text-sf-muted mt-1">AI nhớ toàn bộ ngữ cảnh của tác phẩm</p>
            </div>

            {/* Context info */}
            <div className="p-4 border-b border-sf-border">
              <p className="text-xs font-medium text-sf-subtext mb-2">📊 Ngữ cảnh đang dùng</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-sf-muted">Chương trước</span>
                  <span className="text-sf-subtext">{chapter.number - 1} chương</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-sf-muted">Nhân vật</span>
                  <span className="text-sf-subtext">Đã inject context</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-sf-muted">Nội dung hiện tại</span>
                  <span className="text-sf-subtext">{wordCount.toLocaleString()} từ</span>
                </div>
                {chapter.summary && (
                  <div className="mt-2 pt-2 border-t border-sf-border">
                    <p className="text-xs text-green-400">✅ Chapter này đã được tóm tắt</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mode selector */}
            <div className="p-4 border-b border-sf-border">
              <p className="text-xs font-medium text-sf-subtext mb-3">Chế độ tạo nội dung</p>
              <div className="space-y-1.5">
                {modes.map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => setGenerateMode(mode.key)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                      generateMode === mode.key
                        ? 'bg-sf-primary/15 border border-sf-primary/30 text-sf-primary'
                        : 'border border-transparent hover:bg-sf-elevated text-sf-muted hover:text-sf-text'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{mode.icon}</span>
                      <div>
                        <div className="font-medium">{mode.label}</div>
                        <div className="text-xs opacity-70 mt-0.5">{mode.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt input */}
            <div className="p-4 border-b border-sf-border">
              <label className="block text-xs font-medium text-sf-subtext mb-2">
                {generateMode === 'summarize' ? 'Không cần prompt — AI tự tóm tắt' : 'Gợi ý / Hướng dẫn cho AI (tùy chọn)'}
              </label>
              {generateMode !== 'summarize' && (
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  disabled={generateMode === 'summarize'}
                  className="w-full bg-sf-bg border border-sf-border rounded-xl px-3 py-2.5 text-sf-text placeholder-sf-muted focus:outline-none focus:border-sf-primary text-sm resize-none transition-colors disabled:opacity-50"
                  placeholder={
                    generateMode === 'continue' ? 'Ví dụ: thêm tình tiết bí ẩn, nhân vật A xuất hiện...'
                    : generateMode === 'new_paragraph' ? 'Mô tả đoạn văn bạn muốn AI viết...'
                    : generateMode === 'rewrite' ? 'Hướng dẫn AI viết lại theo phong cách...'
                    : 'Mô tả cảnh cho comic panel...'
                  }
                />
              )}
            </div>

            {/* Generate button */}
            <div className="p-4">
              <button
                onClick={generateContent}
                disabled={generating}
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Gemini đang viết...</span>
                  </>
                ) : (
                  <>
                    <span>✦</span>
                    <span>Tạo nội dung với AI</span>
                  </>
                )}
              </button>

              {generating && (
                <p className="text-xs text-sf-muted text-center mt-2 animate-pulse">
                  Đang phân tích ngữ cảnh & sinh nội dung...
                </p>
              )}
            </div>

            {/* Chapter navigation */}
            {project.chapters.length > 1 && (
              <div className="p-4 border-t border-sf-border mt-auto">
                <p className="text-xs font-medium text-sf-subtext mb-2">Chương khác</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {project.chapters.map((ch) => (
                    <Link
                      key={ch.id}
                      href={`/projects/${projectId}/chapters/${ch.id}`}
                      className={`block px-3 py-2 rounded-lg text-xs transition-colors ${
                        ch.id === chapter.id
                          ? 'bg-sf-primary/15 text-sf-primary'
                          : 'text-sf-muted hover:text-sf-text hover:bg-sf-elevated'
                      }`}
                    >
                      {ch.number}. {ch.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}
