import React, { useEffect, useState } from 'react'
import { PlaylistWithSongsType } from 'sipapu/dist/src/services/playlist'
import Wheel from '../components/Wheel'
import FullscreenLoading from '../pages/FullscreenLoading'

const WAIT_TIME = 30_000
const LOAD_TIME = 5_000

export const getAdtRadSong = () => {
  const songs = [
    '4cCL2ohDQEOV1qMeEoUwma'    // Bier - Steen
    , '2bJaewMbxlwnm69zvOAq3s'  // Adje voor de Sfeer - Rene Karst
  ]

  return songs[Math.floor(Math.random() * songs.length)]
}

interface AdtRadEventProps {
  playlist: PlaylistWithSongsType
}

/**
 * ty
 * https://codepen.io/barney-parker/pen/OPyYqy
 */

const AdtRadEvent = ({ playlist }: AdtRadEventProps) => {

  const [users, setUsers]     = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    playlist.users.forEach(u => {
      window.sipapu.Profile.get(u).then(p => setUsers(u => [...u, p.username]))
    })
    setTimeout(() => setLoading(false), LOAD_TIME)
  }, [])

  if (loading) {
    return <FullscreenLoading />
  }

  return <div className="w-screen h-screen flex justify-center">
    <Wheel timeout={WAIT_TIME} items={users} />
  </div>
}

export default AdtRadEvent