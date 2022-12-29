import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { Sipapu } from 'sipapu'
import App from './App'
import { Account, Client, Databases, Models } from 'appwrite'
import EventEmitter from 'events'

window.sipapu = new Sipapu('wiharu', process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_KEY, process.env.REACT_APP_TAWA_URL)
window.api = new Client()

window.api
  .setEndpoint(process.env.REACT_APP_APPWRITE_URL)
  .setProject(process.env.REACT_APP_APPWRITE_PROJECT)
  .setEndpointRealtime(process.env.REACT_APP_APPWRITE_REALTIME)

window.db = new Databases(window.api, 'main')
window.accountEvents = new EventEmitter()

// const Context = React.createContext<Session | null>(null)
const Context = React.createContext<Models.User<Models.Preferences> | null>(null)

const Index = () => {
  // const [session, setSession] = React.useState<Session | null>(null)
  const [session, setSession] = React.useState<Models.User<Models.Preferences> | null>(null)

  useEffect(() => {
    const account = new Account(window.api)

    // account.deleteSessions()

    account.get()
      .then(setSession)
      .catch(async () => {
        console.log('No account yet, so we create one.')
        // No session, so we create one
        await account.createAnonymousSession()
        await account.get()
          .then(setSession)
      })

    const code = localStorage.getItem('sipapu:session_code')

    if (code) {
      window.sipapu.Session.setSessionId(code)
    }

    // window.sipapu.client.auth.onAuthStateChange((_event, session) => setSession(session))
  }, [])

  return <Context.Provider value={session}>
    <App />
  </Context.Provider>
}

ReactDOM.render(
  <Index />,
  document.getElementById('root')
)