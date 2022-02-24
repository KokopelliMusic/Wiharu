import React, { useEffect, useRef, useState } from 'react'
import { SessionType } from 'sipapu/dist/src/services/session'
import { getCode, getSpotify, getUid, SpotifyToken } from '../data'
import SpotifyWebPlayback from 'react-spotify-web-playback-sdk-headless'
import FullscreenLoading from './FullscreenLoading'
import Shuffler from './Shuffler'
import { EventTypes } from 'sipapu/dist/src/events'

const LOADING_TIMEOUT = 500

const Player = () => {
  const player = useRef<SpotifyWebPlayback>(null)

  const [session, setSession]   = useState<SessionType | undefined>(undefined)
  const [spotify, setSpotify]   = useState<SpotifyToken | undefined>(undefined)
  const [uid, setUid]           = useState<string | undefined>(undefined)
  
  const [loading, setLoading]               = useState<boolean>(true)
  const [spotifyLoading, setSpotifyLoading] = useState<boolean>(true)
  const [playerReady, setPlayerReady]       = useState<boolean>(false)

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
    if (!loading && !spotifyLoading) {
      setPlayerReady(true)
    }
  }, [loading, spotifyLoading])



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
    window.sipapu.Session.notifyEvent(session!.id, EventTypes.SONG_FINISHED, {})
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
      songFinished={nextSong}
      spotifyPlayer={player} />}
  </div>
}

export default Player