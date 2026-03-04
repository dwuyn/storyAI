import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const format = searchParams.get('format') || 'txt'

  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      chapters: { orderBy: { number: 'asc' } },
      characters: true,
    },
  })

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (format === 'txt') {
    let content = `${project.title.toUpperCase()}\n`
    content += `${'='.repeat(project.title.length)}\n\n`
    content += `Thể loại: ${project.genre}\n`
    if (project.synopsis) content += `Tóm tắt: ${project.synopsis}\n`
    content += `\n${'─'.repeat(50)}\n\n`

    project.chapters.forEach((ch) => {
      content += `CHƯƠNG ${ch.number}: ${ch.title.toUpperCase()}\n`
      content += `${'─'.repeat(40)}\n\n`
      content += (ch.content || '(Chưa có nội dung)') + '\n\n'
    })

    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(project.title)}.txt"`,
      },
    })
  }

  if (format === 'json') {
    return NextResponse.json({
      project: {
        title: project.title,
        genre: project.genre,
        synopsis: project.synopsis,
        contentType: project.contentType,
        wordCount: project.wordCount,
      },
      characters: project.characters,
      chapters: project.chapters,
    })
  }

  return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
}
