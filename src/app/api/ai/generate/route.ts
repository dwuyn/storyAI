import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  generateChapterContent,
  generateChapterSummary,
  generateComicScript,
  StoryContext,
  CharacterContext,
  ChapterContext,
} from '@/lib/gemini'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { projectId, chapterId, prompt, mode } = await req.json()

    if (!projectId || !chapterId) {
      return NextResponse.json({ error: 'projectId và chapterId là bắt buộc' }, { status: 400 })
    }

    // Fetch project with full context
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        characters: true,
        chapters: { orderBy: { number: 'asc' } },
      },
    })

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Current chapter
    const currentChapter = project.chapters.find((ch) => ch.id === chapterId)
    if (!currentChapter) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })

    // Build context
    const characters: CharacterContext[] = project.characters.map((char) => ({
      name: char.name,
      age: char.age,
      gender: char.gender,
      appearance: char.appearance || undefined,
      personality: char.personality ? JSON.parse(char.personality) : undefined,
      backstory: char.backstory,
      relationships: char.relationships ? JSON.parse(char.relationships) : undefined,
    }))

    // Previous chapters (not including current)
    const previousChapters: ChapterContext[] = project.chapters
      .filter((ch) => ch.number < currentChapter.number)
      .map((ch) => ({
        number: ch.number,
        title: ch.title,
        summary: ch.summary,
        // Last 300 chars for continuity
        contentSnippet: ch.content ? ch.content.slice(-300).trim() : undefined,
      }))

    const context: StoryContext = {
      title: project.title,
      genre: project.genre,
      synopsis: project.synopsis,
      contentType: project.contentType,
      characters,
      previousChapters,
      currentChapterNumber: currentChapter.number,
      currentChapterTitle: currentChapter.title,
    }

    let generatedText = ''

    if (mode === 'comic_panel') {
      generatedText = await generateComicScript(context, prompt || 'Mô tả cảnh tiếp theo', 6)
    } else if (mode === 'summarize') {
      // Summarize the current chapter
      if (!currentChapter.content) {
        return NextResponse.json({ error: 'Chương chưa có nội dung để tóm tắt' }, { status: 400 })
      }
      generatedText = await generateChapterSummary(currentChapter.title, currentChapter.content)
      
      // Save summary
      await prisma.chapter.update({
        where: { id: chapterId },
        data: { summary: generatedText },
      })
    } else {
      // Default: generate story content
      generatedText = await generateChapterContent(
        context,
        prompt || '',
        mode === 'continue' ? (currentChapter.content || '') : undefined
      )
    }

    return NextResponse.json({ text: generatedText, mode })
  } catch (error: any) {
    console.error('AI Generate error:', error)
    
    if (error.message?.includes('API_KEY')) {
      return NextResponse.json({ error: 'API Key Gemini không hợp lệ. Vui lòng kiểm tra file .env' }, { status: 500 })
    }
    
    return NextResponse.json(
      { error: error.message || 'Lỗi khi gọi Gemini API' },
      { status: 500 }
    )
  }
}
