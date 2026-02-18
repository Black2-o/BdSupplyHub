import { NextRequest, NextResponse } from 'next/server'
import { loginAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { emailOrUsername, password } = body

    const result = await loginAdmin(emailOrUsername, password)

    if (!result.success) {
      return NextResponse.json(result, { status: 401 })
    }

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        message: result.message,
        user: result.user,
      },
      { status: 200 }
    )

    // Set secure httpOnly cookie with user session
    // Note: This cookie will store the admin user data.
    // Ensure this is handled securely and the client-side code doesn't rely on sensitive info in it.
    response.cookies.set('admin_session', JSON.stringify(result.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    // console.error('Admin login API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during admin login',
      },
      { status: 500 }
    )
  }
}
