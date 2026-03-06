import { Eye, BarChart3, Ticket, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'

const stats = [
  { label: 'Visitantes del perfil', value: '0', icon: Eye, change: null },
  { label: 'Impresiones', value: '0', icon: BarChart3, change: null },
  { label: 'Cupones canjeados', value: '0', icon: Ticket, change: null },
  { label: 'Calificación', value: '-', icon: Star, change: null },
]

export function BusinessStatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-lg bg-brand-primary-900/20 p-2.5">
              <stat.icon className="h-5 w-5 text-brand-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
