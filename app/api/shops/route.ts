import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase' // Use the public Supabase client

export async function GET(request: NextRequest) {
  try {
    const { data: shops, error } = await supabase.from('shops').select('*').order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ message: 'Error fetching shops', error: error.message }, { status: 500 })
    }

    return NextResponse.json(shops, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
