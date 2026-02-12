'use client'

import React from 'react'
import Image from 'next/image'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { X, Upload, Plus, Trash2, Loader2 } from 'lucide-react'
import type { Product, Category } from '@/lib/types'

interface AdminPanelProps {
  onLogout: () => void
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newFaqQuestion, setNewFaqQuestion] = useState('')
  const [newFaqAnswer, setNewFaqAnswer] = useState('')
  const [uploadingImages, setUploadingImages] = useState<Record<number, boolean>>({})
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true) // Set to true initially for first fetch
  const [apiError, setApiError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category_id: '',
    description: '',
    moq: 0,
    fabricType: '',
    sizeRange: '',
    price: 0,
    lowPrice: 0,
    images: [],
    faqs: [],
    recommended: false, // Default value for new products
  })

  // Filtered products for display
  const filteredProducts = products.filter(product => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      (product.description && product.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (categories.find(cat => cat.id === product.category_id)?.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (product.moq && String(product.moq).includes(lowerCaseSearchTerm))
    );
  });

  const fetchData = async () => {
    setLoading(true)
    setApiError(null)
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories'),
      ])

      if (!productsResponse.ok) {
        throw new Error('Failed to fetch products for admin panel')
      }
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch categories for admin panel')
      }

      const productsData: Product[] = await productsResponse.json()
      const categoriesData: Category[] = await categoriesResponse.json()

      setProducts(productsData)
      setCategories(categoriesData)
    } catch (err: any) {
      setApiError(err.message || 'An error occurred while fetching data.')
      console.error('Failed to fetch admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setApiError('Category name cannot be empty')
      return
    }
    setLoading(true)
    setApiError(null)
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || 'Failed to add category')
      }
      setNewCategoryName('')
      fetchData() // Refresh categories and products
    } catch (err: any) {
      setApiError(err.message || 'Error adding category')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    setLoading(true)
    setApiError(null)
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || 'Failed to delete category')
      }
      fetchData() // Refresh categories and products
    } catch (err: any) {
      setApiError(err.message || 'Error deleting category')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async () => {
    if (!formData.name || !formData.category_id || formData.price === undefined || formData.price <= 0 || formData.moq === undefined || formData.moq <= 0) {
      setApiError('Missing required product fields: name, category ID, price (must be > 0), moq (must be > 0).')
      return
    }
    setLoading(true)
    setApiError(null)
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || 'Failed to add product')
      }
      setFormData({
        name: '', category_id: '', description: '', moq: 0, fabricType: '', sizeRange: '',
        price: 0, lowPrice: 0, images: [], faqs: [], recommended: false,
      })
      setNewFaqQuestion('')
      setNewFaqAnswer('')
      fetchData() // Refresh products
    } catch (err: any) {
      setApiError(err.message || 'Error adding product')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct?.id) {
      setApiError('No product selected for editing.')
      return
    }
    if (!formData.name || !formData.category_id || formData.price === undefined || formData.price <= 0 || formData.moq === undefined || formData.moq <= 0) {
      setApiError('Missing or invalid required product fields: name, category ID, price (must be > 0), moq (must be > 0).')
      return
    }
    setLoading(true)
    setApiError(null)
    try {
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || 'Failed to update product')
      }
      setEditingProduct(null)
      setFormData({
        name: '', category_id: '', description: '', moq: 0, fabricType: '', sizeRange: '',
        price: 0, lowPrice: 0, images: [], faqs: [], recommended: false,
      })
      setNewFaqQuestion('')
      setNewFaqAnswer('')
      fetchData() // Refresh products
    } catch (err: any) {
      setApiError(err.message || 'Error updating product')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    setLoading(true)
    setApiError(null)
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || 'Failed to delete product')
      }
      fetchData() // Refresh products
    } catch (err: any) {
      setApiError(err.message || 'Error deleting product')
    } finally {
      setLoading(false)
    }
  }

  const startEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData(product)
    setNewFaqQuestion('')
    setNewFaqAnswer('')
  }

  const handleAddFaq = () => {
    if (newFaqQuestion.trim() && newFaqAnswer.trim()) {
      const updatedFaqs = [...(formData.faqs || []), { question: newFaqQuestion, answer: newFaqAnswer }]
      setFormData({ ...formData, faqs: updatedFaqs })
      setNewFaqQuestion('')
      setNewFaqAnswer('')
    }
  }

  const handleRemoveFaq = (index: number) => {
    const updatedFaqs = (formData.faqs || []).filter((_, i) => i !== index)
    setFormData({ ...formData, faqs: updatedFaqs })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploadError(null)
    const currentImages = formData.images || []

    Array.from(files).forEach(async (file, index) => {
      const imageIndex = currentImages.length + index
      setUploadingImages((prev) => ({ ...prev, [imageIndex]: true }))

      try {
        const formDataToSend = new FormData()
        formDataToSend.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataToSend,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const data = await response.json()

        // Update form data with the uploaded image URL
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), data.secure_url],
        }))
      } catch (error) {
        console.error('Error uploading image:', error)
        setUploadError(`Failed to upload ${file.name}. Please try again.`)
      } finally {
        setUploadingImages((prev) => ({ ...prev, [imageIndex]: false }))
      }
    })

    // Reset input
    e.target.value = ''
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = (formData.images || []).filter((_, i) => i !== index)
    setFormData({ ...formData, images: updatedImages })
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button
          onClick={onLogout}
          variant="outline"
          className="border-black bg-transparent"
        >
          Logout
        </Button>
      </div>

      <div className="flex gap-4 mb-8 border-b border-black">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-bold ${activeTab === 'products' ? 'border-b-2 border-black' : 'text-muted-foreground'}`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-bold ${activeTab === 'categories' ? 'border-b-2 border-black' : 'text-muted-foreground'}`}
        >
          Categories
        </button>
      </div>

      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="border border-black p-6">
            <h2 className="text-xl font-bold mb-4">Add Category</h2>
            <div className="flex gap-2">
              <Input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="border-black flex-1"
              />
              <Button
                onClick={handleAddCategory}
                className="bg-black text-white hover:bg-gray-800"
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold">Existing Categories</h3>
            {categories.map((cat) => (
              <div key={cat.id} className="flex justify-between items-center border border-black p-4">
                <span className="font-medium">{cat.name}</span>
                <Button
                  onClick={() => handleDeleteCategory(cat.id)}
                  variant="outline"
                  className="border-black text-red-600"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <Accordion type="single" collapsible defaultValue="add-new-product">
            <AccordionItem value="add-new-product">
              <AccordionTrigger className="border border-black p-8 text-2xl font-bold hover:no-underline">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </AccordionTrigger>
              <AccordionContent className="border border-black border-t-0 p-8">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-bold mb-4">Basic Information</h3>
                    <div className="space-y-4">
                      <Input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Product name"
                        className="border-black"
                      />

                      <Select
                        value={formData.category_id || ''}
                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      >
                        <SelectTrigger className="border-black">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description"
                        className="border-black"
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-bold mb-4">Pricing</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        placeholder="Regular price (e.g., 5.99)"
                        className="border-black"
                      />
                      <Input
                        type="number"
                        value={formData.lowPrice || ''}
                        onChange={(e) => setFormData({ ...formData, lowPrice: Number(e.target.value) })}
                        placeholder="Low price / bulk (e.g., 4.50)"
                        className="border-black"
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-bold mb-4">Product Details</h3>
                    <div className="space-y-4">
                      <Input
                        type="number"
                        value={formData.moq || ''}
                        onChange={(e) => setFormData({ ...formData, moq: Number(e.target.value) })}
                        placeholder="MOQ (e.g., 100 units)"
                        className="border-black"
                      />

                      <Input
                        type="text"
                        value={formData.fabricType || ''}
                        onChange={(e) => setFormData({ ...formData, fabricType: e.target.value })}
                        placeholder="Fabric type"
                        className="border-black"
                      />

                      <Input
                        type="text"
                        value={formData.sizeRange || ''}
                        onChange={(e) => setFormData({ ...formData, sizeRange: e.target.value })}
                        placeholder="Size range"
                        className="border-black"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-bold mb-4">Product Images</h3>
                    <div className="space-y-4">
                      {uploadError && (
                        <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
                          {uploadError}
                        </div>
                      )}

                      <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-black cursor-pointer hover:bg-secondary transition-colors">
                        <Upload className="w-5 h-5" />
                        <span className="font-medium">Click to upload images to Cloudinary</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>

                      <p className="text-xs text-muted-foreground">
                        💡 Tip: Images are automatically uploaded to Cloudinary for optimized storage and delivery.
                      </p>

                      {formData.images && formData.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative group w-full aspect-square">
                              {uploadingImages[index] ? (
                                <div className="w-full aspect-square bg-gray-100 border-2 border-black flex items-center justify-center">
                                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                              ) : (
                                <>
                                  <Image
                                    src={image || '/placeholder.svg'}
                                    alt={`Product ${index}`}
                                    fill={true}
                                    style={{ objectFit: 'cover' }}
                                    className="border border-black object-cover"
                                  />
                                  <button
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-2 right-2 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                  <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    Cloudinary
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FAQs */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-bold mb-4">FAQs</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Question</label>
                        <Input
                          type="text"
                          value={newFaqQuestion}
                          onChange={(e) => setNewFaqQuestion(e.target.value)}
                          placeholder="Enter FAQ question"
                          className="border-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Answer</label>
                        <Textarea
                          value={newFaqAnswer}
                          onChange={(e) => setNewFaqAnswer(e.target.value)}
                          placeholder="Enter FAQ answer"
                          className="border-black"
                        />
                      </div>
                      <Button
                        onClick={handleAddFaq}
                        variant="outline"
                        className="w-full border-black flex items-center justify-center gap-2 bg-transparent"
                      >
                        <Plus className="w-4 h-4" />
                        Add FAQ
                      </Button>

                      {formData.faqs && formData.faqs.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <p className="text-sm font-medium">Added FAQs:</p>
                          {formData.faqs.map((faq, index) => (
                            <div key={index} className="bg-secondary p-3 rounded border border-black">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{faq.question}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{faq.answer}</p>
                                </div>
                                <button
                                  onClick={() => handleRemoveFaq(index)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                      className="flex-1 bg-black text-white hover:bg-gray-800"
                    >
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>

                    {editingProduct && (
                      <Button
                        onClick={() => {
                          setEditingProduct(null)
                          setFormData({
                            name: '',
                            category_id: '',
                            description: '',
                            moq: 0,
                            fabricType: '',
                            sizeRange: '',
                            price: 0,
                            lowPrice: 0,
                            images: [],
                            faqs: [],
                          })
                          setNewFaqQuestion('')
                          setNewFaqAnswer('')
                        }}
                        variant="outline"
                        className="flex-1 border-black"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="space-y-2">
            <h3 className="text-lg font-bold mb-4">Products List</h3>
            <Input
              type="text"
              placeholder="Search products by name, description, category, or MOQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 border-black"
            />
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No products found</div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="border border-black p-4 hover:bg-secondary transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-base">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {categories.find((c) => c.id === product.category_id)?.name}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground">Price</span>
                          <p className="font-medium">{product.price || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground">Low Price</span>
                          <p className="font-medium">{product.lowPrice || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground">MOQ</span>
                          <p className="font-medium">{product.moq || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground">Images</span>
                          <p className="font-medium">{product.images?.length || 0}</p>
                        </div>
                      </div>
                      {product.faqs && product.faqs.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">{product.faqs.length} FAQs</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startEditProduct(product)}
                        variant="outline"
                        className="border-black"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteProduct(product.id)}
                        variant="outline"
                        className="border-black text-red-600"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
