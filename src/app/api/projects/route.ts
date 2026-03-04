import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: { select: { chapters: true, characters: true } },
    },
  })

  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const { title, genre, synopsis, contentType, coverColor } = await req.json()

  if (!title || !genre) {
    return NextResponse.json({ error: 'Tiêu đề và thể loại là bắt buộc' }, { status: 400 })
  }

  const project = await prisma.project.create({
    data: {
      userId,
      title,
      genre,
      synopsis: synopsis || null,
      contentType: contentType || 'story',
      coverColor: coverColor || '#3B82F6',
    },
  })

  return NextResponse.json(project)
}
