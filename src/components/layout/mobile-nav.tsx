'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Store, Gift, Sparkles, LogOut, Compass, ShieldCheck, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { logoutAction } from '@/modules/auth/actions/auth.actions'

type Role = 'user' | 'business_owner' | 'admin'

const navByRole: Record<Role, { href: string; label: string; icon: React.ElementType; exact?: boolean }[]> = {
  user: [
    { href: '/panel', label: 'Panel', icon: LayoutDashboard, exact: true },
    { href: '/panel/explorar', label: 'Explorar', icon: Compass },
  ],
  business_owner: [
    { href: '/panel', label: 'Panel', icon: LayoutDashboard, exact: true },
    { href: '/panel/negocio', label: 'Negocio', icon: Store },
    { href: '/panel/incentivos', label: 'Incentivos', icon: Gift },
    { href: '/panel/ia', label: 'IA', icon: Sparkles },
  ],
  admin: [
    { href: '/panel/admin', label: 'Admin', icon: ShieldCheck, exact: true },
    { href: '/panel/admin/usuarios', label: 'Usuarios', icon: Users },
    { href: '/panel/admin/negocios', label: 'Negocios', icon: Store },
    { href: '/panel/perfil', label: 'Perfil', icon: User },
  ],
}

export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname()
  const items = navByRole[role]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-card lg:hidden">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 items-center justify-center py-3 transition-colors',
                isActive ? 'text-brand-primary-400' : 'text-muted hover:text-foreground',
              )}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          )
        })}

        {/* Logout */}
        <form action={logoutAction} className="flex flex-1">
          <button
            type="submit"
            className="flex flex-1 items-center justify-center py-3 text-muted transition-colors hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </div>
    </nav>
  )
}
