'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Loader2 } from 'lucide-react' // Added Loader2 import
import type { Product, Category, ProductWithRelations } from '@/lib/types'

interface ProductDetailsPageProps {
  params: Promise<{ id: string }> // Changed from { id: string } to Promise<{ id: string }>
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const unwrappedParams = React.use(params);
  const productId = unwrappedParams.id;
  const [product, setProduct] = useState<ProductWithRelations | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [relatedProducts, setRelatedProducts] = useState<ProductWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        if (!productId) {
          setError('Product ID is missing')
          setLoading(false)
          return
        }

        const [productResponse, categoriesResponse, allProductsResponse] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch('/api/categories'),
          fetch('/api/products'), // Fetch all products to find related ones
        ])

        if (!productResponse.ok) {
          throw new Error('Failed to fetch product')
        }
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories')
        }
        if (!allProductsResponse.ok) {
          throw new Error('Failed to fetch all products for related items')
        }

        const productData: ProductWithRelations = await productResponse.json()
        const categoriesData: Category[] = await categoriesResponse.json()
        const allProductsResult = await allProductsResponse.json() // Get the full response object
        const allProductsData: ProductWithRelations[] = allProductsResult.products // Extract the products array

        setProduct(productData)
        setCategories(categoriesData)

        // Filter related products
        const related = allProductsData
          .filter(
            (p) =>
              p.category_id === productData.category_id &&
              p.id !== productData.id
          )
          .slice(0, 3)
        setRelatedProducts(related)
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data.')
        // console.error('Failed to fetch product details:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [productId]) // Depend on productId

  const [mainImage, setMainImage] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setMainImage(product.images[0])
    }
  }, [product])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        <p className="ml-2 text-gray-500">Loading product details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <p>Product not found</p>
      </div>
    )
  }

  const category = categories.find((c) => c.id === product.category_id)

  return (
    <div className="max-w-7xl mx-auto p-8">
      <Link href="/" className="mb-8 block text-sm font-bold hover:underline">
        ← Back to All Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div>
          <div className="aspect-square bg-secondary border border-black mb-4 flex items-center justify-center relative">
            {mainImage ? (
              <Image
                src={mainImage || "/placeholder.svg"}
                alt={product.name}
                fill={true}
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className={`aspect-square border-2 ${
                    img === mainImage ? 'border-black' : 'border-gray-200'
                  } cursor-pointer relative`}
                  onClick={() => setMainImage(img)}
                >
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    fill={true}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

                  <div className="space-y-8">
                    <div>
                      <p className="text-sm font-bold text-muted-foreground mb-2">
                        {category?.name || product.category_id} {/* Display category name or ID if name not found */}
                      </p>
                      <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                      {product.price && (
                        <p className="text-3xl font-bold text-black mb-4">৳{product.price}</p>
                      )}
                      <p className="text-base leading-relaxed text-gray-700">
                        {product.description}
                      </p>
                    </div>
          <div className="border-t border-b border-black py-6 space-y-3">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Shop Name
              </p>
              <p className="font-bold">{product.shop_name}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Fabric Type
              </p>
              <p className="font-bold">{product.fabricType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Available Sizes
              </p>
              <p className="font-bold">{product.sizeRange || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() =>
                window.open(
                  `https://wa.me/8801345680081?text=${encodeURIComponent(
                    `Hi, I'm interested in ${product.name}\nProduct Link: https://black2o.wiki/product/${product.id}\nProduct Shop: ${product.shop_name}\n`
                  )}`,
                  '_blank'
                )
              }
              className="w-full bg-black text-white hover:bg-gray-800 h-12 text-base"
            >
              Contact on WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {product.faqs && product.faqs.length > 0 && (
        <div className="border border-black p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">FAQ</h2>
          <Accordion type="single" collapsible className="space-y-0">
            {product.faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border-t border-black last:border-b"
              >
                <AccordionTrigger className="py-4 font-bold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-gray-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Recommended Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((prod) => (
              <Link key={prod.id} href={`/product/${prod.id}`}>
                <div className="border border-black p-4 cursor-pointer hover:bg-secondary transition-colors h-full">
                  <div className="aspect-square bg-secondary mb-4 relative">
                    {prod.images && prod.images[0] && (
                      <Image
                        src={prod.images[0] || "/placeholder.svg"}
                        alt={prod.name}
                        fill={true}
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <h3 className="font-bold text-sm line-clamp-2">{prod.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
