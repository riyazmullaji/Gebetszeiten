'use client'

import { useState } from 'react'
import type { EntryType, NearestObserved, Observation, Prayer, SkyCondition } from '@/types'
import InterpolationHint from './InterpolationHint'

interface Props {
  date: string
  prayer: Prayer
  observerName: string
  observerId: string
  nearest: NearestObserved
  onSuccess: (obs: Observation) => void
  onObserverInvalid: () => void
  onCancel: () => void
}

export default function EntryForm({
  date,
  prayer,
  observerName,
  observerId,
  nearest,
  onSuccess,
  onObserverInvalid,
  onCancel,
}: Props) {
  const [entryType, setEntryType] = useState<EntryType>('observed')
  const [observedTime, setObservedTime] = useState('')
  const [skyCondition, setSkyCondition] = useState<SkyCondition>('clear')
  const [notes, setNotes] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  async function uploadPhoto(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('date', date)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Foto-Upload fehlgeschlagen')
    const { url } = await res.json()
    return url
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!observedTime) return
    setLoading(true)
    setError('')

    try {
      let photo_url: string | null = null
      if (photoFile) photo_url = await uploadPhoto(photoFile)

      const res = await fetch('/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          prayer,
          observed_time: observedTime,
          entry_type: entryType,
          sky_condition: entryType === 'observed' ? skyCondition : null,
          notes: notes.trim() || null,
          photo_url,
          observer_id: observerId,
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        const msg: string = body.error ?? 'Fehler beim Speichern'
        if (msg.includes('foreign key') || msg.includes('observer_id')) {
          onObserverInvalid()
          return
        }
        throw new Error(msg)
      }

      const newObs: Observation = await res.json()
      onSuccess(newObs)
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
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-8 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3">
          <div>
            <h2 className="font-semibold text-gray-900 text-base">Eintrag hinzufügen</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {dateLabel} · <span className="font-medium text-gray-600">{prayer === 'fajr' ? 'Fajr' : 'Isha'}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Als: <span className="text-gray-600 font-medium">{observerName}</span></p>
          </div>
          <button onClick={onCancel} className="text-gray-300 hover:text-gray-500 p-1 rounded-lg transition-colors -mr-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-px bg-gray-100" />

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 overflow-y-auto max-h-[70vh]">

          {/* Entry type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Eintragstyp
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { val: 'observed', label: 'Beobachtet' },
                { val: 'interpolated', label: 'Interpoliert' },
              ] as { val: EntryType; label: string }[]).map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setEntryType(val)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    entryType === val
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Interpolation reference */}
          {entryType === 'interpolated' && (
            <InterpolationHint prev={nearest.prev} next={nearest.next} />
          )}

          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Uhrzeit *
            </label>
            <input
              type="time"
              value={observedTime}
              onChange={(e) => setObservedTime(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            />
          </div>

          {/* Sky condition */}
          {entryType === 'observed' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Himmelszustand
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { val: 'clear', label: 'Klar' },
                  { val: 'hazy', label: 'Diesig' },
                  { val: 'partly_cloudy', label: 'Bewölkt' },
                ] as { val: SkyCondition; label: string }[]).map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSkyCondition(val)}
                    className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                      skyCondition === val
                        ? 'bg-gold-50 text-gold-700 border-gold-300'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Notizen <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="z.B. beobachtet vom Dach der Moschee…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none bg-white placeholder:text-gray-300"
            />
          </div>

          {/* Photo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Foto <span className="normal-case font-normal">(optional)</span>
            </label>
            <label className="flex items-center gap-3 border border-dashed border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-gray-400">
                {photoFile ? photoFile.name : 'Foto auswählen'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3 border border-red-100">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1 pb-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!observedTime || loading}
              className="flex-1 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold disabled:opacity-40 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Speichern…
                </span>
              ) : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
