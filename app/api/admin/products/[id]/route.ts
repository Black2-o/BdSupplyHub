import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, verifyAdminMiddleware } from '@/lib/auth'
import { Product, ProductWithRelations } from '@/lib/types'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  // Verify admin status
  const adminUser = await verifyAdminMiddleware(request)
  if (!adminUser) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 })
    }

    const { data: productData, error } = await supabaseAdmin
      .from('products')
      .select('*, product_images(image_url, display_order), product_faqs(*)')
      .eq('id', id)
      .single()

    if (error) {
      console.error(`Error fetching admin product with ID ${id}:`, error)
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
    console.error('Admin Single Product GET API error:', error)
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
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 })
    }

    const body: ProductWithRelations = await request.json()
    const { images, faqs, ...productData } = body

    // Prepare product data for updating the 'products' table
    const productToUpdate: Partial<Product> = { ...productData }
    if (typeof productToUpdate.price === 'string') productToUpdate.price = Number(productToUpdate.price)
    if (typeof productToUpdate.moq === 'string') productToUpdate.moq = Number(productToUpdate.moq)
    if (typeof productToUpdate.low_price === 'string') productToUpdate.low_price = Number(productToUpdate.low_price)
    // Supabase handles updated_at automatically if configured, otherwise we'd set it here.
    // productToUpdate.updated_at = new Date().toISOString();


    const { data: updatedProductData, error: productError } = await supabaseAdmin.from('products').update(productToUpdate).eq('id', id).select().single()

    if (productError) {
      console.error(`Error updating product with ID ${id}:`, productError)
      return NextResponse.json({ message: `Error updating product with ID ${id}`, error: productError.message }, { status: 500 })
    }

    // Handle images: Delete existing and insert new ones
    if (images !== undefined) { // Check if images array was provided in the update request
      // Delete existing images for this product
      const { error: deleteImagesError } = await supabaseAdmin.from('product_images').delete().eq('product_id', id)
      if (deleteImagesError) {
        console.error('Error deleting existing product images:', deleteImagesError)
        return NextResponse.json({ message: 'Error updating product images', error: deleteImagesError.message }, { status: 500 })
      }

      // Insert new images if provided
      if (images.length > 0) {
        const imagesToInsert = images.map((url, index) => ({
          product_id: id,
          image_url: url,
          display_order: index,
        }))
        const { error: insertImagesError } = await supabaseAdmin.from('product_images').insert(imagesToInsert)
        if (insertImagesError) {
          console.error('Error inserting new product images:', insertImagesError)
          return NextResponse.json({ message: 'Error inserting new product images', error: insertImagesError.message }, { status: 500 })
        }
      }
    }

    // Handle FAQs: Delete existing and insert new ones
    if (faqs !== undefined) { // Check if faqs array was provided in the update request
      // Delete existing FAQs for this product
      const { error: deleteFaqsError } = await supabaseAdmin.from('product_faqs').delete().eq('product_id', id)
      if (deleteFaqsError) {
        console.error('Error deleting existing product FAQs:', deleteFaqsError)
        return NextResponse.json({ message: 'Error updating product FAQs', error: deleteFaqsError.message }, { status: 500 })
      }

      // Insert new FAQs if provided
      if (faqs.length > 0) {
        const faqsToInsert = faqs.map((faq, index) => ({
          product_id: id,
          question: faq.question,
          answer: faq.answer,
          display_order: index,
        }))
        const { error: insertFaqsError } = await supabaseAdmin.from('product_faqs').insert(faqsToInsert)
        if (insertFaqsError) {
          console.error('Error inserting new product FAQs:', insertFaqsError)
          return NextResponse.json({ message: 'Error inserting new product FAQs', error: insertFaqsError.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json(updatedProductData, { status: 200 })
  } catch (error) {
    console.error('Admin Product PUT API error:', error)
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
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('products').delete().eq('id', id)

    if (error) {
      console.error(`Error deleting product with ID ${id}:`, error)
      return NextResponse.json({ message: `Error deleting product with ID ${id}`, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Admin Product DELETE API error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
