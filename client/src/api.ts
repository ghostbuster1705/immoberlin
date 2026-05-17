import type { Listing, ListingFilters, User } from './types'

const API_BASE = import.meta.env.VITE_API_BASE || ''

type ApiErrorShape = {
  error?: string
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = (await response.json()) as ApiErrorShape
      if (body.error) {
        message = body.error
      }
    } catch (_error) {
      // no-op for non JSON responses
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

function toQueryString(filters: ListingFilters) {
  const query = new URLSearchParams()

  if (filters.district) query.set('district', filters.district)
  if (filters.maxPrice) query.set('maxPrice', String(filters.maxPrice))
  if (filters.rooms) query.set('rooms', filters.rooms)
  if (filters.availableFrom) query.set('availableFrom', filters.availableFrom)
  if (filters.furnished !== undefined) query.set('furnished', String(filters.furnished))
  if (filters.mine) query.set('mine', '1')
  if (filters.status) query.set('status', filters.status)
  if (filters.limit) query.set('limit', String(filters.limit))

  const built = query.toString()
  return built ? `?${built}` : ''
}

export async function getListings(filters: ListingFilters = {}) {
  return apiRequest<{ listings: Listing[] }>(`/api/listings${toQueryString(filters)}`)
}

export async function getListing(id: string) {
  return apiRequest<{ listing: Listing }>(`/api/listings/${id}`)
}

export async function createListing(payload: FormData) {
  return apiRequest<{ listing: Listing }>('/api/listings', {
    method: 'POST',
    body: payload,
  })
}

export async function updateListing(id: number, payload: Partial<Listing>) {
  return apiRequest<{ listing: Listing }>(`/api/listings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export async function updateListingStatus(id: number, status: 'active' | 'taken') {
  return apiRequest<{ listing: Listing }>(`/api/listings/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
}

export async function deleteListing(id: number) {
  return apiRequest<void>(`/api/listings/${id}`, {
    method: 'DELETE',
  })
}

export async function contactListingOwner(
  id: number,
  payload: { sender_name: string; sender_email: string; message: string },
) {
  return apiRequest<{ success: true }>(`/api/listings/${id}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export async function requestMagicLink(payload: { email: string; name?: string }) {
  return apiRequest<{ success: true }>('/api/auth/magic-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export async function getMe() {
  return apiRequest<{ user: User }>('/api/me')
}

export async function logout() {
  return apiRequest<void>('/api/auth/logout', {
    method: 'POST',
  })
}
