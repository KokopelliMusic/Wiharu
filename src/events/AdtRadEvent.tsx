import React, { useEffect, useState } from 'react'
import { Session } from 'sipapu-2'
import Wheel from '../components/Wheel'
import { getUsernamesFromCurrentSession } from '../data'
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
  session: Session
}

/**
 * ty
 * https://codepen.io/barney-parker/pen/OPyYqy
 */

const AdtRadEvent = ({ session }: AdtRadEventProps) => {

  const [loading, setLoading]         = useState<boolean>(true)
  const [fakeLoading, setFakeLoading] = useState<boolean>(true)
  const [users, setUsers]             = useState<string[]>([])

  useEffect(() => {
    (async () => {
      getUsernamesFromCurrentSession(session)
        .then(res => setUsers(res.users))
        .then(() => setFakeLoading(false))
    })()
  }, [])

  useEffect(() => {
    if (!fakeLoading) {
      setTimeout(() => setLoading(false), LOAD_TIME)
    }
  }, [fakeLoading])

  if (loading) {
    return <FullscreenLoading />
  }

  return <div className="w-screen h-screen flex justify-center">
    <Wheel timeout={WAIT_TIME} items={users} />
  </div>
}

export default AdtRadEvent