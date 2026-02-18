import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdminMiddleware } from '@/lib/auth'
import { Product, ProductWithRelations } from '@/lib/types'

export async function GET(request: NextRequest) {
  // Verify admin status
  const adminUser = await verifyAdminMiddleware(request)
  if (!adminUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: productsData, error } = await supabaseAdmin
      .from('products')
      .select('*, product_images(image_url, display_order), product_faqs(*)')

    if (error) {
      // console.error('Error fetching admin products:', error)
      return NextResponse.json({ message: 'Error fetching products', error: error.message }, { status: 500 })
    }

    // Transform the data to match ProductWithRelations structure
    const products: ProductWithRelations[] = productsData.map((product: any) => {
      const images = product.product_images
        ? product.product_images
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .map((img: any) => img.image_url)
        : []
      
      const faqs = product.product_faqs || [];

      // Remove the original product_images and product_faqs objects from the product
      const { product_images, product_faqs, moq, fabricType, sizeRange, lowPrice, ...rest } = product;

      return {
        ...rest,
        images,
        faqs,
        shop_name: moq,
        fabricType: fabricType,
        sizeRange: sizeRange,
        lowPrice: lowPrice,
      }
    })

    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    // console.error('Admin Products GET API error:', error)
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
    const body: ProductWithRelations = await request.json()
    const { images, faqs, ...productData } = body

    // Basic validation for productData
    if (!productData.name || !productData.category_id || !productData.price) {
      return NextResponse.json({ message: 'Missing required product fields (name, category_id, price)' }, { status: 400 })
    }

    // Prepare product data for insertion into 'products' table
    const { shop_name, fabricType, sizeRange, lowPrice, ...restOfProductData } = productData;
    const productToInsert = {
      ...restOfProductData,
      price: Number(productData.price),
      moq: shop_name,
      fabricType: fabricType,
      sizeRange: sizeRange,
      lowPrice: lowPrice,
      recommended: productData.recommended || false,
    }

    // Insert the product into the products table
    const { data: product, error: productError } = await supabaseAdmin.from('products').insert([productToInsert]).select().single()

    if (productError) {
      // console.error('Error adding product:', productError)
      return NextResponse.json({ message: 'Error adding product', error: productError.message }, { status: 500 })
    }

    // Insert product images if provided
    if (images && images.length > 0) {
      const imagesToInsert = images.map((url, index) => ({
        product_id: product.id,
        image_url: url,
        display_order: index,
      }))
      const { error: imagesError } = await supabaseAdmin.from('product_images').insert(imagesToInsert)
      if (imagesError) {
        // console.error('Error adding product images:', imagesError)
        // Optionally, handle rollback of product if image insertion fails
        return NextResponse.json({ message: 'Error adding product images', error: imagesError.message }, { status: 500 })
      }
    }

    // Insert product FAQs if provided
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
        // Optionally, handle rollback of product if FAQ insertion fails
        return NextResponse.json({ message: 'Error adding product FAQs', error: faqsError.message }, { status: 500 })
      }
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    // console.error('Admin Products POST API error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
