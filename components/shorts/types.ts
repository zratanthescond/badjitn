import type { pricePlan } from "@/types";

export interface Event {
  _id: string
  title: string
  description: string
  price: string
  isFree: boolean
  imageUrl: string
  location: {
    name: string
    lon: number
    lat: number
  }
  startDateTime: Date
  endDateTime: Date
  url: string
  category?: {
    name: string
  }
  organizer: {
    firstName: string
    lastName: string
    photo: string
    username: string
  }
  pricePlan: pricePlan[]
  isOnline: boolean
  organisation?: {
    _id: string
    name: string
    slug: string
    logo: string
    isVerified?: boolean
  }
  sponsors?: string[]
  country?: string
  Sponsors?: string[]
  attendees?: string[]
}

export interface ShortsData {
  data: Event[]
  totalPages: number
}

export interface VideoPlayerRef {
  play: () => Promise<void>
  pause: () => void
  muted: boolean
}
