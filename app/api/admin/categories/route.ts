import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdminMiddleware } from '@/lib/auth'
import { Category } from '@/lib/types'

export async function GET(request: NextRequest) {
  // Verify admin status
  const adminUser = await verifyAdminMiddleware(request)
  if (!adminUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: categories, error } = await supabaseAdmin.from('categories').select('*')

    if (error) {
      // console.error('Error fetching admin categories:', error)
      return NextResponse.json({ message: 'Error fetching categories', error: error.message }, { status: 500 })
    }

    return NextResponse.json(categories, { status: 200 })
  } catch (error) {
    // console.error('Admin Categories GET API error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Verify admin status
  const adminUser = await verifyAdminMiddleware(request)
  if (!adminUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: { name: string } = await request.json()
    if (!body.name) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 })
    }

    const newCategory = { // Removed explicit type Category here, will let TS infer based on fields provided
      name: body.name,
    }

    const { data, error } = await supabaseAdmin.from('categories').insert([newCategory]).select().single()

    if (error) {
      // console.error('Error adding category:', error)
      return NextResponse.json({ message: 'Error adding category', error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    // console.error('Admin Categories POST API error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
