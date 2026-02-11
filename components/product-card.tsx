'use client'

import Link from 'next/link'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {

  return (
    <Link href={`/product/${product.id}`}>
      <div className="border-2 border-black overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white group">
        <div className="aspect-square bg-secondary overflow-hidden relative">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          {product.recommended && (
            <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 text-xs font-bold">
              FEATURED
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {product.category_name || "N/A"}
          </p>
          <h3 className="font-bold text-sm line-clamp-2 group-hover:text-black transition-colors">
            {product.name}
          </h3>
          
          <div className="pt-2 border-t border-gray-200 space-y-2">
            {product.price && ( // Only show regular price
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-black">৳{product.price}</span>
              </div>
            )}
            {product.moq && (
              <p className="text-xs text-muted-foreground">MOQ: {product.moq}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
