import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export function getGeminiModel(): GenerativeModel {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.85,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    },
  })
}

export function getGeminiProModel(): GenerativeModel {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  })
}


export interface CharacterContext {
  name: string
  age?: number | null
  gender?: string | null
  appearance?: string
  personality?: string[]
  backstory?: string | null
  relationships?: Array<{ name: string; relation: string }>
}

export interface ChapterContext {
  number: number
  title: string
  summary?: string | null
  contentSnippet?: string
}

export interface StoryContext {
  title: string
  genre: string
  synopsis?: string | null
  contentType: string
  characters: CharacterContext[]
  previousChapters: ChapterContext[]
  currentChapterNumber: number
  currentChapterTitle: string
}

export function buildContextPrompt(context: StoryContext): string {
  const { title, genre, synopsis, contentType, characters, previousChapters } = context

  const contentTypeLabel: Record<string, string> = {
    story: 'truyện ngắn/tiểu thuyết',
    comic: 'truyện tranh (comic script)',
    video_script: 'kịch bản video',
    lyrics: 'lời nhạc / bài hát',
  }

  let prompt = `Bạn là một AI chuyên hỗ trợ sáng tác văn học chuyên nghiệp, có khả năng viết ${contentTypeLabel[contentType] || 'nội dung sáng tạo'} với chất lượng cao.

==== THÔNG TIN TÁC PHẨM ====
Tên tác phẩm: "${title}"
Thể loại: ${genre}
Loại nội dung: ${contentTypeLabel[contentType] || contentType}
${synopsis ? `Tóm tắt cốt truyện: ${synopsis}` : ''}

`

  if (characters.length > 0) {
    prompt += `==== NHÂN VẬT TRONG TÁC PHẨM ====\n`
    characters.forEach((char) => {
      prompt += `\n• ${char.name}`
      if (char.age) prompt += ` (${char.age} tuổi)`
      if (char.gender) prompt += `, ${char.gender}`
      if (char.appearance) prompt += `\n  Ngoại hình: ${char.appearance}`
      if (char.personality && char.personality.length > 0)
        prompt += `\n  Tính cách: ${char.personality.join(', ')}`
      if (char.backstory) prompt += `\n  Lịch sử: ${char.backstory}`
      if (char.relationships && char.relationships.length > 0) {
        prompt += `\n  Quan hệ: ${char.relationships.map((r) => `${r.name} (${r.relation})`).join(', ')}`
      }
      prompt += '\n'
    })
    prompt += '\n'
  }

  if (previousChapters.length > 0) {
    prompt += `==== TÓM TẮT CÁC CHƯƠNG TRƯỚC ====\n`
    previousChapters.forEach((ch) => {
      prompt += `\nChương ${ch.number}: "${ch.title}"\n`
      if (ch.summary) {
        prompt += `Tóm tắt: ${ch.summary}\n`
      }
      if (ch.contentSnippet) {
        prompt += `Kết thúc chương: "...${ch.contentSnippet}"\n`
      }
    })
    prompt += '\n'
  }

  prompt += `==== HƯỚNG DẪN VIẾT ====
- Duy trì giọng văn nhất quán xuyên suốt tác phẩm
- Đảm bảo tính cách và hành vi nhân vật nhất quán với mô tả đã có
- Không mâu thuẫn với các sự kiện đã xảy ra ở chương trước
- Viết bằng tiếng Việt tự nhiên, văn học, sinh động
- Chương hiện tại là Chương ${context.currentChapterNumber}: "${context.currentChapterTitle}"

`

  return prompt
}

/**
 * Generate chapter content with full story context
 */
export async function generateChapterContent(
  context: StoryContext,
  userPrompt: string,
  existingContent?: string
): Promise<string> {
  const model = getGeminiModel()
  const systemContext = buildContextPrompt(context)

  let fullPrompt = systemContext

  if (existingContent && existingContent.trim().length > 0) {
    fullPrompt += `==== NỘI DUNG HIỆN TẠI CỦA CHƯƠNG (tiếp tục từ đây) ====\n${existingContent}\n\n`
    fullPrompt += `Yêu cầu: ${userPrompt || 'Tiếp tục câu chuyện một cách tự nhiên và hấp dẫn.'}\n\nViết tiếp nội dung:`
  } else {
    fullPrompt += `Yêu cầu: ${userPrompt || `Viết nội dung mở đầu cho Chương ${context.currentChapterNumber}, bắt đầu câu chuyện một cách hấp dẫn.`}\n\nNội dung chương:`
  }

  const result = await model.generateContent(fullPrompt)
  const response = await result.response
  return response.text()
}

/**
 * Generate a summary of a chapter for context injection
 */
export async function generateChapterSummary(
  chapterTitle: string,
  chapterContent: string
): Promise<string> {
  const model = getGeminiModel()
  const prompt = `Tóm tắt ngắn gọn (tối đa 200 từ) nội dung sau của chương "${chapterTitle}" trong một tác phẩm văn học. 
Tập trung vào: sự kiện chính, hành động nhân vật, và bất kỳ thay đổi quan trọng nào về trạng thái câu chuyện.

Nội dung cần tóm tắt:
${chapterContent.substring(0, 8000)}

Tóm tắt:`

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

/**
 * Generate comic panel script
 */
export async function generateComicScript(
  context: StoryContext,
  sceneDescription: string,
  panelCount: number = 6
): Promise<string> {
  const model = getGeminiModel()
  const systemContext = buildContextPrompt(context)

  const prompt = `${systemContext}
Viết kịch bản truyện tranh cho cảnh sau với ${panelCount} panel. 
Cảnh: ${sceneDescription}

Format mỗi panel như sau:
PANEL [số]:
Hành động/Bối cảnh: [mô tả hình ảnh chi tiết]
Nhân vật: [nhân vật xuất hiện]
Thoại: [hội thoại nếu có]
Hiệu ứng âm thanh: [SFX nếu cần]
Prompt ảnh AI: [prompt tiếng Anh để sinh ảnh bằng Midjourney/DALL-E]

---`

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

/**
 * Consistency check — detect contradictions
 */
export async function checkConsistency(
  projectSummary: string,
  newContent: string
): Promise<{ issues: string[]; score: number }> {
  const model = getGeminiModel()

  const prompt = `Bạn là một biên tập viên kiểm tra tính nhất quán của tác phẩm văn học.

Tóm tắt toàn bộ câu chuyện đã có:
${projectSummary}

Nội dung mới cần kiểm tra:
${newContent}

Hãy xác định các mâu thuẫn (nếu có) và cho điểm tính nhất quán từ 0-100.
Trả về JSON:
{
  "issues": ["mô tả vấn đề 1", "mô tả vấn đề 2"],
  "score": 95,
  "suggestion": "gợi ý sửa (nếu có)"
}

Chỉ trả về JSON, không có text khác.`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const cleaned = text.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return { issues: [], score: 100 }
  }
}
