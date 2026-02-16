'use client'

import React from "react"
import dynamic from 'next/dynamic'

import { useState, useEffect, useRef } from 'react'
import { ProductCardSkeleton } from '@/components/product-card-skeleton'
// ...
const ProductCard = dynamic(() => import('@/components/product-card').then((mod) => mod.ProductCard), {
  loading: () => <ProductCardSkeleton />,
  ssr: false,
});
import { AdminPanel } from '@/components/admin-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, LogOut, Settings } from 'lucide-react'
const Loader2 = dynamic(() => import('lucide-react').then((mod) => mod.Loader2), {
  ssr: false,
});
import Link from 'next/link'
import type { Category, Product, ProductWithRelations } from '@/lib/types'

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<ProductWithRelations[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoadingCategories(true)
      setLoadingProducts(true)
      setError(null)
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ])

        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products')
        }
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories')
        }

        const productsData: ProductWithRelations[] = await productsResponse.json()
        const categoriesData: Category[] = await categoriesResponse.json()

        setProducts(productsData)
        setCategories(categoriesData)
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data.')
        console.error('Failed to fetch data:', err)
      } finally {
        setLoadingProducts(false)
        setLoadingCategories(false)
      }
    }
    fetchData()
  }, [])

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products

  const recommendedProducts = products.filter((p) => p.recommended)

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    const scrollAmount = 320
    if (direction === 'left') {
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (loadingProducts || loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        <p className="ml-2 text-gray-500">Loading products...</p>
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

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-8">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-2 text-balance">Wholesale Cloth Collection</h1>
            <p className="text-lg text-muted-foreground">
              Direct From Dhaka - Premium Fabrics At Wholesale Prices For Retailers Across Bangladesh
            </p>
          </div>
          {/* <div className="flex gap-2">
            <Link href="/admin">
              <Button
                variant="outline"
                className="border-black flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin Login
              </Button>
            </Link>
          </div> */}
        </div>

        <div className="mb-12">
          <div className="flex gap-2 flex-wrap mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 border font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-black text-white border-black'
                  : 'border-black hover:bg-secondary'
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 border font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-black text-white border-black'
                    : 'border-black hover:bg-secondary'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found in this category</p>
          </div>
        )}

        {recommendedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-balance">Featured Products</h2>
            <div className="relative">
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
                style={{ scrollBehavior: 'smooth' }}
              >
                {recommendedProducts.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-64">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {recommendedProducts.length > 3 && (
                <div className="flex gap-2 mt-4 justify-center">
                  <button
                    onClick={() => scrollCarousel('left')}
                    className="p-2 bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    className="p-2 bg-black text-white hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-black pt-12 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase mb-2">
                Minimum Order
              </p>
              <p className="text-lg font-bold">Minimum ৳10K Per Order</p>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase mb-2">
                Fast Delivery
              </p>
              <p className="text-lg font-bold">Delivery Within 2-3 Days</p>
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase mb-2">
                Direct Contact
              </p>
              <p className="text-lg font-bold"><a href="https://wa.me/601345680081?text=Hello%20I%20would%20like%20more%20information" className="text-[#25D366] hover:text-[#1ebe5d] transition duration-300">WhatsApp</a> For Instant Quotes</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
