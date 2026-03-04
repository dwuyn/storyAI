# StoryForge AI 🤖📖

Website hỗ trợ sáng tác nội dung với AI — tự động giữ ngữ cảnh toàn tác phẩm.
**Powered by Google Gemini 1.5 Flash** (1 triệu token context window!)

## Tech Stack

| Layer | Công nghệ | Lý do |
|-------|-----------|-------|
| Frontend | Next.js 14 + TypeScript | App Router, SSR, type-safe |
| Styling | Tailwind CSS | Tốc độ phát triển UI nhanh |
| Auth | NextAuth.js + bcryptjs | Tích hợp sẵn Next.js |
| Database | Prisma + SQLite | Đơn giản cho MVP |
| AI | Google Gemini 1.5 Flash | 1M token context, miễn phí tier rộng |
| Notifications | react-hot-toast | UX tốt |

## Cài đặt & Chạy

### 1. Clone & cài dependencies

```bash
git clone <repo>
cd storyforge-ai
npm install
```

### 2. Cấu hình môi trường

```bash
cp .env.example .env
```

Chỉnh file `.env`:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-random-secret-string-here"
GEMINI_API_KEY="your-key-from-aistudio.google.com"
```

> Lấy Gemini API key miễn phí tại: https://aistudio.google.com/app/apikey

### 3. Khởi tạo database

```bash
npm run db:push
```

### 4. Chạy development

```bash
npm run dev
```

Mở http://localhost:3000

---

## Tính năng MVP

### ✅ Đã hoàn thành
- [x] Đăng ký / Đăng nhập (email + password)
- [x] Dashboard quản lý dự án
- [x] Tạo dự án (tiêu đề, thể loại, tóm tắt, loại nội dung)
- [x] Quản lý nhân vật (Character Cards) — AI tự inject context
- [x] Tạo và quản lý chương
- [x] **Editor AI với Gemini** — 5 chế độ:
  - ▶️ Tiếp tục câu chuyện
  - ✏️ Viết đoạn mới theo gợi ý  
  - 🔄 Viết lại toàn bộ
  - 🎨 Tạo Comic Script (panel-by-panel)
  - 📋 Tóm tắt chương (để làm context)
- [x] Auto-save (3 giây sau khi ngừng gõ)
- [x] Zen Mode (chế độ tập trung)
- [x] Export TXT / JSON
- [x] Context injection tự động (nhân vật + chương trước)

### 🔄 Roadmap sau MVP
- [ ] Branching Storyline
- [ ] Consistency Checker
- [ ] Sinh ảnh (Stability AI / DALL-E)
- [ ] Export DOCX / EPUB
- [ ] Collaboration (co-author)

---

## Kiến trúc Context Engine

StoryForge AI tận dụng **Gemini 1.5 Flash với 1M token context window** — không cần Vector DB phức tạp trong MVP:

```
User request
     ↓
API Route (/api/ai/generate)
     ↓
Fetch: Project info + Characters + All previous chapters
     ↓
buildContextPrompt() → inject vào system prompt
     ↓
Gemini 1.5 Flash API call
     ↓
Stream/return generated text
     ↓
Optional: updateContext() → save summary
```

Điểm mấu chốt: Gemini nhớ **toàn bộ tác phẩm** trong một lần gọi API — không cần embedding hay vector search.

## Cấu trúc thư mục

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth + Register
│   │   ├── projects/      # CRUD projects
│   │   ├── chapters/      # CRUD chapters
│   │   ├── characters/    # CRUD characters
│   │   ├── ai/generate/   # Gemini AI endpoint
│   │   └── export/        # Export TXT/JSON
│   ├── auth/login|register/
│   ├── dashboard/
│   └── projects/[id]/
│       ├── page.tsx        # Project detail
│       └── chapters/[chapterId]/page.tsx  # AI Editor
├── components/
│   └── Layout/Sidebar.tsx
├── lib/
│   ├── prisma.ts           # DB client
│   ├── gemini.ts           # AI + Context Engine
│   └── auth.ts             # NextAuth config
└── types/index.ts
```
