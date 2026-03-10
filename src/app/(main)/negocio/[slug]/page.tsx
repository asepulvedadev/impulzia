import { notFound } from 'next/navigation'

// This route is handled by next.config.ts redirect: /negocio/:slug → /:slug
// This component should never be reached in practice.
export default function NegocioRedirectPage() {
  notFound()
}
