'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminPage() {
  const router = useRouter()
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = secret.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: trimmed }),
      })

      if (res.status === 401) {
        setError('Falsches Passwort. Bitte erneut versuchen.')
        return
      }
      if (!res.ok) {
        setError('Server-Fehler. Ist ADMIN_SECRET in .env.local gesetzt?')
        return
      }

      localStorage.setItem('adminSecret', trimmed)
      setSaved(true)
      setTimeout(() => router.push('/'), 1200)
    } catch {
      setError('Verbindungsfehler.')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    localStorage.removeItem('adminSecret')
    localStorage.removeItem('observerName')
    localStorage.removeItem('observerId')
    setSaved(false)
    setSecret('')
    setError('')
    alert('Lokale Daten gelöscht.')
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-border w-full max-w-sm p-6 space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-lg font-semibold text-gray-900">Admin-Zugang</h1>
          <p className="text-sm text-gray-400">
            Passwort eingeben um Einträge verwalten zu können.
          </p>
        </div>

        {saved ? (
          <div className="text-center text-emerald-600 font-medium py-4 text-sm">
            Passwort bestätigt. Weiterleitung…
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <input
              type="password"
              value={secret}
              onChange={(e) => { setSecret(e.target.value); setError('') }}
              placeholder="Admin-Passwort"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              autoComplete="current-password"
              autoFocus
            />

            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2.5 border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!secret.trim() || loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl py-3 text-sm disabled:opacity-40 transition-colors"
            >
              {loading ? 'Wird geprüft…' : 'Bestätigen'}
            </button>
          </form>
        )}

        <div className="border-t border-gray-100 pt-3 space-y-1">
          <button
            onClick={handleClear}
            className="w-full text-sm text-red-400 hover:text-red-600 py-2 transition-colors"
          >
            Alle lokalen Daten löschen
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    </div>
  )
}
