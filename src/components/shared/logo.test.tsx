import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Logo } from './logo'

describe('Logo component', () => {
  it('renders IKARUS text', () => {
    render(<Logo />)
    expect(screen.getByText('IMPULZ')).toBeInTheDocument()
    expect(screen.getByText('IA')).toBeInTheDocument()
  })

  it('applies size classes', () => {
    const { container } = render(<Logo size="lg" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toBeTruthy()
  })

  it('renders Zap icon when collapsed', () => {
    const { container } = render(<Logo collapsed />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('applies collapsed classes when collapsed is true', () => {
    const { container } = render(<Logo collapsed />)
    const textWrapper = container.querySelector('[data-testid="logo-text"]')
    expect(textWrapper).toHaveClass('max-w-0')
    expect(textWrapper).toHaveClass('opacity-0')
  })

  it('applies expanded classes when collapsed is false', () => {
    const { container } = render(<Logo collapsed={false} />)
    const textWrapper = container.querySelector('[data-testid="logo-text"]')
    expect(textWrapper).toHaveClass('opacity-100')
  })
})
