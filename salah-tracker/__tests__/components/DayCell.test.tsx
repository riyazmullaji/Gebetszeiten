import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DayCell from '@/components/DayCell'

vi.mock('next/link', () => ({
  default: ({ href, children, className, 'aria-label': ariaLabel }: {
    href: string
    children: React.ReactNode
    className?: string
    'aria-label'?: string
  }) => <a href={href} className={className} aria-label={ariaLabel}>{children}</a>,
}))

describe('DayCell', () => {
  it('renders the day number', () => {
    render(<DayCell dateStr="2026-01-15" dayNum={15} status="green" isToday={false} />)
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('renders a link for non-future days', () => {
    render(<DayCell dateStr="2026-01-15" dayNum={15} status="green" isToday={false} />)
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/day/2026-01-15')
  })

  it('renders a div (not a link) for future days', () => {
    render(<DayCell dateStr="2026-12-31" dayNum={31} status="future" isToday={false} />)
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('31')).toBeInTheDocument()
  })

  it('shows prayer time when provided and not compact', () => {
    render(
      <DayCell dateStr="2026-01-15" dayNum={15} status="green" isToday={false} prayerTime="04:23" />
    )
    expect(screen.getByText('04:23')).toBeInTheDocument()
  })

  it('hides prayer time in compact mode', () => {
    render(
      <DayCell
        dateStr="2026-01-15"
        dayNum={15}
        status="green"
        isToday={false}
        prayerTime="04:23"
        compact
      />
    )
    expect(screen.queryByText('04:23')).toBeNull()
  })

  it('does not show prayer time when prayerTime is null', () => {
    render(<DayCell dateStr="2026-01-15" dayNum={15} status="green" isToday={false} prayerTime={null} />)
    // Only day number should be visible
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.queryByText('null')).toBeNull()
  })

  it('applies today ring class when isToday is true', () => {
    render(<DayCell dateStr="2026-06-27" dayNum={27} status="green" isToday />)
    const el = screen.getByRole('link')
    expect(el.className).toContain('ring-2')
  })

  it('does not apply today ring when isToday is false', () => {
    render(<DayCell dateStr="2026-01-15" dayNum={15} status="green" isToday={false} />)
    const el = screen.getByRole('link')
    expect(el.className).not.toContain('ring-2')
  })

  it('renders green status with emerald classes', () => {
    render(<DayCell dateStr="2026-01-15" dayNum={15} status="green" isToday={false} />)
    const el = screen.getByRole('link')
    expect(el.className).toContain('emerald')
  })

  it('renders red status with red classes', () => {
    render(<DayCell dateStr="2026-01-15" dayNum={15} status="red" isToday={false} />)
    const el = screen.getByRole('link')
    expect(el.className).toContain('red')
  })
})
