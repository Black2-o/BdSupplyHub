import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdminMiddleware } from '@/lib/auth'
import { Category } from '@/lib/types'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  // Verify admin status
  const adminUser = await verifyAdminMiddleware(request)
  if (!adminUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 })
    }

    const { data: category, error } = await supabaseAdmin.from('categories').select('*').eq('id', id).single()

    if (error) {
      console.error(`Error fetching admin category with ID ${id}:`, error)
      return NextResponse.json({ message: `Error fetching category with ID ${id}`, error: error.message }, { status: 500 })
    }

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category, { status: 200 })
  } catch (error) {
    console.error('Admin Single Category GET API error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  // Verify admin status
  const adminUser = await verifyAdminMiddleware(request)
  if (!adminUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 })
    }

    const body: Partial<Category> = await request.json()
    // Ensure slug is generated if name is updated
    if (body.name && !body.slug) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '')
    }

    const { data, error } = await supabaseAdmin.from('categories').update(body).eq('id', id).select().single()

    if (error) {
      console.error(`Error updating category with ID ${id}:`, error)
      return NextResponse.json({ message: `Error updating category with ID ${id}`, error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Admin Category PUT API error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  // Verify admin status
  const adminUser = await verifyAdminMiddleware(request)
  if (!adminUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id)

    if (error) {
      console.error(`Error deleting category with ID ${id}:`, error)
      return NextResponse.json({ message: `Error deleting category with ID ${id}`, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Admin Category DELETE API error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
