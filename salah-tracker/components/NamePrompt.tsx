'use client'

import { useState } from 'react'

interface Props {
  onConfirm: (name: string, observerId: string) => void
}

export default function NamePrompt({ onConfirm }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/observers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) throw new Error('Profil konnte nicht erstellt werden')
      const { id } = await res.json()
      localStorage.setItem('observerName', trimmed)
      localStorage.setItem('observerId', id)
      onConfirm(trimmed, id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-2xl p-6 space-y-5">
        {/* Handle */}
        <div className="flex justify-center sm:hidden -mt-2">
          <div className="w-8 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="space-y-1 pt-1">
          <h2 className="text-lg font-semibold text-gray-900">Assalamualaikum, Akhi</h2>
          <p className="text-sm text-gray-500">
            Bitte gib deinen Namen ein, um fortzufahren.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dein Name"
            autoFocus
            maxLength={60}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-40 transition-colors"
          >
            {loading ? 'Einen Moment…' : 'Weiter'}
          </button>
        </form>
      </div>
    </div>
  )
}
