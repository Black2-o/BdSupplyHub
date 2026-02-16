export interface Category {
  id: string
  name: string
  slug: string
}

// Represents the structure of the 'products' table
export interface Product {
  id: string
  name: string
  category_id: string
  description?: string // Make optional as per DB schema
  shop_name?: string // Make optional as per DB schema
  fabricType?: string // Make optional as per DB schema
  sizeRange?: string // Make optional as per DB schema
  price: number
  lowPrice?: number // Make optional as per DB schema
  recommended: boolean
  created_at?: string // Optional, handled by DB
  updated_at?: string // Optional, handled by DB
}

// Represents a product's FAQ entry in 'product_faqs' table
export interface ProductFAQ {
  id?: string // Optional for new FAQ entries
  product_id?: string // Optional, linked by product
  question: string
  answer: string
  display_order?: number
  created_at?: string
}

// Represents product image entry in 'product_images' table
export interface ProductImage {
  id?: string
  product_id?: string
  image_url: string
  display_order?: number
  created_at?: string
}

// Represents a Product with its related data (images and faqs)
export interface ProductWithRelations extends Product {
  images?: string[] // Array of image URLs
  faqs?: ProductFAQ[]
  category_name?: string // Add category name for display purposes
}

export interface AdminSession {
  isLoggedIn: boolean
  username?: string
}
