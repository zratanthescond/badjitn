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
    organisationName: string
    organisationDescription: string
    publisher?: string
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
