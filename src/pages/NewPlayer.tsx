/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useRef, useState } from 'react'
import SpotifyWebPlayback from 'react-spotify-web-playback-sdk-headless'
import { cache } from '../data/cache'
import { client, WSClient } from '../data/client'
import { generateQueue, PlayerEvent } from '../data/shuffle'
import AdtRadEvent, { getAdtRadSong } from '../events/AdtRadEvent'
import SpotifyEvent from '../events/SpotifyEvent'
import { Event, instanceOfKokopelliEvent, instanceOfSong, Playlist, Session, Settings, Spotify, User } from '../types/tawa'
import FullscreenLoading from './FullscreenLoading'

const LOADING_TIMEOUT = 1000


const NewPlayer = () => {
  const player = useRef<SpotifyWebPlayback>(null)
  const actualPlayer = useRef<ActualPlayer>(null)

  const [loading, setLoading]               = useState<boolean>(true)
  const [spotifyLoading, setSpotifyLoading] = useState<boolean>(true)

  useEffect(() => {
    // Checking is all the data is there
    const session = cache.get<Session>('session')
    const spotify = cache.get<Spotify>('spotify')
    const user = cache.get<User>('user')
    const settings = cache.get<Settings>('settings')

    if (!session || !settings || !spotify || !user) {
      alert('I cannot seem to find your session, sending you back to the home page in 5 seconds')
      setTimeout(() => window.location.href = '/', 5000)
    }

    // Done checking!
    setTimeout(() => setLoading(false), LOADING_TIMEOUT)
  }, [])

  /**
   * Spotify
   */

  const onTokenRefresh = async (token: string) => {
    const spotify = cache.get<Spotify>('spotify')!
    const newExpiration = new Date(Date.now() + 60 * 60 * 1000)
    // Update the token in the cache
    const newSpotify: Spotify = { 
      refresh_token: spotify.refresh_token,
      user: spotify.user,
      access_token: token, 
      expires_at: newExpiration.getTime() 
    }

    // Update the cache
    cache.set('spotify', newSpotify)

    // Update the token on the server
    await client.req('update_spotify', { access_token: token, expires_at: newExpiration})
      .catch(console.error)
  }

  const onSpotifyReady = async () => {
    const spotify = cache.get<Spotify>('spotify')!
    // First, sleep 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Now, we need to transfer the playback to the device via the spotify api
    fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${spotify.access_token}`
      },
      body: JSON.stringify({
        device_ids: [player.current?.state.deviceId],
      })
    }).then(res => console.log('Transfered playback to device', res))
      .then(() => setSpotifyLoading(false))
      .catch(err => console.error('Failed to transfer playback to device', err))
  }

  const onSongFinished = () => {
    actualPlayer?.current?.onSongFinished()
  }

  if (loading) return <FullscreenLoading />

  const spotify = cache.get<Spotify>('spotify')!

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
    {
      spotifyLoading ? 
        null :
        <ActualPlayer ref={actualPlayer} spotify={player} session={cache.get<Session>('session')!} />  
    }
  </div>
}

type PlayerState = {
  currentEvent: PlayerEvent | undefined
  queue: PlayerEvent[]
  paused: boolean
}

interface PlayerProps {
  session: Session
  spotify: React.RefObject<SpotifyWebPlayback>
}

class ActualPlayer extends React.Component<PlayerProps, PlayerState> {

  private ws: WSClient
  private playlist: Playlist
  private settings: Settings

  constructor(props: PlayerProps) {
    super(props)

    // Open connection
    this.ws = new WSClient(props.session.session_id, this.onMessage.bind(this))

    this.playlist = cache.get<Playlist>('playlist')!
    this.settings = cache.get<Settings>('settings')!

    this.state = {
      queue: [],
      paused: false,
      currentEvent: undefined
    }

  }

  componentDidMount(): void {
    // component is mounted
    // WE CAN START PLAYING HUTS HUTS
    this.next()
  }

  componentWillUnmount(): void {
    // component is destroyed, so close connection
    this.ws.close()
  }

  async next(): Promise<void> {
    console.log('Calling next()')
    // decide on the next track to play
    // Fetch the latest playlist and settings from the cache
    this.playlist = cache.get<Playlist>('playlist')!
    this.settings = cache.get<Settings>('settings')!

    let queue = this.state.queue

    // Oh no! Queue is empty, lets refill it!
    if (queue.length === 0) {
      console.log('Queue is empty, refilling it')

      // First, grab a recent version of the playlist
      const playlist = await client.req('get_playlist', { playlist_id: this.playlist.id })
      // Also, grab a current version of the users
      const users = await client.req('get_playlist_users', { playlist_id: this.playlist.id })

      // Update the cache
      cache.set('playlist', playlist)
      cache.set('users', users)

      // Generate a new queue
      queue = generateQueue(playlist, this.settings)

      // Update the server
      const ids = []
      for (const q of queue) {
        if (instanceOfSong(q)) {
          ids.push(q.id)
        }
      }
      await client.req('set_queue', { session_id: this.settings.session.session_id, ids })
    }

    // Get the next event
    const currentEvent = queue.shift()

    // Update the state
    this.setState({
      queue: queue,
      currentEvent: currentEvent
    })

    console.log('Next event is going to be', currentEvent)

    if (instanceOfKokopelliEvent(currentEvent)) {
      // Just assume adtrad for now
      const song = getAdtRadSong(this.playlist.id)
      this.props.spotify.current?.play(song.platform_id)
    } else if (instanceOfSong(currentEvent)) {
      // Just assume Spotify for now lol
      this.props.spotify.current?.play(currentEvent.platform_id)

      // Inform the server
      await client.req('set_currently_playing', { session_id: this.settings.session.session_id, song_id: currentEvent.id })
    } else {
      // Unknown event type
      console.error('Unknown event type', currentEvent)
    }
  }

  async onSongFinished() {
    // Song is finished
    await this.next()
  }

  async onMessage(event: Event) {
    console.log('New event', event)
    switch (event.event_type) {
    case 'play_pause':
      this.props.spotify.current?.togglePlay()
      this.setState({ paused: !this.state.paused })
      break

    case 'skip_song':
      await this.next()
      break

    case 'previous_song':
      this.props.spotify.current?.seek(0)
      break

    case 'play_song':
    case 'song_finished':
    case 'playlist_finished':
      // we emit these events so ignore this
      break
    
    default:
      console.log('Unknown event')
      break
    }
  }

  render() {
    if (this.state.currentEvent === undefined) {
      return <FullscreenLoading />
    }

    if (instanceOfKokopelliEvent(this.state.currentEvent)) {
      // Assume adtrad for now
      return <AdtRadEvent playlist={cache.get('platlist')!} />
    } else if (instanceOfSong(this.state.currentEvent)) {
      // Assume Spotify for now
      return <SpotifyEvent song={this.state.currentEvent} paused={this.state.paused} session={cache.get('session')!} />
    }

    return <FullscreenLoading />
  }
}

export default NewPlayer

