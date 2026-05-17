export type ListingRules = {
  pets: boolean
  smoking: boolean
  notes: string
}

export type ListingOwner = {
  id: number
  email: string
  name: string
}

export type Listing = {
  id: number
  user_id: number
  title: string
  district: string
  address: string
  price_month: number
  rooms: number
  size_m2: number
  available_from: string
  available_until: string
  description: string
  rules: ListingRules
  photos: string[]
  is_furnished: boolean
  is_direct_only: boolean
  status: 'active' | 'taken'
  created_at: string
  owner: ListingOwner
}

export type ListingFilters = {
  district?: string
  maxPrice?: number
  rooms?: '1' | '2' | '3+'
  availableFrom?: string
  furnished?: boolean
  mine?: boolean
  status?: 'active' | 'taken' | 'all'
  limit?: number
}

export type User = {
  id: number
  email: string
  name: string | null
  created_at: string
}
