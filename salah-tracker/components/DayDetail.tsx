'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { NearestByPrayer, Observation, Prayer } from '@/types'
import { formatDateDE, formatTime } from '@/lib/utils'
import EntryForm from './EntryForm'
import NamePrompt from './NamePrompt'

const SKY_LABEL: Record<string, string> = {
  clear: 'Klar',
  hazy: 'Diesig',
  partly_cloudy: 'Bewölkt',
}

interface Props {
  date: string
  initialObservations: Observation[]
  nearestByPrayer: NearestByPrayer
}

export default function DayDetail({ date, initialObservations, nearestByPrayer }: Props) {
  const router = useRouter()
  const [observations, setObservations] = useState(initialObservations)
  const [activePrayer, setActivePrayer] = useState<Prayer>('isha')
  const [showForm, setShowForm] = useState(false)
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [observerName, setObserverName] = useState('')
  const [observerId, setObserverId] = useState('')
  const [adminSecret, setAdminSecret] = useState('')

  useEffect(() => {
    setObserverName(localStorage.getItem('observerName') ?? '')
    setObserverId(localStorage.getItem('observerId') ?? '')
    setAdminSecret(localStorage.getItem('adminSecret') ?? '')
  }, [])

  const displayed = observations.filter(o => o.prayer === activePrayer)
  const isAdmin = !!adminSecret

  function handleAddEntry() {
    if (!observerName || !observerId) {
      setShowNamePrompt(true)
    } else {
      setShowForm(true)
    }
  }

  function handleNameConfirm(name: string, id: string) {
    setObserverName(name)
    setObserverId(id)
    setShowNamePrompt(false)
    setShowForm(true)
  }

  function handleObserverInvalid() {
    localStorage.removeItem('observerName')
    localStorage.removeItem('observerId')
    setObserverName('')
    setObserverId('')
    setShowForm(false)
    setShowNamePrompt(true)
  }

  function handleSuccess(newObs: Observation) {
    const withName: Observation = {
      ...newObs,
      observers: { id: observerId, name: observerName, created_at: '' },
    }
    setObservations(prev => [...prev, withName])
    setShowForm(false)
    setShowSuccess(true)
    router.refresh()
    setTimeout(() => setShowSuccess(false), 3000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Eintrag löschen?')) return
    const res = await fetch(`/api/observations/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-secret': adminSecret },
    })
    if (res.status === 401) {
      alert('Falsches Admin-Passwort. Bitte /admin aufrufen und neu eingeben.')
      return
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      alert(`Fehler beim Löschen: ${body.error ?? res.status}`)
      return
    }
    setObservations(prev => prev.filter(o => o.id !== id))
    router.refresh()
  }

  async function handleInvalidate(id: string) {
    if (!confirm('Eintrag als ungültig markieren?')) return
    const res = await fetch(`/api/observations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
      body: JSON.stringify({ is_invalidated: true }),
    })
    if (res.status === 401) {
      alert('Falsches Admin-Passwort. Bitte /admin aufrufen und neu eingeben.')
      return
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      alert(`Fehler: ${body.error ?? res.status}`)
      return
    }
    setObservations(prev =>
      prev.map(o => (o.id === id ? { ...o, is_invalidated: true } : o))
    )
    router.refresh()
  }

  return (
    <>
      <div className="min-h-screen bg-surface flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-border px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button
              onClick={() => { if (window.history.length > 1) router.back(); else router.push('/') }}
              className="text-gray-400 hover:text-gray-700 transition-colors p-1 -ml-1 rounded-lg"
              aria-label="Zurück"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-gray-900 text-base leading-tight truncate">
                {formatDateDE(date)}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Nürnberg 2026</p>
            </div>
            {observerName && (
              <span className="text-xs text-gray-400 shrink-0 hidden sm:block">
                {observerName}
              </span>
            )}
          </div>
        </div>

        {/* Prayer toggle */}
        <div className="bg-white border-b border-border px-4 py-3">
          <div className="max-w-2xl mx-auto flex gap-2">
            {(['fajr', 'isha'] as Prayer[]).map(p => (
              <button
                key={p}
                onClick={() => setActivePrayer(p)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePrayer === p
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {p === 'fajr' ? 'Fajr' : 'Isha'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
          {displayed.length === 0 ? (
            /* Empty state — button centered */
            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 py-16">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Noch kein Eintrag</p>
                <p className="text-gray-400 text-sm">Sei der Erste, der eine Zeit aufzeichnet.</p>
              </div>
              <button
                onClick={handleAddEntry}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl px-8 py-3 text-sm transition-colors active:scale-[0.98]"
              >
                Eintrag hinzufügen
              </button>
            </div>
          ) : (
            <>
              {/* Entries list */}
              <div className="flex-1 px-4 py-4 space-y-3">
                {displayed.map(obs => (
                  <ObservationCard
                    key={obs.id}
                    obs={obs}
                    isAdmin={isAdmin}
                    onDelete={handleDelete}
                    onInvalidate={handleInvalidate}
                  />
                ))}
              </div>

              {/* Add button — bottom */}
              <div className="px-4 pb-8 pt-2">
                <button
                  onClick={handleAddEntry}
                  className="w-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl py-3 text-sm transition-colors"
                >
                  + Weiteren Eintrag hinzufügen
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Jazakallahu Khair toast */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg">
            Jazakallahu Khair
          </div>
        </div>
      )}

      {showNamePrompt && (
        <NamePrompt onConfirm={handleNameConfirm} />
      )}

      {showForm && (
        <EntryForm
          date={date}
          prayer={activePrayer}
          observerName={observerName}
          observerId={observerId}
          nearest={nearestByPrayer[activePrayer]}
          onSuccess={handleSuccess}
          onObserverInvalid={handleObserverInvalid}
          onCancel={() => setShowForm(false)}
        />
      )}
    </>
  )
}

/* ─── ObservationCard ─────────────────────────────────────────── */

function ObservationCard({
  obs,
  isAdmin,
  onDelete,
  onInvalidate,
}: {
  obs: Observation
  isAdmin: boolean
  onDelete: (id: string) => void
  onInvalidate: (id: string) => void
}) {
  return (
    <div className={`bg-white rounded-2xl border border-border shadow-sm overflow-hidden ${obs.is_invalidated ? 'opacity-40' : ''}`}>
      {/* Time + type row */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-2xl font-light tabular-nums tracking-tight text-gray-900">
          {formatTime(obs.observed_time)}
        </span>
        <div className="flex items-center gap-2">
          {obs.is_invalidated && (
            <span className="text-xs bg-red-50 text-red-500 border border-red-100 rounded-full px-2 py-0.5">
              Ungültig
            </span>
          )}
          <span className={`text-xs rounded-full px-2.5 py-1 font-medium ${
            obs.entry_type === 'observed'
              ? 'bg-emerald-500/10 text-emerald-700'
              : 'bg-amber-400/10 text-amber-700'
          }`}>
            {obs.entry_type === 'observed' ? 'Beobachtet' : 'Interpoliert'}
          </span>
        </div>
      </div>

      {/* Meta row */}
      <div className="px-4 pb-3 flex items-center gap-2 text-sm text-gray-500">
        <span className="font-medium text-gray-700">{obs.observers?.name ?? 'Unbekannt'}</span>
        {obs.sky_condition && (
          <>
            <span className="text-gray-300">·</span>
            <span>{SKY_LABEL[obs.sky_condition]}</span>
          </>
        )}
      </div>

      {obs.notes && (
        <div className="mx-4 mb-3 px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-600 leading-relaxed">
          {obs.notes}
        </div>
      )}

      {obs.photo_url && (
        <div className="relative h-48 mx-4 mb-3 rounded-xl overflow-hidden bg-gray-100">
          <Image src={obs.photo_url} alt="Himmelsfoto" fill className="object-cover" />
        </div>
      )}

      {isAdmin && !obs.is_invalidated && (
        <div className="flex gap-2 px-4 pb-3 pt-1 border-t border-gray-50">
          <button
            onClick={() => onInvalidate(obs.id)}
            className="text-xs text-amber-600 hover:text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
          >
            Als ungültig markieren
          </button>
          <button
            onClick={() => onDelete(obs.id)}
            className="text-xs text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Löschen
          </button>
        </div>
      )}
    </div>
  )
}
