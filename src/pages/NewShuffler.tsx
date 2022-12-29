/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Models, Query } from 'appwrite'
import React, { ReactNode, useEffect, useState } from 'react'
import SpotifyWebPlayback from 'react-spotify-web-playback-sdk-headless'
import { Event, EventTypeEnum, Session, Song, SongTypeEnum } from 'sipapu-2'
import SpotifyEvent from '../events/SpotifyEvent'
import { shuffleWeightedSongWithEvents } from '../shuffle'
import FullscreenLoading from './FullscreenLoading'
// import AdtRadEvent, { getAdtRadSong } from '../events/AdtRadEvent'
import { incrementPlayCount, setCurrentlyPlaying } from '../data'
import AdtRadEvent, { getAdtRadSong } from '../events/AdtRadEvent'

interface ShufflerProps {
  spotifyPlayer: React.RefObject<SpotifyWebPlayback>
  session: Session
  user: Models.User<Models.Preferences>
  songFinished: boolean
}

const FORBIDDEN_EVENTS: EventTypeEnum[] = [
  EventTypeEnum.SongFinished,
  EventTypeEnum.NextSong,
  EventTypeEnum.PlaylistFinished,
  EventTypeEnum.PlayerEvent,

  EventTypeEnum.SpotifyTokenRefresh,

  EventTypeEnum.SpotifyPlaybackError,
  EventTypeEnum.YouTubePlaybackError,
  EventTypeEnum.PlaylistTooSmallError,
]

const NewShuffler = ({ spotifyPlayer, session, songFinished, user }: ShufflerProps) => {

  const [empty, setEmpty]       = useState<boolean>(false)
  const [current, setCurrent]   = useState<Song>()
  const [queue, setQueue]       = useState<Song[]>([])

  const [songPage, setSongPage] = useState<ReactNode>(null)
  
  const [event, setEvent]       = useState<Event | undefined>(undefined)

  const [paused, setPaused]     = useState<boolean>(false)

  // Setup listeners
  useEffect(() => {
    window.api.subscribe('databases.main.collections.event.documents', payload => {
      const p = payload.payload as unknown as Event
      
      if (p.session_id != session.$id) return

      if (FORBIDDEN_EVENTS.includes(p.type)) return

      setEvent(p)
    })
  }, [])

  // This is executed every time a song is finished!
  // Also on component load, so we also use it to set up the queue
  useEffect(() => {
    (async () => {
      console.log('[Shuffler] Song finished')
      
      let q = queue

      if (q.length === 0) {
        q = await fillQueue()

        if (q.length === 0) {
          setEmpty(true)
          return
        }
      }
      const song = q.shift()!
          
      play(song)
      setCurrent(song)
      setQueue(q)
    })()
  }, [songFinished])

  useEffect(() => {
    if (!event) return

    console.log(event.type)

    switch (event.type) {

    case EventTypeEnum.Skip:
      spotifyPlayer.current?.seek(current?.length ?? 0)
      return

    case EventTypeEnum.Previous:
      spotifyPlayer.current?.seek(0)
      return
    }

  }, [event])

  const play = (song: Song) => {
    
    setCurrentlyPlaying(session, song, user.$id)

    switch (song.song_type) {
    
    case SongTypeEnum.Spotify:
      spotifyPlayer.current?.play(song.platform_id)
      incrementPlayCount(session, song)
      setSongPage(<SpotifyEvent song={song} paused={paused} session={session} />)
      return

    case SongTypeEnum.YouTube:
      incrementPlayCount(session, song)
      return

    case SongTypeEnum.Event:
      spotifyPlayer.current?.play(getAdtRadSong())
      setSongPage(<AdtRadEvent session={session} />)
      return
    
    }
  }

  const fillQueue = async (): Promise<Song[]> => {
    console.log('Filling the queue')

    if (queue.length === 0) {
      const songs = await getSongs()
      const newQueue = shuffleWeightedSongWithEvents(songs, session)
      console.log('New Queue:', newQueue)
      return newQueue
    }
    return []
  }

  const getSongs = async (): Promise<Song[]> => {
    const songs = await window.db.listDocuments('song', [
      Query.equal('playlist_id', session.playlist_id)
    ])

    return songs.documents as Song[]
  }

  if (empty) {
    return <div className="min-h-screen min-w-screen flex items-center justify-center flex-col bg-red-800">
      <img 
        className="object-contain h-52" 
        src="/kokopelli.png" 
        alt="Kokopelli Logo"/>
      <h1 className="text-3xl font-extrabold text-white">
        Playlist empty!
      </h1>
      <h2 className="text-xl font-bold text-white">
        Add songs to your playlist to get started. After that press F5 to start playing!
      </h2>
    </div>
  }

  if (current === undefined) {
    return <FullscreenLoading />
  }

  return <div>
    {songPage}
  </div>
}

export default NewShuffler