import React, { useEffect, useRef, useState } from 'react'
import { Event, EventTypes } from 'sipapu/dist/src/events'
import { SessionType } from 'sipapu/dist/src/services/session'
import { getCode, getSpotify, getUid, SpotifyToken } from '../data'
import SpotifyWebPlayback from 'react-spotify-web-playback-sdk-headless'
import FullscreenLoading from './FullscreenLoading'
import EventHandler from './EventHandler'
import { PlaylistWithSongsType } from 'sipapu/dist/src/services/playlist'

const LOADING_TIMEOUT = 500

const Player = () => {
  const player = useRef<SpotifyWebPlayback>(null)

  const [session, setSession]   = useState<SessionType | undefined>(undefined)
  const [playlist, setPlaylist] = useState<PlaylistWithSongsType | undefined>(undefined)
  const [spotify, setSpotify]   = useState<SpotifyToken | undefined>(undefined)
  const [uid, setUid]           = useState<string | undefined>(undefined)
  const [loading, setLoading]   = useState<boolean>(true)
  
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
      .catch(err => {
        console.error(err)
        alert('I cannot seem to find your session, sending you back to the home page in 5 seconds')
        setTimeout(() => window.location.href = '/', 5000)
      })
  }, [])

  useEffect(() => {
    if (!session) return

    window.sipapu.Playlist.getWithSongs(session.playlistId)
      .then(setPlaylist)
      .then(() => setTimeout(() => setLoading(false), LOADING_TIMEOUT))
      .catch(console.error)

    const cleanup = window.sipapu.Session.watch(session.id, handleEvent)

    return () => {
      const fun = async () => (await cleanup)()
      fun()
    }
  }, [session])

  /**
   * TAWA EVENTS
   */

  const handleEvent = (event: Event) => {
    switch (event.eventType) {

    case EventTypes.PLAY_PAUSE:
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

  const onSongFinished = () => {
    alert('Song finished')
  }

  if (loading) return <FullscreenLoading />

  return <div>
    <SpotifyWebPlayback
      ref={player}
      name="Kokopelli"
      volume={100}
      debug
      logging

      accessToken={spotify?.accessToken}
      refreshToken={spotify?.refreshToken}
      refreshTokenAutomatically
      refreshTokenUrl={process.env.REACT_APP_TOKEN_REFRESH_URL}

      onTokenRefresh={onTokenRefresh}
      songFinished={onSongFinished}
    />
    <EventHandler
      session={session!}
      playlist={playlist!}
      spotifyPlayer={player}
    />
  </div>
}

export default Player