'use client'

import { AdminPanel } from '@/components/admin-panel'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/lib/auth'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUserSession()
  }, [])

  const checkUserSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        if (data.user && data.user.is_admin) {
          setCurrentUser(data.user)
        } else {
          // Not an admin or not logged in, redirect to admin login
          router.push('/admin')
        }
      } else {
        // No session, redirect to admin login
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error checking session:', error)
      router.push('/admin') // Redirect on error
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setCurrentUser(null)
      router.push('/admin') // Redirect to admin login after logout
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <p>Loading...</p>
      </div>
    )
  }

  if (currentUser && currentUser.is_admin) {
    return <AdminPanel onLogout={handleLogout} />
  }

  return null // Should not reach here if redirects are working correctly
}
