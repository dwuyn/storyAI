import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId },
    include: {
      characters: { orderBy: { createdAt: 'asc' } },
      chapters: { orderBy: { number: 'asc' } },
    },
  })

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  const data = await req.json()
  const project = await prisma.project.updateMany({
    where: { id: params.id, userId },
    data: {
      title: data.title,
      genre: data.genre,
      synopsis: data.synopsis,
      contentType: data.contentType,
      coverColor: data.coverColor,
    },
  })

  return NextResponse.json(project)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id

  await prisma.project.deleteMany({ where: { id: params.id, userId } })
  return NextResponse.json({ success: true })
}
