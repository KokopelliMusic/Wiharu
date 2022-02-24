/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useState } from 'react'
import SpotifyWebPlayback from 'react-spotify-web-playback-sdk-headless'
import { EventTypes } from 'sipapu/dist/src/events'
import { ProfileType } from 'sipapu/dist/src/services/profile'
import { SessionType } from 'sipapu/dist/src/services/session'
import { SongType } from 'sipapu/dist/src/services/song'
import SpotifyEvent from '../events/SpotifyEvent'
import { shuffleWeightedSong } from '../shuffle'

interface ShufflerProps {
  spotifyPlayer: React.RefObject<SpotifyWebPlayback>
  session: SessionType
  songFinished: boolean
}

const Shuffler = ({ spotifyPlayer, session, songFinished }: ShufflerProps) => {

  const [queue, setQueue]     = useState<SongType[]>([])
  const [current, setCurrent] = useState<SongType>()
  const [user, setUser]       = useState<ProfileType>()
  const [empty, setEmpty]     = useState<boolean>(false)
  const [paused, setPaused]   = useState<boolean>(false)

  // Every time songFinished changes, we know that the previous song has ended
  // so we can select the next one
  useEffect(() => {
    const fun = async () => {
      await next()
    }

    fun()
  }, [songFinished])

  useEffect(() => {
    if (!current) return

    spotifyPlayer.current?.play(current.platformId)
    window.sipapu.Session.setCurrentlyPlaying(session.id, current.id)
    window.sipapu.Song.incrmentPlayCount(current.id)
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
          console.log(queue)
          // location.reload()
        } 
        break
  
      case EventTypes.PREVIOUS_SONG:
        spotifyPlayer.current?.seek(0)
        break
  
      case EventTypes.SKIP_SONG:
        await next()
        break
  
      case EventTypes.PLAY_SONG:
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
    let q = queue

    if (queue.length === 0) {
      q = await window.sipapu.Playlist
        .getWithSongs(session.playlistId)
        .then(p => {
          if (p.songs.length === 0) {
            setEmpty(true)
            return []
          }
          return shuffleWeightedSong(p)
        })
      console.log(q)
    }

    if (q.length !== 0) {
      const next = q[0]
      const rest = q.slice(1)
  
      // Fetch username
      if (next.addedBy) {
        setUser(await window.sipapu.Profile.get(next.addedBy))
      }
  
      setCurrent(next)
      setQueue(rest)
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

  return current === undefined ? null : <SpotifyEvent song={current!} paused={paused} session={session} user={user!}/>
}

export default Shuffler