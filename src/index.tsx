import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { Session } from '@supabase/gotrue-js'
import { Sipapu } from 'sipapu'
import App from './App'

window.sipapu = new Sipapu('wiharu', process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_KEY, process.env.REACT_APP_TAWA_URL)
const Context = React.createContext<Session | null>(null)

const Index = () => {
  const [session, setSession] = React.useState<Session | null>(null)

  useEffect(() => {
    setSession(window.sipapu.client.auth.session())

    const session_id = localStorage.getItem('sipapu::session_id')

    if (session_id) {
      // TODO
      // window.sipapu.Session.setSessionId(code)
    }

  }, [])

  return <Context.Provider value={session}>
    <App />
  </Context.Provider>
}

ReactDOM.render(
  <Index />,
  document.getElementById('root')
)