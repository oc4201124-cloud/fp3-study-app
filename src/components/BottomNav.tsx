'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/', label: 'ホーム', icon: '🏠' },
  { href: '/quiz', label: 'クイズ', icon: '📝' },
  { href: '/calendar', label: '30日', icon: '📅' },
  { href: '/review', label: '苦手', icon: '⚠️' },
  { href: '/progress', label: '進捗', icon: '📊' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto flex">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 text-xs ${
                active ? 'text-blue-600 font-bold' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{icon}</span>
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
