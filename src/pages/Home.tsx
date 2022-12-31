import React, { useEffect, useState } from 'react'
import { cache } from '../data/cache'
// import { saveSessionID, saveSettings, saveSpotify, saveUid } from '../data'
import { client, WSClient } from '../data/client'
import { Event } from '../types/tawa'
import FullscreenLoading from './FullscreenLoading'

const LOADING_TIMEOUT = 2500

const Home = () => {

  const [code, setCode]       = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [event, setEvent]     = useState<Event>()

  useEffect(() => {
    client.req('create_temp_session', {}, false)
      .then(res => {
        console.log('New session: ', res)
        setCode(res.session_id)
      })
      .then(() => setTimeout(() => setLoading(false), LOADING_TIMEOUT))
      .catch(err => {
        console.error(err)
        alert(err.message)
      })
  }, [])

  useEffect(() => {
    if (!code || code === undefined) return

    console.log('Listening on ' + code + '...')

    const ws = new WSClient(code, setEvent)

    return () => {
      alert()
      console.log('Closing connection...')
      ws.close()
      alert()
    }
  }, [code])

  useEffect(() => {
    if (!event) return

    if (event.event_type === 'session_created') {
      console.log('Session created!', event)
      // @ts-expect-error hou je bek ts ik weet wat ik doe
      const d = JSON.parse(event.data)

      cache.set('session', d.session)
      cache.set('settings', d.settings)
      cache.set('spotify', d.spotify)
      cache.set('user', d.user)
      cache.set('user_token', d.user_token)

      window.location.href = '/player'

    } else {
      console.log('Other event:', event)
    }
  
  }, [event])

  if (loading) 
    return <FullscreenLoading />

  return <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
    <div className="max-w-lg min-w-lg w-full space-y-8">
      <div>
        <img
          className="mx-auto h-40 w-auto"
          src="./kokopelli.png"
          alt="Kokopelli"
        />
        <h1 className="pt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to Kokopelli
        </h1>
        <p className="pt-3 text-center text-gray-600 text-lg">
          Link this device with the code below
        </p>
      </div>
      <div>
        <h1 className="text-center text-9xl font-black text-gray-900 uppercase">
          { code.split('').join(' ') }
        </h1>
      </div>
    </div>
  </div>
}

export default Home