/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useState } from 'react'
import SpotifyWebPlayback from 'react-spotify-web-playback-sdk-headless'
import { EventTypes } from 'sipapu/dist/src/events'
import { PlaylistWithSongsType } from 'sipapu/dist/src/services/playlist'
import { ProfileType } from 'sipapu/dist/src/services/profile'
import { SessionType } from 'sipapu/dist/src/services/session'
import { SongEnum } from 'sipapu/dist/src/services/song'
import AdtRadEvent, { getAdtRadSong } from '../events/AdtRadEvent'
import SpotifyEvent from '../events/SpotifyEvent'
import { PlayerEvent, shuffleWeightedSongWithEvents } from '../shuffle'

interface ShufflerProps {
  spotifyPlayer: React.RefObject<SpotifyWebPlayback>
  session: SessionType
  songFinished: boolean
}

const Shuffler = ({ spotifyPlayer, session, songFinished }: ShufflerProps) => {

  const [queue, setQueue]       = useState<PlayerEvent[]>([])
  const [current, setCurrent]   = useState<PlayerEvent>()
  const [user, setUser]         = useState<ProfileType>()
  const [empty, setEmpty]       = useState<boolean>(false)
  const [paused, setPaused]     = useState<boolean>(false)
  const [finished, setFinished] = useState<boolean>(false)
  const [playlist, setPlaylist] = useState<PlaylistWithSongsType>()

  // Every time songFinished changes, we know that the previous song has ended
  // so we can select the next one
  useEffect(() => {
    setFinished(f => !f)
  }, [songFinished])

  useEffect(() => {
    const fun = async () => {
      await next()
    }

    fun()
  }, [finished])

  useEffect(() => {
    if (!current) return

    if (current === 'adtrad') {
      //
    } else if (current.songType === SongEnum.SPOTIFY) {
      spotifyPlayer.current?.play(current.platformId)
      window.sipapu.Song.incrmentPlayCount(current.id)
      window.sipapu.Session.setCurrentlyPlaying(session.id, current.id)
    } else {
      // huilen
    }
    

    window.sipapu.Session.notifyEvent(session.id, EventTypes.PLAY_SONG, { song: current })
  }, [current])

  useEffect(() => {
    if (!session) return

    const cleanup = window.sipapu.Session.watch(session.id, async event => {
      switch (event.eventType) {

      case EventTypes.PLAY_PAUSE:
        // TODO: handle for all players
        spotifyPlayer.current?.togglePlay()
        setPaused(p => !p)
        break
  
      case EventTypes.YOUTUBE_SONG_ADDED:
      case EventTypes.SPOTIFY_SONG_ADDED:
        if (queue.length === 0) {
          setEmpty(false)
          location.reload()
        } 
        break
  
      case EventTypes.PREVIOUS_SONG:
        spotifyPlayer.current?.seek(0)
        break
  
      case EventTypes.SKIP_SONG:
        setFinished(f => !f)
        break
  
      case EventTypes.PLAY_SONG:
      case EventTypes.SONG_FINISHED:
      case EventTypes.PLAYLIST_FINISHED:
        // we emit these events so ignore this
        break
        
      default:
        console.log('I do not know (yet) what to do with this eventType:', event.eventType)
        break
      
      }
    })

    return () => {
      const fun = async () => (await cleanup)()
      fun()
    }
  }, [session])

  const next = async () => {
    console.log('QUEUE:', queue)

    let q = queue


    if (queue.length === 0) {
      q = await window.sipapu.Playlist
        .getWithSongs(session.playlistId)
        .then(p => {
          setPlaylist(p)
          if (p.songs.length === 0) {
            setEmpty(true)
            return []
          }
          return shuffleWeightedSongWithEvents(p, session)
        })
      console.log(q)
    }

    if (q.length !== 0) {
      const next = q[0]
      const rest = q.slice(1)
  
      // Fetch username
      if (typeof next !== 'string' && next.addedBy) {
        setUser(await window.sipapu.Profile.get(next.addedBy))
      }
  
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

  if (current === 'adtrad') {

    spotifyPlayer.current?.play(getAdtRadSong())

    return <AdtRadEvent playlist={playlist!} />
  } 

  return <SpotifyEvent song={current!} paused={paused} session={session} user={user!}/>
}

export default Shuffler