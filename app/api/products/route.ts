import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase' // Use public supabase client
import { ProductWithRelations } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { data: productsData, error } = await supabase.from('products').select('*, categories(name), product_images(image_url, display_order)')

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ message: 'Error fetching products', error: error.message }, { status: 500 })
    }

    // Transform the data to match ProductWithRelations structure
    const products: ProductWithRelations[] = productsData.map((product: any) => {
      const images = product.product_images
        ? product.product_images
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .map((img: any) => img.image_url)
        : []
      
      const category_name = product.categories?.name;

      // Remove the original product_images and categories objects from the product
      const { product_images, categories, moq, fabricType, sizeRange, lowPrice, ...rest } = product;

      return {
        ...rest,
        images,
        category_name,
        shop_name: moq,
        fabricType: fabricType,
        sizeRange: sizeRange,
        lowPrice: lowPrice,
      }
    })

    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // First, verify the user is an authenticated admin
  const adminUser = await verifyAdminMiddleware(request)
  if (!adminUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const {
      name,
      category_id, // This one is already snake_case in your payload
      description,
      moq,
      fabricType, // camelCase from client
      sizeRange, // camelCase from client
      price,
      lowPrice, // camelCase from client
      recommended,
      // The 'images' and 'faqs' fields are ignored here as they are not in the 'products' table
    } = await request.json()

    // This is where the conversion happens: mapping camelCase from the request to snake_case for the DB.
    const productData = {
      name,
      category_id,
      description,
      moq: String(moq), // DB column is 'text'
      fabricType: fabricType, // Convert to snake_case
      sizeRange: sizeRange, // Convert to snake_case
      price: String(price), // DB column is 'text'
      lowPrice: lowPrice ? String(lowPrice) : null, // Convert to snake_case
      recommended,
    }

    const { data, error } = await supabaseAdmin.from('products').insert(productData).select().single()

    if (error) {
      console.error('Error adding product:', error)
      // This is likely a client-side data issue, so a 400 status is more appropriate
      return NextResponse.json({ message: 'Error adding product', error: error.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Products API POST error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
