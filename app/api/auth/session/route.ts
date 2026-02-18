import { NextRequest, NextResponse } from 'next/server'
import { getUserById, verifyAdminUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get admin session from cookie
    const sessionCookie = request.cookies.get('admin_session')

    if (!sessionCookie) {
      return NextResponse.json({ user: null, message: 'No admin session found' }, { status: 401 })
    }

    const user = JSON.parse(sessionCookie.value)

    if (!user || !user.id) {
      return NextResponse.json({ user: null, message: 'Invalid session data' }, { status: 401 })
    }

    // Verify if the user is still an active admin
    const isAdmin = await verifyAdminUser(user.id)

    if (!isAdmin) {
      // Clear the invalid session cookie
      const response = NextResponse.json({ user: null, message: 'User is not an admin or session expired' }, { status: 401 })
      response.cookies.delete('admin_session')
      return response
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    // console.error('Session endpoint error:', error)
    return NextResponse.json({ user: null, message: 'An error occurred checking session' }, { status: 500 })
  }
}
