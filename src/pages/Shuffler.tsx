/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useState } from 'react'
import SpotifyWebPlayback from 'react-spotify-web-playback-sdk-headless'
import { cache } from '../data/cache'
import { client, WSClient } from '../data/client'
import { generateQueue, PlayerEvent } from '../data/shuffle'
import AdtRadEvent, { getAdtRadSong } from '../events/AdtRadEvent'
import SpotifyEvent from '../events/SpotifyEvent'
import { KokopelliEvent, Song, Playlist, Session, Settings, User, instanceOfKokopelliEvent, instanceOfSong } from '../types/tawa'

interface ShufflerProps {
  spotifyPlayer: React.RefObject<SpotifyWebPlayback>
  songFinished: boolean
}

const Shuffler = ({ spotifyPlayer, songFinished }: ShufflerProps) => {

  const [queue, setQueue]       = useState<PlayerEvent[]>([])
  const [current, setCurrent]   = useState<PlayerEvent>()
  const [user, setUser]         = useState<User>()
  const [empty, setEmpty]       = useState<boolean>(false)
  const [paused, setPaused]     = useState<boolean>(false)
  const [finished, setFinished] = useState<boolean>(false)
  const [playlist, setPlaylist] = useState<Playlist>()
  const [session, setSession]   = useState<Session>()
  const [settings, setSettings] = useState<Settings>()


  useEffect(() => {
    const ses = cache.get<Session>('session')
    const set = cache.get<Settings>('settings')

    if (!ses || !set) {
      alert('I cannot seem to find your session, sending you back to the home page in 5 seconds')
      setTimeout(() => window.location.href = '/', 5000)
    }

    setSession(ses)
    setSettings(set)

    const ws = new WSClient(ses!.session_id, event => {
      console.log('Received event:', event)
      switch (event.event_type) {
      
      case 'play_pause':
        spotifyPlayer.current?.togglePlay()
        setPaused(p => !p)
        break

      case 'youtube_song_added':
      case 'spotify_song_added':
        if (queue.length === 0 && empty === true) {
          setEmpty(false)
          location.reload()
        }
        break

      case 'previous_song':
        spotifyPlayer.current?.seek(0)
        break

      case 'skip_song':
        setFinished(f => !f)
        break

      case 'play_song':
      case 'song_finished':
      case 'playlist_finished':
        // we emit these events so ignore this
        break

      default:
        console.log('I do not know (yet) what to do with this eventType:', event.event_type)
        break
      }
    })

    return () => {
      ws.close()
    }
  }, [])


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

    if (instanceOfKokopelliEvent(current)) {
      // Current event is a KokopelliEvent
      const e = current as KokopelliEvent

      let track: Song
    
      switch (e.name) {
      case 'adtrad':
        track = getAdtRadSong(playlist!.id)
        break
      
      case 'opus':
        // Opus - Erik Prydz
        track = {
          id: -1,
          title: 'Opus',
          artists: 'Erik Prydz',
          album: 'Opus',
          length: 543453,
          cover: 'https://i.scdn.co/image/ab67616d0000b27324492f2ba3a1d995e1faf5d8',
          added_by: {
            id: -1,
            username: 'Kokopelli',
            profile_picture: 'https://i.scdn.co/image/ab67616d0000b27324492f2ba3a1d995e1faf5d8'
          },
          song_type: 'spotify',
          platform_id: 'spotify:track:3v2oAQomhOcYCPPHafS3KV',
          playlist_id: playlist!.id,
          play_count: 0
        } 
        
        break

      default:
        console.error('Unknown KokopelliEvent', e)
        throw new Error('Unknown KokopelliEvent')
      }

      // Play the song and push the event to the server
      spotifyPlayer.current?.play(track.platform_id)
      client.pushEvent('play_song', { song: track })

    } else if (instanceOfSong(current)) {
      // Current event is a song
      // TODO assume song is Spotify

      spotifyPlayer.current?.play(current.platform_id)
      client.pushEvent('play_song', { song: current })

    } else {
      console.error('Unknown event type', current)
    }
  }, [current])

  const next = async () => {
    console.log('QUEUE:', queue)

    let q = queue

    if (queue.length === 0) {
      // Need to still fetch this since the playlist object in Session has (likely) no songs
      let pid = ''

      if (!session) {
        const c = cache.get<Session>('session')
        // @ts-expect-error je moeder
        pid = c?.playlist_id
      } else {
        // @ts-expect-error Weird api behaviour
        pid = session.playlist_id
      }

      let set = settings

      if (!set) {
        const c = cache.get<Settings>('settings')
        set = c!
      }

      q = await client.req('get_playlist', { playlist_id: pid })
        .then(p => {
          setPlaylist(p)
          cache.storePlaylist(p)

          if (p.songs.length === 0) {
            setEmpty(true)
            return []
          }

          return generateQueue(p, set!)
        })
      console.log(q)
    }

    if (q.length !== 0) {
      const next = q[0]
      const rest = q.slice(1)
  
      setQueue(rest)
      setCurrent(next)
    }
  }

  if (empty) {
    return <BrokenState 
      title="Playlist empty!"
      message="Add songs to your playlist to get started. After that press F5 to start playing!"
    />
  }

  if (current === undefined) {
    return null
  }

  if (instanceOfKokopelliEvent(current)) {
    switch (current.name) {
    case 'adtrad':
      return <AdtRadEvent playlist={playlist!} />
    case 'opus':
      return <div>Opus!</div>
    default:
      return <BrokenState title="Oh no!" message={`Event ${current.name} is unknown and cannot be played. Press F5 or something`}/>
    }  
  } 

  return <SpotifyEvent song={current!} paused={paused} session={session!} />
}

type BrokenStateProps = {
  title: string
  message: string
}

const BrokenState = ({ title, message }: BrokenStateProps) => {
  return <div className="min-h-screen min-w-screen flex items-center justify-center flex-col bg-red-800">
    <img 
      className="object-contain h-52" 
      src="/kokopelli.png" 
      alt="Kokopelli Logo"/>
    <h1 className="text-3xl font-extrabold text-white">
      {title}
    </h1>
    <h2 className="text-xl font-bold text-white">
      {message}
    </h2>
  </div>
}

export default Shuffler