import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase' // Use the public Supabase client
import { ProductWithRelations } from '@/lib/types'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 })
    }

    const { data: productData, error } = await supabase
      .from('products')
      .select('*, product_images(image_url, display_order), product_faqs(*)')
      .eq('id', id)
      .single()

    if (error) {
      console.error(`Error fetching product with ID ${id}:`, error)
      return NextResponse.json({ message: `Error fetching product with ID ${id}`, error: error.message }, { status: 500 })
    }

    if (!productData) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }

    // Transform the data to match ProductWithRelations structure
    const product: ProductWithRelations = {
      ...productData,
      images: productData.product_images
        ? productData.product_images
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .map((img: any) => img.image_url)
        : [],
      faqs: productData.product_faqs || [],
    }

    // Clean up temporary properties from the original productData
    delete (product as any).product_images;
    delete (product as any).product_faqs;

    return NextResponse.json(product, { status: 200 })
  } catch (error) {
    console.error('Single product API error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
