'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AdminLogin } from '@/components/admin-login'
import type { User } from '@/lib/auth'

export default function AdminLoginPage() {
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
        if (data.user) {
          setCurrentUser(data.user)
          if (data.user.is_admin) {
            router.push('/admin/dashboard') // Redirect admin to dashboard
          } else {
            // If a non-admin user somehow lands here and is logged in, log them out
            await fetch('/api/auth/logout', { method: 'POST' })
            setCurrentUser(null)
          }
        }
      }
    } catch (error) {
      // console.error('Error checking session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async () => {
    // Re-check session after login to verify admin status
    setLoading(true)
    await checkUserSession()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <p>Loading...</p>
      </div>
    )
  }

  // If not an admin and not loading, show the admin login form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <AdminLogin onLogin={handleAdminLogin} />
    </div>
  )
}
