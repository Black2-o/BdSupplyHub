import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create Supabase client for auth operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create service role client for backend operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export interface User {
  id: string
  email: string
  username: string
  name: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: User
  error?: string
}

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

// Compare password with hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}



// Login Admin
export async function loginAdmin(emailOrUsername: string, password: string): Promise<AuthResponse> {
  try {
    if (!emailOrUsername || !password) {
      return {
        success: false,
        message: 'Email/username and password are required',
      }
    }

    // Find user by email or username
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
      .single()

    if (error || !user) {
      return {
        success: false,
        message: 'Invalid email/username or password',
      }
    }

    // Check if user is an admin
    if (!user.is_admin) {
      return {
        success: false,
        message: 'Access denied: Not an administrator',
      }
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash)

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email/username or password',
      }
    }

    return {
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        is_admin: user.is_admin,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      message: 'An error occurred during login',
    }
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return null
    }

    return user as User
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

// Verify admin user
export async function verifyAdminUser(userId: string): Promise<boolean> {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()

    return user?.is_admin === true
  } catch (error) {
    console.error('Error verifying admin:', error)
    return false
  }
}

// Middleware-like function to verify admin status from a NextRequest
import { NextRequest } from 'next/server'; // Import NextRequest

export async function verifyAdminMiddleware(request: NextRequest): Promise<User | null> {
  try {
    const sessionCookie = request.cookies.get('admin_session')
    if (!sessionCookie) {
      return null
    }

    const user = JSON.parse(sessionCookie.value) as User

    if (!user || !user.id) {
      return null
    }

    const isAdmin = await verifyAdminUser(user.id)

    if (!isAdmin) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error in verifyAdminMiddleware:', error)
    return null
  }
}
