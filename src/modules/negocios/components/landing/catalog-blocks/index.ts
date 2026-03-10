import type { ComponentType } from 'react'
import type { CatalogSection } from '@/modules/negocios/interfaces'
import { MenuBlock } from './menu-block'
import { ProductsBlock } from './products-block'
import { ServicesBlock } from './services-block'

export interface CatalogBlockProps {
  sections: CatalogSection[]
  brandPrimary: string
  isOwner: boolean
}

const REGISTRY: Record<string, ComponentType<CatalogBlockProps>> = {
  restaurantes:              MenuBlock,
  cafeterias:                MenuBlock,
  'tiendas-de-ropa':         ProductsBlock,
  hogar:                     ProductsBlock,
  mascotas:                  ProductsBlock,
  deportes:                  ProductsBlock,
  'servicios-profesionales': ServicesBlock,
  'belleza-y-salud':         ServicesBlock,
  automotriz:                ServicesBlock,
  tecnologia:                ServicesBlock,
  educacion:                 ServicesBlock,
  entretenimiento:           ServicesBlock,
}

export function getCatalogBlock(categorySlug: string | null | undefined): ComponentType<CatalogBlockProps> {
  return REGISTRY[categorySlug ?? ''] ?? ServicesBlock
}
