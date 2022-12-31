import React, { useEffect, useRef, useState } from 'react'
import SpotifyWebPlayback from 'react-spotify-web-playback-sdk-headless'
import FullscreenLoading from './FullscreenLoading'
import Shuffler from './Shuffler'
import { cache } from '../data/cache'
import { Session, Settings, Spotify, User } from '../types/tawa'
import { client } from '../data/client'

const LOADING_TIMEOUT = 500

const Player = () => {
  const player = useRef<SpotifyWebPlayback>(null)

  const [spotify, setSpotify]   = useState<Spotify>()
  const [user, setUser]         = useState<User>()
  
  const [loading, setLoading]               = useState<boolean>(true)
  const [spotifyLoading, setSpotifyLoading] = useState<boolean>(true)
  const [playerReady, setPlayerReady]       = useState<boolean>(false)

  const [nextSong, setNextSong] = useState<boolean>(false)
  
  useEffect(() => {
    const session = cache.get<Session>('session')
    const spotify = cache.get<Spotify>('spotify')
    const user = cache.get<User>('user')
    const settings = cache.get<Settings>('settings')

    if (!session || !settings || !spotify || !user) {
      alert('I cannot seem to find your session, sending you back to the home page in 5 seconds')
      setTimeout(() => window.location.href = '/', 5000)
    }

    setSpotify(spotify)
    setUser(user)
    setTimeout(() => setLoading(false), LOADING_TIMEOUT)

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
    const newExpiration = new Date(Date.now() + 60 * 60 * 1000)
    // Update the token in the cache
    const newSpotify: Spotify = { 
      refresh_token: spotify!.refresh_token,
      user: spotify!.user,
      access_token: token, 
      expires_at: newExpiration.getTime() 
    }

    // Update the state and cache
    setSpotify(newSpotify)
    cache.set('spotify', newSpotify)

    // Update the token on the server
    client.req('update_spotify', { access_token: token, expires_at: newExpiration})
      .catch(console.error)
  }

  const onSpotifyReady = async () => {
    // First, sleep 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Now, we need to transfer the playback to the device via the spotify api
    fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${spotify?.access_token}`
      },
      body: JSON.stringify({
        device_ids: [player.current?.state.deviceId],
      })
    }).then(res => console.log('Transfered playback to device', res))
      .then(() => setSpotifyLoading(false))
      .catch(err => console.error('Failed to transfer playback to device', err))
  }

  const onSongFinished = async () => {
    console.log('Song finished!')
    setNextSong(p => !p)
    client.pushEvent('song_finished', {})
  }

  if (loading) return <FullscreenLoading />

  return <div>
    <SpotifyWebPlayback
      ref={player}
      name="Kokopelli"
      volume={window.location.href.includes('localhost') ? 2 : 100}
      debug
      logging

      accessToken={spotify?.access_token}
      refreshToken={spotify?.refresh_token}
      refreshTokenAutomatically
      refreshTokenUrl={process.env.REACT_APP_TOKEN_REFRESH_URL}

      onTokenRefresh={onTokenRefresh}
      onReady={onSpotifyReady}
      songFinished={onSongFinished}
    />

    {spotifyLoading ? null : <Shuffler
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      songFinished={nextSong}
      spotifyPlayer={player} />}
  </div>
}

export default Player