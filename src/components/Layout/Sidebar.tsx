'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="w-64 bg-sf-surface border-r border-sf-border flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="p-5 border-b border-sf-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">SF</div>
          <span className="text-lg font-bold gradient-text">Story AI</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname === item.href
                ? 'bg-sf-primary/15 text-sf-primary border border-sf-primary/20'
                : 'text-sf-muted hover:text-sf-text hover:bg-sf-elevated'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-sf-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
            {session?.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sf-text truncate">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-sf-muted truncate">{session?.user?.email}</p>
          </div>
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">Pro</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full text-left text-xs text-sf-muted hover:text-sf-danger transition-colors px-2 py-1"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
