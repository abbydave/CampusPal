import { useState } from 'react'

export default function Login({ onLogin }) {
  const [matric, setMatric] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!matric.trim()) {
      setError('Please enter your matric number.')
      return
    }
    if (password !== 'password') {
      setError('Incorrect password. Please try again.')
      return
    }
    document.cookie = 'campuspal_session=1; path=/; max-age=86400'
    onLogin()
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">C</div>
          <span className="login-logo-text">CampusPal</span>
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in with your UNILAG student credentials</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="matric">Matric Number</label>
            <input
              id="matric"
              className="form-input"
              type="text"
              placeholder="e.g. 190404001"
              value={matric}
              onChange={e => { setMatric(e.target.value); setError('') }}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="login-btn" type="submit">Sign In</button>
        </form>
      </div>
    </div>
  )
}
