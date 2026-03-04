import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session?.user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-sf-bg overflow-hidden">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-sf-border/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">SF</div>
          <span className="text-xl font-bold gradient-text">Story AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sf-subtext hover:text-sf-text transition-colors px-4 py-2">Đăng nhập</Link>
          <Link href="/auth/register" className="bg-sf-primary hover:bg-sf-primary-dark text-white px-5 py-2 rounded-lg transition-colors font-medium">Bắt đầu miễn phí</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-6xl mx-auto px-8">
        <div className="text-center pt-24 pb-16">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-blue-300">Powered by AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="text-sf-text">Sáng tác </span>
            <span className="gradient-text">thông minh</span>
            <br />
            <span className="text-sf-text">AI nhớ </span>
            <span className="gradient-text">mọi chi tiết</span>
          </h1>
          
          <p className="text-xl text-sf-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Viết truyện, tiểu thuyết, truyện tranh, kịch bản - AI tự động giữ ngữ cảnh, 
            nhớ nhân vật, theo dõi cốt truyện xuyên suốt tác phẩm của bạn.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/register" className="bg-sf-primary hover:bg-sf-primary-dark text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/25">
              Bắt đầu sáng tác ngay
            </Link>
            <Link href="/auth/login" className="border border-sf-border text-sf-subtext hover:text-sf-text hover:border-sf-primary/50 px-8 py-4 rounded-xl text-lg transition-all">
              Đăng nhập
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-16">
          {[
            {
              icon: '🧠',
              title: 'Giữ ngữ cảnh',
              desc: 'Nhớ toàn bộ câu chuyện — từ chương 1 đến chương 100, không bao giờ quên chi tiết.'
            },
            {
              icon: '👥',
              title: 'Character Memory Cards',
              desc: 'Tạo thẻ nhân vật một lần, AI tự động tham chiếu tính cách, ngoại hình trong mọi đoạn được sinh ra.'
            },
            {
              icon: '📖',
              title: 'Đa thể loại nội dung',
              desc: 'Truyện, tiểu thuyết, kịch bản truyện tranh, script video - tất cả trên một nền tảng duy nhất.'
            },
            {
              icon: '✅',
              title: 'Kiểm tra nhất quán',
              desc: 'AI tự phát hiện mâu thuẫn: nhân vật đã chết ở chương 3 không thể xuất hiện ở chương 8.'
            },
            {
              icon: '🌿',
              title: 'Branching Storyline',
              desc: 'Tạo nhánh câu chuyện song song: "Nếu nhân vật A không chết thì sao?" AI tiếp tục từng nhánh độc lập.'
            },
            {
              icon: '📤',
              title: 'Export đa định dạng',
              desc: 'Xuất tác phẩm ra TXT, DOCX, hoặc JSON.'
            },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-sf-text font-semibold mb-2 group-hover:text-blue-400 transition-colors">{f.title}</h3>
              <p className="text-sf-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center py-16 border-t border-sf-border/30">
          <p className="text-sf-muted mb-6">Bắt đầu tác phẩm đầu tiên của bạn ngay</p>
          <Link href="/auth/register" className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg">
            Tạo tài khoản miễn phí →
          </Link>
        </div>
      </main>
    </div>
  )
}
