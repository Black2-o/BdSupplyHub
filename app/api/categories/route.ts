import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase' // Use the public Supabase client

export async function GET(request: NextRequest) {
  try {
    const { data: categories, error } = await supabase.from('categories').select('*')

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ message: 'Error fetching categories', error: error.message }, { status: 500 })
    }

    return NextResponse.json(categories, { status: 200 })
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
