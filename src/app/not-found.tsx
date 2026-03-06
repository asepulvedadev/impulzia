import Link from 'next/link'
import { Button } from '@/components/ui'
import { Logo } from '@/components/shared/logo'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Logo size="md" className="mb-8" />
      <h1 className="font-heading text-6xl font-extrabold text-brand-primary-600">404</h1>
      <p className="mt-4 text-lg text-slate-300">La pagina que buscas no existe</p>
      <Button className="mt-8" asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}
