import React, { useEffect, useRef, useState } from 'react'
import { emitEvent, getCode } from '../data'
import SpotifyWebPlayback from 'react-spotify-web-playback-sdk-headless'
import FullscreenLoading from './FullscreenLoading'
import NewShuffler from './NewShuffler'
import { EventTypeEnum, Session, Spotify } from 'sipapu-2'
import { Account, Models } from 'appwrite'

const LOADING_TIMEOUT = 1000

const NewPlayer = () => {
  const player = useRef<SpotifyWebPlayback>(null)

  const [session, setSession]   = useState<Session>()
  const [spotify, setSpotify]   = useState<Spotify>()
  const [user, setUser]         = useState<Models.User<Models.Preferences>>()
  
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

    (async () => {
      try {
        const session = await window.db.getDocument<Session>('session', code)
        const spotify = await window.db.listDocuments('spotify')
        const account = await (new Account(window.api)).get()
  
        console.log(spotify)

        setSession(session)
        setSpotify(spotify.documents[0] as unknown as Spotify)
        setUser(account)
      } catch (err) {
        console.error(err)
        alert('I cannot seem to find your session, sending you back to the home page in 5 seconds')
        setTimeout(() => window.location.href = '/', 5000)
      }

      setTimeout(() => setLoading(false), LOADING_TIMEOUT)
    })()
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
    if (!spotify) return

    window.db.updateDocument('spotify', spotify.$id, {
      access_token: token,
      expires_at: Date.now() + 60 * 60 * 1000
    })
  }

  const onSpotifyReady = () => setSpotifyLoading(false)

  const onSongFinished = () => {
    console.log('Song finished')
    setNextSong(p => !p)
    if (session && user) {
      emitEvent(EventTypeEnum.SongFinished, session.$id, user.$id, {})
    } else {
      alert('Sesion and/or user is undefined!')
    }
  }

  if (loading || !spotify || !session || !user) return <FullscreenLoading />

  return <div>
    <SpotifyWebPlayback
      ref={player}
      name="Kokopelli"
      volume={window.location.href.includes('localhost') ? 2 : 100}
      debug
      logging

      accessToken={spotify.access_token}
      refreshToken={spotify.refresh_token}
      refreshTokenAutomatically
      refreshTokenUrl={process.env.REACT_APP_TOKEN_REFRESH_URL}

      onTokenRefresh={onTokenRefresh}
      onReady={onSpotifyReady}
      songFinished={onSongFinished}
    />

    {spotifyLoading ? null : <NewShuffler
      session={session}    
      songFinished={nextSong}
      user={user}
      spotifyPlayer={player} />}
  </div>
}

export default NewPlayer