import { Playlist, Song } from '../types/tawa'

export type PlayCount = {
  song_id: number
  play_count: number
}

class WiharuCache {

  private songCache: Map<number, Song>

  constructor() {
    this.songCache = new Map()
  }

  public set(key: string, value: unknown) {
    localStorage.setItem('wiharu::' + key, JSON.stringify(value))
  }

  public get<T>(key: string): T | undefined {
    const value = localStorage.getItem('wiharu::' + key)
    if (value) {
      return JSON.parse(value)
    }
    return undefined
  }

  public incrementPlayCount = (songID: number) => {
    const playCounts = this.get<PlayCount[]>('play_counts')
    if (playCounts) {
      const playCount = playCounts.find((count) => count.song_id === songID)
      if (playCount) {
        playCount.play_count++
      } else {
        playCounts.push({
          song_id: songID,
          play_count: 1
        })
      }
      this.set('play_counts', playCounts)
    } else {
      this.set('play_counts', [{
        song_id: songID,
        play_count: 1
      }])
    }
  }

  public updatePlayCounts = (playCounts: PlayCount[]) => {
    const old = this.get<PlayCount[]>('play_counts')

    if (old) {
      const newPlayCounts = old.map((oldCount) => {
        const newCount = playCounts.find((newCount) => newCount.song_id === oldCount.song_id)
        if (newCount) {
          return newCount
        }
        return oldCount
      })

      this.set('play_counts', newPlayCounts)
    } else {
      this.set('play_counts', playCounts)
    }
  }

  public getPlayCounts = (): PlayCount[] => {
    return this.get<PlayCount[]>('play_counts') || []
  }

  public getPlayCount = (songID: number): number => {
    const playCounts = this.get<PlayCount[]>('play_counts')
    if (playCounts) {
      const playCount = playCounts.find((count) => count.song_id === songID)
      if (playCount) {
        return playCount.play_count
      }
    }
    return 0
  }

  public storePlaylist = (playlist: Playlist) => {
    if (!playlist.songs) {
      throw new Error('Playlist does not have songs')
    }
    this.set('playlist', playlist)
  }

  public getSong = (songID: number): Song | undefined => {
    const cached = this.songCache.get(songID)
    if (cached) {
      return cached
    }

    const playlist = this.get<Playlist>('playlist')
    if (playlist) {
      const song = playlist.songs!.find((song) => song.id === songID)
      if (song) {
        this.songCache.set(songID, song)
        return song
      }
    }

    return undefined
  }

  public storeSong = (song: Song) => {
    // Store it in memory
    this.songCache.set(song.id, song)


    // ... and local storage
    const playlist = this.get<Playlist>('playlist')
    if (playlist) {
      // We only store the variant with songs
      const songs = playlist.songs!
      const index = songs.findIndex((s) => s.id === song.id)
      if (index !== -1) {
        songs[index] = song
      } else {
        songs.push(song)
      }
      this.storePlaylist({
        ...playlist,
        songs,
      })
    }
  }
}

export const cache = new WiharuCache()