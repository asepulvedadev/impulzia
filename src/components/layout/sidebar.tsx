'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Store, Megaphone, Gift, Sparkles, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SidebarLink {
  href: string
  label: string
  icon: React.ElementType
  disabled?: boolean
}

const sidebarLinks: SidebarLink[] = [
  { href: '/panel', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/panel/negocio', label: 'Mi Negocio', icon: Store },
  { href: '/panel/anuncios', label: 'Anuncios', icon: Megaphone },
  { href: '/panel/incentivos', label: 'Incentivos', icon: Gift },
  { href: '/panel/ia', label: 'Centro IA', icon: Sparkles, disabled: true },
  { href: '/panel/perfil', label: 'Mi Perfil', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-card lg:block">
      <nav className="space-y-1 p-4">
        {sidebarLinks.map((link) => {
          const isActive =
            link.href === '/panel' ? pathname === '/panel' : pathname.startsWith(link.href)
          return link.disabled ? (
            <span
              key={link.href}
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted opacity-50"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
              <span className="ml-auto text-[10px] uppercase tracking-wider">Pronto</span>
            </span>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-primary-900/20 text-brand-primary-300'
                  : 'text-muted hover:bg-slate-800 hover:text-foreground',
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
