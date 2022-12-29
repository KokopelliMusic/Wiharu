/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Models, Query } from 'appwrite'
import React, { useEffect, useState } from 'react'
import SpotifyWebPlayback from 'react-spotify-web-playback-sdk-headless'
import { Session, Song, Event, EventTypeEnum, SongTypeEnum, PlayerEvents } from 'sipapu-2'
import { shuffleWeightedSongWithEvents } from '../shuffle'
import AdtRadEvent, { getAdtRadSong } from '../events/AdtRadEvent'
import { emitEvent, incrementPlayCount, setCurrentlyPlaying } from '../data'
import SpotifyEvent from '../events/SpotifyEvent'

interface ShufflerProps {
  spotifyPlayer: React.RefObject<SpotifyWebPlayback>
  session: Session
  songFinished: boolean
  user: Models.User<Models.Preferences>
}

const Shuffler = ({ spotifyPlayer, session, songFinished, user }: ShufflerProps) => {

  const [queue, setQueue]       = useState<Song[]>([])
  const [current, setCurrent]   = useState<Song>()
  const [empty, setEmpty]       = useState<boolean>(false)
  const [paused, setPaused]     = useState<boolean>(false)
  const [finished, setFinished] = useState<boolean>(false)
  const [playlist, setPlaylist] = useState<Song[]>()

  // Every time songFinished changes, we know that the previous song has ended
  // so we can select the next one
  useEffect(() => {
    setFinished(f => !f)
  }, [songFinished])

  useEffect(() => {
    (async () => {
      await next()
    })()
  }, [finished])

  useEffect(() => {
    if (!current) return

    let event = false
    let event_type: PlayerEvents | undefined = undefined

    console.log('Current event', current)
    console.log('Current type', current.song_type)

    switch (current.song_type) {
    
    case SongTypeEnum.Event:
      spotifyPlayer.current?.play(getAdtRadSong())
      event = true
      event_type = 'adtrad'
      break

    case SongTypeEnum.Spotify:
      console.log('Spotify!')
      spotifyPlayer.current?.play(current.platform_id)
      incrementPlayCount(session, current)
      setCurrentlyPlaying(session, current, user.$id)
      break

    case SongTypeEnum.YouTube:
      alert('YouTube functionality has not been implemented yet!')
      break
    }

    emitEvent(EventTypeEnum.Play, session.$id, user.$id, { 
      currently_playing: JSON.stringify(current),
      event,
      event_type
    })

    // if (current.type === EventTypeEnum.PlayerEvent && current.type.) {
    //   spotifyPlayer.current?.play(getAdtRadSong())
    // } else if (current.payload?.)

    // if (current === 'adtrad') {
    //   spotifyPlayer.current?.play(getAdtRadSong())
    // } else if (current.songType === SongEnum.SPOTIFY) {
    //   spotifyPlayer.current?.play(current.platformId)
    //   window.sipapu.Song.incrmentPlayCount(current.id)
    //   window.sipapu.Session.setCurrentlyPlaying(session.id, current.id)
    // } else {
    //   // huilen
    // }
    

    // window.sipapu.Session.notifyEvent(session.id, EventTypes.PLAY_SONG, { song: current })
  }, [current])

  useEffect(() => {
    if (!session) return

    const cleanup = window.api.subscribe('databases.main.collections.event.documents', payload => {
      const event = payload.payload as Event
      switch (event.type) {
        
      case EventTypeEnum.PlayPause:
        spotifyPlayer.current?.togglePlay()
        setPaused(p => !p)
        break

      case EventTypeEnum.YouTubeSongAdded:
      case EventTypeEnum.SpotifySongAdded:
        if (queue.length === 0 && empty === true) {
          setEmpty(false)
          location.reload()
        }
        break
        
      case EventTypeEnum.Previous:
        spotifyPlayer.current?.seek(0)
        break

      case EventTypeEnum.Skip:
        setFinished(f => !f)
        break

      case EventTypeEnum.Play:
      case EventTypeEnum.SongFinished:
      case EventTypeEnum.PlaylistFinished:
        // We emit these events so we ignore them
        break

      default:
        console.log('I do not know (yet) what to do with this event:', event)
        break        
      }
    })

    return () => {
      cleanup()
    }
  }, [session])

  const next = async () => {
    console.log('QUEUE:', queue)

    let q = queue

    if (queue.length === 0) {
      const query = await window.db.listDocuments('song', [
        Query.equal('playlist_id', session.playlist_id)
      ])

      const songs = query.documents as unknown as Song[]

      setPlaylist(songs)
      if (query.total === 0) {
        setEmpty(true)
        q = []
      }
      q = shuffleWeightedSongWithEvents(songs, session)

      // q = await window.sipapu.Playlist
      //   .getWithSongs(session.playlist_id)
      //   .then(p => {
      //     setPlaylist(p)
      //     if (p.songs.length === 0) {
      //       setEmpty(true)
      //       return []
      //     }
      //     return shuffleWeightedSongWithEvents(p, session)
      //   })
      // console.log(q)
    }

    if (q.length !== 0) {
      const next = q[0]
      const rest = q.slice(1)
  
      setQueue(rest)
      setCurrent(next)
    }
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
    return null
  }

  if (current.song_type === SongTypeEnum.Event) {
    return <AdtRadEvent session={session!} />
  } 

  return <SpotifyEvent song={current!} paused={paused} session={session} />
}

export default Shuffler