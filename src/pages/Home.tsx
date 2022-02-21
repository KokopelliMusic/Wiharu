import React, { useEffect, useState } from 'react'
import { EventTypes, SessionCreatedEventData } from 'sipapu/dist/src/events'
import { saveCode, saveSettings, saveSpotify, saveUid } from '../data'
import FullscreenLoading from './FullscreenLoading'

const LOADING_TIMEOUT = 2500

const Home = () => {

  const [code, setCode]       = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    window.sipapu.Session.new()
      .then(setCode)
      .then(() => setTimeout(() => setLoading(false), LOADING_TIMEOUT))
      .catch(err => alert(err))
  }, [])

  useEffect(() => {
    if (!code || code === undefined) return

    window.sipapu.Session.setSessionId(code)

    const cleanup = window.sipapu.Session.watch(code, async event => {
      if (event.eventType === EventTypes.SESSION_CREATED) {
        // Session has been claimed, so save this info and redirect to the player
        const d = JSON.parse(event.data as unknown as string) as SessionCreatedEventData
        if (!d.error) {
          saveSettings(d.settings)
          saveCode(event.session)
          saveUid(d.userId)
          saveSpotify({ accessToken: d.spotifyAccessToken, refreshToken: d.spotifyRefreshToken })
          window.location.href = '/player'
        } else {
          console.error('Something went wrong with this event:', event)
          alert('Something went wrong, try reloading')
        }
      }
    })

    // this is a very interesting cleanup function lol
    return () => {
      const fun = async () => (await cleanup)()
      fun()
    }
  }, [code])

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