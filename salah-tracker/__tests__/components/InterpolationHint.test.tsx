import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import InterpolationHint from '@/components/InterpolationHint'

describe('InterpolationHint', () => {
  it('renders nothing when both prev and next are null', () => {
    const { container } = render(<InterpolationHint prev={null} next={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows the prev time when only prev is provided', () => {
    render(
      <InterpolationHint
        prev={{ date: '2026-06-10', observed_time: '04:15:00' }}
        next={null}
      />
    )
    expect(screen.getByText('04:15')).toBeInTheDocument()
  })

  it('shows the next time when only next is provided', () => {
    render(
      <InterpolationHint
        prev={null}
        next={{ date: '2026-06-20', observed_time: '04:30:00' }}
      />
    )
    expect(screen.getByText('04:30')).toBeInTheDocument()
  })

  it('shows both times when both are provided', () => {
    render(
      <InterpolationHint
        prev={{ date: '2026-06-10', observed_time: '04:10:00' }}
        next={{ date: '2026-06-20', observed_time: '04:35:00' }}
      />
    )
    expect(screen.getByText('04:10')).toBeInTheDocument()
    expect(screen.getByText('04:35')).toBeInTheDocument()
  })

  it('shows the "Referenzzeiten" heading when content is present', () => {
    render(
      <InterpolationHint
        prev={{ date: '2026-06-10', observed_time: '04:10:00' }}
        next={null}
      />
    )
    expect(screen.getByText('Referenzzeiten')).toBeInTheDocument()
  })

  it('displays times in HH:MM format (strips seconds)', () => {
    render(
      <InterpolationHint
        prev={{ date: '2026-06-10', observed_time: '04:07:59' }}
        next={null}
      />
    )
    expect(screen.getByText('04:07')).toBeInTheDocument()
    expect(screen.queryByText('04:07:59')).toBeNull()
  })
})
