# Story AI

Website hỗ trợ sáng tác nội dung với AI - tự động giữ ngữ cảnh toàn tác phẩm.

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | Next.js 14 + TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js + bcryptjs |
| Database | Prisma + PosgreSQL |
| Notifications | react-hot-toast |

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

## Kiến trúc Context Engine


```
User request
     ↓
API Route (/api/ai/generate)
     ↓
Fetch: Project info + Characters + All previous chapters
     ↓
buildContextPrompt() → inject vào system prompt
     ↓
Gemini API Call
     ↓
Stream/return generated text
     ↓
Optional: updateContext() → save summary
```


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
