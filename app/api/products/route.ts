import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase' // Use public supabase client
import { supabaseAdmin, verifyAdminMiddleware } from '@/lib/auth'
import { ProductWithRelations } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12'); // Default limit to 12
    const categoryId = searchParams.get('categoryId'); // Get categoryId from query params
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Correct Supabase v2 query pattern: call .select() first
    let query = supabase
      .from('products')
      .select('*, categories(name), product_images(image_url, display_order)', { count: 'exact' });

    if (categoryId && categoryId !== '') {
      query = query.eq('category_id', categoryId);
    }

    // Now execute the query with range and get data and count
    const { data: productsData, count, error } = await query.range(from, to);

    if (error) {
      // console.error('Error fetching products:', error);
      return NextResponse.json({ message: 'Error fetching products', error: error.message }, { status: 500 });
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

    return NextResponse.json({
      products,
      totalCount: count,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    }, { status: 200 })
  } catch (error: unknown) { // Use unknown for safety
    // console.error('Products API error:', error)
    // Safely extract error message
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Internal server error: ${errorMessage}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // First, verify the user is an authenticated admin
  const adminUser = await verifyAdminMiddleware(request)
  if (!adminUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: ProductWithRelations = await request.json()
    const { images, faqs, ...productData } = body

    // Basic validation for productData
    if (!productData.name || !productData.category_id || productData.price === undefined) {
      return NextResponse.json({ message: 'Missing required product fields (name, category_id, price)' }, { status: 400 })
    }

    // Prepare product data for insertion into 'products' table
    const productToInsert = {
      name: productData.name,
      category_id: productData.category_id,
      description: productData.description,
      moq: productData.shop_name, // Map shop_name from frontend to moq for DB
      fabric_type: productData.fabricType, // Map fabricType from frontend to fabric_type for DB
      size_range: productData.sizeRange, // Map sizeRange from frontend to size_range for DB
      price: Number(productData.price), // Ensure price is a number
      low_price: productData.lowPrice ? Number(productData.lowPrice) : null, // Map lowPrice to low_price for DB
      recommended: productData.recommended || false,
    }

    const { data: product, error: productError } = await supabaseAdmin.from('products').insert([productToInsert]).select().single()

    if (productError) {
      // console.error('Error adding product:', productError)
      return NextResponse.json({ message: 'Error adding product', error: productError.message }, { status: 500 })
    }

    // Handle images if provided
    if (images && images.length > 0) {
      const imagesToInsert = images.map((url, index) => ({
        product_id: product.id,
        image_url: url,
        display_order: index,
      }))
      const { error: imagesError } = await supabaseAdmin.from('product_images').insert(imagesToInsert)
      if (imagesError) {
        // console.error('Error adding product images:', imagesError)
        return NextResponse.json({ message: 'Error adding product images', error: imagesError.message }, { status: 500 })
      }
    }

    // Handle FAQs if provided
    if (faqs && faqs.length > 0) {
      const faqsToInsert = faqs.map((faq, index) => ({
        product_id: product.id,
        question: faq.question,
        answer: faq.answer,
        display_order: index,
      }))
      const { error: faqsError } = await supabaseAdmin.from('product_faqs').insert(faqsToInsert)
      if (faqsError) {
        // console.error('Error adding product FAQs:', faqsError)
        return NextResponse.json({ message: 'Error adding product FAQs', error: faqsError.message }, { status: 500 })
      }
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    // console.error('Products API POST error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
