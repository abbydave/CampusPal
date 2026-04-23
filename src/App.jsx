import { useState } from 'react'
import Login from './components/Login'
import Chat from './components/Chat'

function hasSession() {
  return document.cookie.split(';').some(c => c.trim().startsWith('campuspal_session='))
}

function clearSession() {
  document.cookie = 'campuspal_session=; path=/; max-age=0'
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(hasSession)

  function handleLogin() {
    setLoggedIn(true)
  }

  function handleLogout() {
    clearSession()
    setLoggedIn(false)
  }

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return <Chat onLogout={handleLogout} />
}
