import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdminMiddleware } from '@/lib/auth'
import { Shop } from '@/lib/types'

export async function GET(request: NextRequest) {
  // Verify admin status
  const adminUser = await verifyAdminMiddleware(request)
  if (!adminUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: shops, error } = await supabaseAdmin.from('shops').select('*').order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ message: 'Error fetching shops', error: error.message }, { status: 500 })
    }

    return NextResponse.json(shops, { status: 200 })
  } catch (error) {
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
      return NextResponse.json({ message: 'Shop name is required' }, { status: 400 })
    }

    const newShop = {
      name: body.name,
    }

    const { data, error } = await supabaseAdmin.from('shops').insert([newShop]).select().single()

    if (error) {
      return NextResponse.json({ message: 'Error adding shop', error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
