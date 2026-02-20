import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdminMiddleware } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Verify admin status
  const adminUser = await verifyAdminMiddleware(request)
  if (!adminUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ message: 'Shop ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('shops').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ message: 'Error deleting shop', error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Shop deleted successfully' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Verify admin status
  const adminUser = await verifyAdminMiddleware(request)
  if (!adminUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const body: { name: string } = await request.json()

    if (!id) {
      return NextResponse.json({ message: 'Shop ID is required' }, { status: 400 })
    }

    if (!body.name) {
      return NextResponse.json({ message: 'Shop name is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('shops')
      .update({ name: body.name })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: 'Error updating shop', error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
