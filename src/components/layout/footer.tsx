import { Globe, Send } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { Input } from '@/components/ui'

const footerLinks = {
  Producto: [
    { label: 'Marketplace', href: '#' },
    { label: 'Marketing IA', href: '#' },
    { label: 'Fidelización', href: '#' },
    { label: 'Precios', href: '#' },
  ],
  Compañía: [
    { label: 'Sobre nosotros', href: '#' },
    { label: 'Casos de éxito', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contacto', href: '#' },
  ],
  Soporte: [
    { label: 'Centro de ayuda', href: '#' },
    { label: 'Documentación API', href: '#' },
    { label: 'Estado', href: '#' },
    { label: 'Comunidad', href: '#' },
  ],
  Legal: [
    { label: 'Términos', href: '#' },
    { label: 'Privacidad', href: '#' },
    { label: 'Cookies', href: '#' },
    { label: 'Seguridad', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-20 text-slate-400">
      <div className="mx-auto max-w-7xl px-6 lg:px-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand + Newsletter — spans 2 cols */}
          <div className="sm:col-span-2">
            <Logo size="md" />
            <p className="mt-4 text-sm leading-relaxed">
              La plataforma digital que impulsa el comercio local con inteligencia artificial.
            </p>
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold tracking-wider text-slate-300 uppercase">
                Newsletter
              </p>
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="h-10 rounded-r-none border-slate-700 bg-slate-900 text-sm text-white placeholder:text-slate-500 focus-visible:ring-brand-primary-500"
                />
                <button
                  type="button"
                  className="inline-flex items-center rounded-r-lg bg-brand-primary-600 px-3 text-white transition-colors hover:bg-brand-primary-700"
                  aria-label="Suscribirse"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm transition-colors hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <div className="flex items-center gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Rcomienda. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="text-slate-500 transition-colors hover:text-white"
                aria-label="Website"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="text-slate-500 transition-colors hover:text-white"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-slate-500 transition-colors hover:text-white"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
            Hecho en Cúcuta 🇨🇴
          </span>
        </div>
      </div>
    </footer>
  )
}
