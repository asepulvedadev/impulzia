'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, UserCircle2, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { UserMenu } from '@/components/layout/user-menu'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils/cn'

const navLinks = [
  { href: '/ofertas', label: 'Ofertas' },
  { href: '#negocios', label: 'Para Negocios' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      {/* Floating pill container */}
      <div className="w-full max-w-4xl">
        <nav className="flex h-14 items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-900/80 px-4 shadow-lg shadow-black/30 backdrop-blur-xl">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav links — centered */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {!isLoading && isAuthenticated ? (
              <UserMenu />
            ) : !isLoading ? (
              <Link
                href="/login"
                className="group flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 transition-all hover:border-brand-primary-600 hover:bg-slate-700 hover:text-white"
              >
                <UserCircle2 className="h-4 w-4 text-brand-primary-400 transition-colors group-hover:text-brand-primary-300" />
                <span>Acceder</span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </Link>
            ) : null}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white md:hidden"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300',
            mobileOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <div className="mt-2 rounded-2xl border border-slate-700/60 bg-slate-900/90 p-3 shadow-lg shadow-black/30 backdrop-blur-xl">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {!isAuthenticated && !isLoading && (
              <div className="mt-3 border-t border-slate-800 pt-3">
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primary-500"
                  onClick={() => setMobileOpen(false)}
                >
                  <UserCircle2 className="h-4 w-4" />
                  Ingresar o Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
