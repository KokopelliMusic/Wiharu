/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useState } from 'react'
import SpotifyWebPlayback from 'react-spotify-web-playback-sdk-headless'
import { ProfileType } from 'sipapu/dist/src/services/profile'
import { SessionType } from 'sipapu/dist/src/services/session'
import { SongType } from 'sipapu/dist/src/services/song'
import SpotifyEvent from '../events/SpotifyEvent'
import { shuffleRandomWithoutEvents } from '../shuffle'

interface ShufflerProps {
  spotifyPlayer: React.RefObject<SpotifyWebPlayback>
  paused: boolean
  session: SessionType
  songFinished: boolean
}

const Shuffler = ({ spotifyPlayer, paused, session, songFinished }: ShufflerProps) => {

  const [queue, setQueue]     = useState<SongType[]>([])
  const [current, setCurrent] = useState<SongType>()
  const [user, setUser]       = useState<ProfileType>()

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
  }, [current])

  const next = async () => {
    let q = queue

    if (queue.length === 0) {
      q = await window.sipapu.Playlist
        .getWithSongs(session.playlistId)
        .then(shuffleRandomWithoutEvents)
        .then(p => p.slice(0,10))
    }

    const next = q[0]
    const rest = q.slice(1)

    // Fetch username
    if (next.addedBy) {
      setUser(await window.sipapu.Profile.get(next.addedBy))
    }

    setCurrent(next)
    setQueue(rest)
  }

  return current === undefined ? null : <SpotifyEvent song={current!} paused={paused} session={session} user={user!}/>
}

export default Shuffler