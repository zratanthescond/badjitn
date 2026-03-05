export interface Event {
  _id: string
  title: string
  imageUrl: string
  url?: string
  category?: {
    name: string
  }
  organizer: {
    firstName: string
    lastName: string
    photo: string
    username: string
  }
  organisation?: {
    _id: string
    name: string
    slug: string
    logo: string
    isVerified?: boolean
  }
  sponsors?: string[]
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
