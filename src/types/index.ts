export interface ProjectWithStats {
  id: string
  title: string
  genre: string
  synopsis?: string | null
  contentType: string
  coverColor: string
  wordCount: number
  createdAt: Date
  updatedAt: Date
  _count: {
    chapters: number
    characters: number
  }
}

export interface CharacterFormData {
  name: string
  age?: number
  gender?: string
  appearance?: string
  personality?: string
  backstory?: string
  imagePrompt?: string
}

export interface ChapterFormData {
  title: string
  content?: string
}

export interface GenerateRequest {
  projectId: string
  chapterId: string
  prompt?: string
  mode: 'continue' | 'new_paragraph' | 'rewrite' | 'comic_panel'
}

export type ContentType = 'story' | 'comic' | 'video_script' | 'lyrics'
export type Genre =
  | 'fantasy' | 'romance' | 'thriller' | 'sci-fi' | 'horror'
  | 'adventure' | 'mystery' | 'historical' | 'slice-of-life' | 'comedy'

export const GENRE_LABELS: Record<string, string> = {
  fantasy: 'Fantasy',
  romance: 'Lãng mạn',
  thriller: 'Kinh dị/Thriller',
  'sci-fi': 'Khoa học viễn tưởng',
  horror: 'Horror',
  adventure: 'Phiêu lưu',
  mystery: 'Trinh thám',
  historical: 'Lịch sử',
  'slice-of-life': 'Đời thường',
  comedy: 'Hài hước',
}

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  story: 'Truyện / Novel',
  comic: 'Truyện tranh',
  video_script: 'Kịch bản Video',
  lyrics: 'Lời nhạc',
}
