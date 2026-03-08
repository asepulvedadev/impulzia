import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { DevCredentials } from '@/components/shared/dev-credentials'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
      {process.env.NODE_ENV === 'development' && <DevCredentials />}
    </div>
  )
}
