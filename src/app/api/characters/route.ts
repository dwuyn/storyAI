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

  const characters = await prisma.character.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(characters)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { projectId, name, age, gender, appearance, personality, backstory, imagePrompt, aliases, relationships } = body

  if (!projectId || !name) {
    return NextResponse.json({ error: 'projectId và name là bắt buộc' }, { status: 400 })
  }

  const character = await prisma.character.create({
    data: {
      projectId,
      name,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      appearance: appearance || null,
      personality: personality ? JSON.stringify(personality.split(',').map((s: string) => s.trim())) : null,
      backstory: backstory || null,
      imagePrompt: imagePrompt || null,
      aliases: aliases ? JSON.stringify(aliases) : null,
      relationships: relationships ? JSON.stringify(relationships) : null,
    },
  })

  return NextResponse.json(character)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...data } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const character = await prisma.character.update({
    where: { id },
    data: {
      name: data.name,
      age: data.age ? parseInt(data.age) : null,
      gender: data.gender || null,
      appearance: data.appearance || null,
      personality: data.personality ? JSON.stringify(data.personality.split(',').map((s: string) => s.trim())) : null,
      backstory: data.backstory || null,
      imagePrompt: data.imagePrompt || null,
    },
  })

  return NextResponse.json(character)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await prisma.character.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
