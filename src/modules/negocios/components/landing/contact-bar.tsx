import { Phone, Mail, Globe, MapPin, MessageCircle } from 'lucide-react'
import { formatWhatsAppLink } from '@/lib/utils/format'
import type { SocialLinks } from '@/modules/negocios/interfaces'

interface ContactBarProps {
  phone: string | null
  whatsapp: string | null
  email: string | null
  website: string | null
  address: string | null
  neighborhood: string | null
  city: string | null
  socialLinks: SocialLinks
  brandPrimary: string
  brandSecondary: string
}

export function ContactBar({
  phone, whatsapp, email, website, address, neighborhood, city,
  socialLinks, brandPrimary, brandSecondary,
}: ContactBarProps) {
  const location = [address, neighborhood, city].filter(Boolean).join(', ')
  const mapsUrl = location
    ? `https://maps.google.com/?q=${encodeURIComponent(location)}`
    : null

  void brandPrimary

  return (
    <div style={{ background: brandSecondary }} className="border-b border-white/10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
        {whatsapp && (
          <a
            href={formatWhatsAppLink(whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-green-600/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-500"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        )}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
          >
            <Phone className="h-3.5 w-3.5" />
            {phone}
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
          >
            <Mail className="h-3.5 w-3.5" />
            {email}
          </a>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
          >
            <Globe className="h-3.5 w-3.5" />
            Sitio web
          </a>
        )}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
          >
            <MapPin className="h-3.5 w-3.5" />
            {neighborhood ?? city ?? 'Ver mapa'}
          </a>
        )}
        {/* Social links */}
        {socialLinks.instagram && (
          <a
            href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
          >
            Instagram
          </a>
        )}
        {socialLinks.facebook && (
          <a
            href={socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
          >
            Facebook
          </a>
        )}
      </div>
    </div>
  )
}
