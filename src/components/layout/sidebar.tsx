'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Megaphone,
  Gift,
  Sparkles,
  User,
  LogOut,
  ShieldCheck,
  Compass,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Logo } from '@/components/shared/logo'
import { logoutAction } from '@/modules/auth/actions/auth.actions'

type Role = 'user' | 'business_owner' | 'admin'

interface SidebarLink {
  href: string
  label: string
  icon: React.ElementType
  disabled?: boolean
}

const linksByRole: Record<Role, SidebarLink[]> = {
  user: [
    { href: '/panel', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/panel/explorar', label: 'Explorar', icon: Compass },
    { href: '/panel/perfil', label: 'Mi Perfil', icon: User },
  ],
  business_owner: [
    { href: '/panel', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/panel/negocio', label: 'Mi Negocio', icon: Store },
    { href: '/panel/anuncios', label: 'Anuncios', icon: Megaphone },
    { href: '/panel/incentivos', label: 'Incentivos', icon: Gift },
    { href: '/panel/ia', label: 'Centro IA', icon: Sparkles },
    { href: '/panel/perfil', label: 'Mi Perfil', icon: User },
  ],
  admin: [
    { href: '/panel', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/panel/negocio', label: 'Mi Negocio', icon: Store },
    { href: '/panel/anuncios', label: 'Anuncios', icon: Megaphone },
    { href: '/panel/incentivos', label: 'Incentivos', icon: Gift },
    { href: '/panel/ia', label: 'Centro IA', icon: Sparkles },
    { href: '/panel/admin', label: 'Admin', icon: ShieldCheck },
    { href: '/panel/perfil', label: 'Mi Perfil', icon: User },
  ],
}

const roleLabel: Record<Role, string> = {
  user: 'Usuario',
  business_owner: 'Negocio',
  admin: 'Admin',
}

const roleBadge: Record<Role, string> = {
  user: 'bg-brand-success-900/40 text-brand-success-300',
  business_owner: 'bg-brand-accent-900/40 text-brand-accent-300',
  admin: 'bg-brand-primary-900/40 text-brand-primary-300',
}

interface SidebarProps {
  role: Role
  userName: string
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const links = linksByRole[role]

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-card lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-5">
        <Link href="/">
          <Logo size="sm" />
        </Link>
      </div>

      {/* User info + role badge */}
      <div className="border-b border-slate-800 px-4 py-3">
        <p className="truncate text-sm font-medium text-white">{userName}</p>
        <span className={cn('mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider', roleBadge[role])}>
          {roleLabel[role]}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-0.5 p-3">
        {links.map((link) => {
          const isActive =
            link.href === '/panel' ? pathname === '/panel' : pathname.startsWith(link.href)

          if (link.disabled) {
            return (
              <span
                key={link.href}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted opacity-40"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                <span className="ml-auto text-[10px] uppercase tracking-wider">Pronto</span>
              </span>
            )
          }

          return (
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

      {/* Logout */}
      <div className="border-t border-slate-800 p-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-red-900/20 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
