import { Account, Models } from 'appwrite'
import React, { useEffect, useState } from 'react'
import { saveCode } from '../data'
import FullscreenLoading from './FullscreenLoading'

const LOADING_TIMEOUT = 2500

const Home = () => {

  const [code, setCode]       = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [user, setUser]       = useState<Models.User<Models.Preferences>>()
  
  useEffect(() => {
    fetch(process.env.REACT_APP_TAWA_URL + 'session/create-temp')
      .then(res => res.json())
      .then(async (res) => {
        const acc = new Account(window.api)
        const user = await acc.get()
        setUser(user)
        return res
      })
      .then(res => setCode(res.session_id))
      .then(() => setTimeout(() => setLoading(false), LOADING_TIMEOUT))
      .catch(err => alert(err))
  }, [])

  useEffect(() => {
    if (!code || code === undefined) return

    console.log(`Listening to ${code} as user ${user?.$id}!`)

    const channel = `databases.main.collections.temp_session.documents.${code}`

    const unsub = window.api.subscribe(channel, async event => {
      if (event.events.includes(channel + '.delete')) {
        console.log('Temp session deleted, redirecting to player!')
        saveCode(code)

        await fetch(process.env.REACT_APP_TAWA_URL + 'session/register-player', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: user?.$id,
            session_id: code
          })
        })

        window.location.href = '/player'
      }
    })

    return unsub
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