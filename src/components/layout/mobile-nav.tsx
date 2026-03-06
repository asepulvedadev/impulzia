'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Store, Megaphone, Gift, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/panel', label: 'Panel', icon: LayoutDashboard },
  { href: '/panel/negocio', label: 'Negocio', icon: Store },
  { href: '/panel/anuncios', label: 'Anuncios', icon: Megaphone, disabled: true },
  { href: '/panel/incentivos', label: 'Incentivos', icon: Gift, disabled: true },
  { href: '/panel/ia', label: 'IA', icon: Sparkles, disabled: true },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-card-border bg-card lg:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === '/panel' ? pathname === '/panel' : pathname.startsWith(item.href)

          if (item.disabled) {
            return (
              <span
                key={item.href}
                className="flex flex-1 flex-col items-center gap-0.5 py-2 text-muted opacity-40"
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px]">{item.label}</span>
              </span>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors',
                isActive ? 'text-brand-primary-600' : 'text-muted hover:text-foreground',
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
