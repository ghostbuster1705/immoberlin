import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createListing } from '../api'
import { DISTRICTS } from '../constants'

type ListingDraft = {
  title: string
  district: string
  address: string
  price_month: string
  rooms: string
  size_m2: string
  available_from: string
  available_until: string
  is_furnished: boolean
  rules_pets: boolean
  rules_smoking: boolean
  rules_notes: string
  description: string
}

const initialDraft: ListingDraft = {
  title: '',
  district: DISTRICTS[0],
  address: '',
  price_month: '',
  rooms: '1',
  size_m2: '',
  available_from: '',
  available_until: '',
  is_furnished: false,
  rules_pets: false,
  rules_smoking: false,
  rules_notes: '',
  description: '',
}

export function PostListingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState(initialDraft)
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const previewUrls = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos])

  const onPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []).slice(0, 5)
    setPhotos(selected)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const form = new FormData()
      form.append('title', draft.title)
      form.append('district', draft.district)
      form.append('address', draft.address)
      form.append('price_month', draft.price_month)
      form.append('rooms', draft.rooms)
      form.append('size_m2', draft.size_m2)
      form.append('available_from', draft.available_from)
      form.append('available_until', draft.available_until)
      form.append('description', draft.description)
      form.append('is_furnished', String(draft.is_furnished))
      form.append(
        'rules',
        JSON.stringify({
          pets: draft.rules_pets,
          smoking: draft.rules_smoking,
          notes: draft.rules_notes,
        }),
      )

      photos.forEach((photo) => {
        form.append('photos', photo)
      })

      await createListing(form)
      navigate('/dashboard?posted=1')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to post listing')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-xl border border-white/10 bg-[var(--card)] p-4 md:p-6">
      <header>
        <h1 className="text-3xl font-black text-white">Post your listing</h1>
        <p className="mt-1 text-slate-300">Your flat, your rules, your tenant.</p>
      </header>

      <Progress step={step} />

      {step === 1 && (
        <section className="grid gap-3">
          <input
            required
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            className="min-h-11 rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
            placeholder="Title (e.g. Sunny Altbau in Kreuzberg)"
          />
          <select
            value={draft.district}
            onChange={(event) => setDraft((current) => ({ ...current, district: event.target.value }))}
            className="min-h-11 rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
          >
            {DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          <input
            required
            value={draft.address}
            onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))}
            className="min-h-11 rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
            placeholder="Street address only"
          />
        </section>
      )}

      {step === 2 && (
        <section className="grid gap-3 md:grid-cols-2">
          <input
            required
            type="number"
            min={300}
            value={draft.price_month}
            onChange={(event) => setDraft((current) => ({ ...current, price_month: event.target.value }))}
            className="min-h-11 rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
            placeholder="Price/month (€)"
          />
          <input
            required
            type="number"
            min={1}
            value={draft.rooms}
            onChange={(event) => setDraft((current) => ({ ...current, rooms: event.target.value }))}
            className="min-h-11 rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
            placeholder="Rooms"
          />
          <input
            required
            type="number"
            min={10}
            value={draft.size_m2}
            onChange={(event) => setDraft((current) => ({ ...current, size_m2: event.target.value }))}
            className="min-h-11 rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
            placeholder="Size (m²)"
          />
          <label className="flex min-h-11 items-center justify-between rounded-lg border border-white/20 px-3 text-sm text-white">
            Furnished
            <input
              type="checkbox"
              checked={draft.is_furnished}
              onChange={(event) => setDraft((current) => ({ ...current, is_furnished: event.target.checked }))}
            />
          </label>
          <label className="text-sm text-slate-300">
            Available from
            <input
              required
              type="date"
              value={draft.available_from}
              onChange={(event) => setDraft((current) => ({ ...current, available_from: event.target.value }))}
              className="mt-1 min-h-11 w-full rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
            />
          </label>
          <label className="text-sm text-slate-300">
            Available until
            <input
              required
              type="date"
              value={draft.available_until}
              onChange={(event) => setDraft((current) => ({ ...current, available_until: event.target.value }))}
              className="mt-1 min-h-11 w-full rounded-lg border border-white/20 bg-slate-900 px-3 text-white"
            />
          </label>
          <label className="flex min-h-11 items-center justify-between rounded-lg border border-white/20 px-3 text-sm text-white">
            Pets allowed
            <input
              type="checkbox"
              checked={draft.rules_pets}
              onChange={(event) => setDraft((current) => ({ ...current, rules_pets: event.target.checked }))}
            />
          </label>
          <label className="flex min-h-11 items-center justify-between rounded-lg border border-white/20 px-3 text-sm text-white">
            Smoking allowed
            <input
              type="checkbox"
              checked={draft.rules_smoking}
              onChange={(event) => setDraft((current) => ({ ...current, rules_smoking: event.target.checked }))}
            />
          </label>
          <textarea
            value={draft.rules_notes}
            onChange={(event) => setDraft((current) => ({ ...current, rules_notes: event.target.value }))}
            className="min-h-24 rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-white md:col-span-2"
            placeholder="House rules notes"
          />
        </section>
      )}

      {step === 3 && (
        <section className="space-y-3">
          <label className="block text-sm text-slate-300">
            Photos (max 5)
            <input type="file" accept="image/*" multiple onChange={onPhotoChange} className="mt-2 block w-full text-sm text-white" />
          </label>
          {previewUrls.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
              {previewUrls.map((url, index) => (
                <img key={url} src={url} alt={`Preview ${index + 1}`} className="h-24 w-full rounded-lg object-cover" />
              ))}
            </div>
          )}
          <textarea
            required
            value={draft.description}
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
            className="min-h-32 w-full rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-white"
            placeholder="Describe your WG room, Altbau details, transport, and vibe."
          />
          <div className="rounded-lg border border-white/10 bg-slate-900/40 p-3 text-sm text-slate-300">
            <p className="font-semibold text-white">Preview</p>
            <p className="mt-1">
              {draft.title} · {draft.district} · €{draft.price_month || '0'}/mo
            </p>
          </div>
        </section>
      )}

      {error && <p className="text-sm font-semibold text-red-300">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="min-h-11 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white"
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current + 1)}
            className="min-h-11 rounded-lg bg-yellow-300 px-4 py-2 text-sm font-bold text-slate-900"
          >
            Next step
          </button>
        ) : (
          <button type="submit" disabled={saving} className="min-h-11 rounded-lg bg-yellow-300 px-4 py-2 text-sm font-bold text-slate-900">
            {saving ? 'Posting…' : 'Publish listing'}
          </button>
        )}
      </div>
    </form>
  )
}

function Progress({ step }: { step: number }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-semibold text-slate-300">
        <span>Step {step} of 3</span>
        <span>{Math.round((step / 3) * 100)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-yellow-300 transition-all" style={{ width: `${(step / 3) * 100}%` }} />
      </div>
    </div>
  )
}
