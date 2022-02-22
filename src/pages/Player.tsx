import React, { useEffect, useRef, useState } from 'react'
import { Event, EventTypes } from 'sipapu/dist/src/events'
import { SessionType } from 'sipapu/dist/src/services/session'
import { getCode, getSpotify, getUid, SpotifyToken } from '../data'
import SpotifyWebPlayback from 'react-spotify-web-playback-sdk-headless'
import FullscreenLoading from './FullscreenLoading'
import { PlaylistWithSongsType } from 'sipapu/dist/src/services/playlist'
import { SongType } from 'sipapu/dist/src/services/song'
import { ProfileType } from 'sipapu/dist/src/services/profile'
import Shuffler from './Shuffler'

const LOADING_TIMEOUT = 500

const Player = () => {
  const player = useRef<SpotifyWebPlayback>(null)

  const [session, setSession]   = useState<SessionType | undefined>(undefined)
  const [playlist, setPlaylist] = useState<PlaylistWithSongsType | undefined>(undefined)
  const [spotify, setSpotify]   = useState<SpotifyToken | undefined>(undefined)
  const [uid, setUid]           = useState<string | undefined>(undefined)
  
  const [loading, setLoading]               = useState<boolean>(true)
  const [spotifyLoading, setSpotifyLoading] = useState<boolean>(true)
  const [playerReady, setPlayerReady]       = useState<boolean>(false)

  const [queue, setQueue]     = useState<SongType[]>([])
  const [event, setEvent]     = useState<SongType | undefined>(undefined)
  const [addedBy, setAddedBy] = useState<ProfileType | undefined>(undefined)
  const [paused, setPaused]   = useState<boolean>(false)
  const [nextSong, setNextSong] = useState<boolean>(false)
  
  useEffect(() => {
    const code = getCode()

    if (!code) {
      alert('I cannot seem to find your session, sending you back to the home page in 5 seconds')
      setTimeout(() => window.location.href = '/', 5000)
    }

    window.sipapu.Session.get(code)
      .then(setSession)
      .then(() => getSpotify())
      .then(setSpotify)
      .then(() => getUid())
      .then(setUid)
      .then(() => setTimeout(() => setLoading(false), LOADING_TIMEOUT))
      .catch(err => {
        console.error(err)
        alert('I cannot seem to find your session, sending you back to the home page in 5 seconds')
        setTimeout(() => window.location.href = '/', 5000)
      })
  }, [])

  useEffect(() => {
    if (!session) return

    // window.sipapu.Playlist.getWithSongs(session.playlistId)
    //   .then(setPlaylist)
    //   .then(() => setTimeout(() => setLoading(false), LOADING_TIMEOUT))
    //   .catch(console.error)

    const cleanup = window.sipapu.Session.watch(session.id, handleEvent)

    return () => {
      const fun = async () => (await cleanup)()
      fun()
    }
  }, [session])

  useEffect(() => {
    console.log(loading, spotifyLoading)
    if (!loading && !spotifyLoading) {
      setPlayerReady(true)
    }
  }, [loading, spotifyLoading])

  // useEffect(() => {
  //   if (playerReady !== true) return

  //   const fun = async () => {
  //     // As soon as everything is done loading we can begin with selecting the next event
  //     await next()
  //   }

  //   fun()
  // }, [playerReady])

  /**
   * BUSINESS LOGIC
   */

  // const next = async () => {
  //   let q = queue
  //   // If queue is empty reshuffle
  //   if (q.length === 0) {
  //     console.log('Queue empty, reshuffling')
  //     q = await updatePlaylist()
  //   } 

  //   // select the first in the queue
  //   const nextEvent = q[0]
  //   // if this event has an 'addedBy' field, then we need to look up the user
  //   if (nextEvent.addedBy) {
  //     const user = await window.sipapu.Profile.get(nextEvent.addedBy)
  //     setAddedBy(user)
  //   }
  //   // and save the rest
  //   console.log('Selected', nextEvent)
  //   setQueue(q.slice(1))
  //   setEvent(nextEvent)
  // }

  // // Fetch the latest playlist
  // const updatePlaylist = async (): Promise<SongType[]> => {
  //   console.log('Updating playlist')
  //   return await window.sipapu.Playlist
  //     .getWithSongs(session!.playlistId)
  //     .then(playlist => {
  //       // Select the new queue 
  //       const shuffled = shuffleRandomWithoutEvents(playlist)
  //       const next = shuffled.slice(0, 10)
    
  //       console.log(next)

  //       setQueue(next)
  //       setPlaylist(playlist)
  //       return next
  //     })
  // }

  const handleEvent = (event: Event) => {
    switch (event.eventType) {

    case EventTypes.PLAY_PAUSE:
      // TODO: handle for all players
      player.current?.togglePlay()
      console.log('play/pause')
      break
      
    default:
      console.log('I do not know (yet) what to do with this eventType:', event.eventType)
      break
    
    }
  }

  /**
   *  SPOTIFY LISTENERS
   */

  const onTokenRefresh = (token: string) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    window.sipapu.Spotify.updateToken(token, new Date(Date.now() + 60 * 60 * 1000), uid!)
      .catch(console.error)
  }

  const onSpotifyReady = () => {
    setSpotifyLoading(false)
  }

  const onSongFinished = async () => {
    setNextSong(p => !p)
  }

  if (loading) return <FullscreenLoading />

  return <div>
    <SpotifyWebPlayback
      ref={player}
      name="Kokopelli"
      volume={window.location.href.includes('localhost') ? 2 : 100}
      debug
      logging

      accessToken={spotify?.accessToken}
      refreshToken={spotify?.refreshToken}
      refreshTokenAutomatically
      refreshTokenUrl={process.env.REACT_APP_TOKEN_REFRESH_URL}

      onTokenRefresh={onTokenRefresh}
      onReady={onSpotifyReady}
      songFinished={onSongFinished}
    />

    {spotifyLoading ? null : <Shuffler
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      session={session!}    
      paused={paused}
      songFinished={nextSong}
      spotifyPlayer={player} />}

    {/* {spotifyLoading ? null : <EventHandler
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      playlist={playlist!} session={session!}
      spotifyPlayer={player}
      event={event}
      user={addedBy}
      paused={paused}
    />} */}
  </div>
}

export default Player