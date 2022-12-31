export type Playlist = {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
  creator: User | string
  songs: Song[] | null
}

export type PlaylistWithSongs = Playlist & {
  songs: Song[]
  creator: User
}

export type SongType = 'spotify' | 'youtube' | 'soundcloud' | 'mp3'


export function instanceOfKokopelliEvent(object: any): object is KokopelliEvent {
  return ('pretty_name' in object && 'active' in object)
}

export function instanceOfSong(object: any): object is Song {
  return ('artists' in object && 'album' in object && 'platform_id' in object && 'song_type' in object)
}


export type Song = {
  id: number
  title: string
  artists: string
  album: string
  length: number
  cover: string
  added_by: User
  song_type: string
  platform_id: string
  playlist_id: number
  play_count: number
}

export type User = {
  id: number
  username: string
  profile_picture: string
}

export type AccessToken = {
  user: User
  token: string
  created_at: string
}

export type Spotify = {
  access_token: string
  refresh_token: string
  expires_at: number
  user: User
}

export type Event = {
  session_id: string
  client_type: string
  event_type: string
  date: string
  data: Record<string, any> | string
}

export type Session = {
  session_id: string
  playlist: Playlist
  created_at: string
  updated_at: string

  user: User
  claimed: boolean
}

export type Settings = KokopelliSettings & {
  session: Session
}

export type KokopelliSettings = {
  allow_spotify: boolean
  allow_youtube: boolean
  youtube_only_audio: boolean

  allow_events: boolean
  event_frequency: number
  allowed_events: KokopelliEvent[]
  random_word_list: string

  anyone_can_use_player_controls: boolean
  anyone_can_add_to_queue: boolean
  anyone_can_remove_from_queue: boolean
  anyone_can_see_history: boolean
  anyone_can_see_queue: boolean
  anyone_can_see_playlist: boolean

  algorithm_used: string

  allow_guests: boolean
}

export type KokopelliEvent = {
  name: string
  pretty_name: string
  active: boolean
}

export type EventTypes = 'generic' | 
  'session_created'                |
  'session_removed'                | 
  'skip_song'                      |
  'play_song'                      |
  'previous_song'                  |
  'play_pause'                     |
  'youtube_song_added'             |
  'spotify_song_added'             |
  'song_removed'                   |
  'new_user'                       |
  'song_finished'                  |
  'next_song'                      |
  'playlist_finished'              |
  'spotify_error'                  |
  'youtube_error'                  |
  'playlist_too_small_error'       |
  'session_settings_changed'

/**
 * All queueing algorithms the user can choose from
 * <pre></pre>
 * 'classic' is the default and classic Kokopelli experience, weighted random on user
 * First the algorithm chooses an random user, then it uses weighted-song to select from the user's queue
 * <pre></pre>
 * 'modern' assigns weights to each user (based on how many times they have played), and then uses weighted-song to select from the user's queue
 * basically the classic algo but better
 * <pre></pre>
 * 'random' is pure random (garbage)
 * <pre></pre>
 * 'weighted-song' assignes weights to each song in the queue (based on how many times it has been played), and selects a song with the lowest weight (random if multiple with same weight)
 */
export type QueueAlgorithms = 'classic' | 'modern' | 'random' | 'weighted-song';
