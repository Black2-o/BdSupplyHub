'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AdminLoginProps {
  onLogin: (emailOrUsername: string) => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.message || 'Login failed')
        return
      }

      if (result.success && result.user) {
        onLogin(result.user.email) // Assuming onLogin expects email for admin
        setEmailOrUsername('')
        setPassword('')
      } else {
        setError(result.message || 'Login failed')
      }
    } catch (err) {
      // console.error('Login error:', err)
      setError('An unexpected error occurred during login.')
    }
  }

  return (
    <div className="max-w-xs mx-auto p-8 border border-black">
      <h2 className="text-lg font-bold mb-6">Admin Login</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email or Username</label>
          <Input
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter email or username"
            className="border-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter admin password"
            className="border-black"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          onClick={handleLogin}
          className="w-full bg-black text-white hover:bg-gray-800"
        >
          Login
        </Button>
      </div>
    </div>
  )
}
