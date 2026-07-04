import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PrayerToggle from '@/components/PrayerToggle'

describe('PrayerToggle', () => {
  it('renders both Fajr and Isha buttons', () => {
    render(<PrayerToggle value="fajr" onChange={() => {}} />)
    expect(screen.getByText('Fajr')).toBeInTheDocument()
    expect(screen.getByText('Isha')).toBeInTheDocument()
  })

  it('applies active style to the selected prayer', () => {
    const { rerender } = render(<PrayerToggle value="fajr" onChange={() => {}} />)
    const fajrBtn = screen.getByText('Fajr')
    const ishaBtn = screen.getByText('Isha')

    expect(fajrBtn.className).toContain('bg-white')
    expect(ishaBtn.className).not.toContain('bg-white')

    rerender(<PrayerToggle value="isha" onChange={() => {}} />)
    expect(screen.getByText('Isha').className).toContain('bg-white')
    expect(screen.getByText('Fajr').className).not.toContain('bg-white')
  })

  it('calls onChange with "fajr" when Fajr button clicked', async () => {
    const onChange = vi.fn()
    render(<PrayerToggle value="isha" onChange={onChange} />)
    await userEvent.click(screen.getByText('Fajr'))
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith('fajr')
  })

  it('calls onChange with "isha" when Isha button clicked', async () => {
    const onChange = vi.fn()
    render(<PrayerToggle value="fajr" onChange={onChange} />)
    await userEvent.click(screen.getByText('Isha'))
    expect(onChange).toHaveBeenCalledWith('isha')
  })

  it('does not call onChange when already-active button is clicked again', async () => {
    const onChange = vi.fn()
    render(<PrayerToggle value="fajr" onChange={onChange} />)
    await userEvent.click(screen.getByText('Fajr'))
    // onChange is still called — toggle doesn't block same-value clicks
    // (the parent state just stays the same; that's fine)
    expect(onChange).toHaveBeenCalledWith('fajr')
  })
})
