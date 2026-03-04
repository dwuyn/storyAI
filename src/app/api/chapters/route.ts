import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const chapters = await prisma.chapter.findMany({
    where: { projectId },
    orderBy: { number: 'asc' },
  })
  return NextResponse.json(chapters)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, title, content } = await req.json()
  if (!projectId || !title) return NextResponse.json({ error: 'projectId và title là bắt buộc' }, { status: 400 })

  // Get next chapter number
  const lastChapter = await prisma.chapter.findFirst({
    where: { projectId },
    orderBy: { number: 'desc' },
  })
  const number = (lastChapter?.number || 0) + 1

  const chapter = await prisma.chapter.create({
    data: {
      projectId,
      number,
      title,
      content: content || '',
      wordCount: content ? content.split(/\s+/).filter(Boolean).length : 0,
    },
  })

  return NextResponse.json(chapter)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, title, content, summary } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0

  const chapter = await prisma.chapter.update({
    where: { id },
    data: {
      title: title || undefined,
      content: content !== undefined ? content : undefined,
      summary: summary !== undefined ? summary : undefined,
      wordCount,
    },
  })

  // Update project word count
  const chapters = await prisma.chapter.findMany({ where: { projectId: chapter.projectId } })
  const totalWords = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0)
  await prisma.project.update({
    where: { id: chapter.projectId },
    data: { wordCount: totalWords },
  })

  return NextResponse.json(chapter)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await prisma.chapter.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
