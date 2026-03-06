'use client'

import Link from 'next/link'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { LayoutDashboard, User, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { useAuth } from '@/hooks/use-auth'
import { logoutAction } from '@/modules/auth/actions/auth.actions'

export function UserMenu() {
  const { profile, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-slate-700" />
  }

  if (!isAuthenticated) {
    return null
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2">
          <Avatar className="h-8 w-8">
            {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={initials} />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[200px] rounded-xl border border-slate-800 bg-card p-1 shadow-lg"
          sideOffset={8}
          align="end"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium">{profile?.full_name || 'Usuario'}</p>
            <p className="text-xs text-muted">{profile?.email}</p>
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-slate-800" />

          <DropdownMenu.Item asChild>
            <Link
              href="/panel"
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none hover:bg-brand-primary-900/20"
            >
              <LayoutDashboard className="h-4 w-4" />
              Mi Panel
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href="/panel/perfil"
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none hover:bg-brand-primary-900/20"
            >
              <User className="h-4 w-4" />
              Mi Perfil
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-slate-800" />

          <DropdownMenu.Item asChild>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </form>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
