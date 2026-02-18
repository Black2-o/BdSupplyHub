import { v2 as cloudinary } from 'cloudinary'

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

if (!cloudName) {
  console.warn('Cloudinary cloud name not configured')
}

export const cloudinaryConfig = {
  cloudName,
  apiKey,
  apiSecret,
}

// Configure cloudinary for server-side operations
if (apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })
}

export async function uploadToCloudinary(file: File): Promise<string> {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not properly configured. Please check your .env variables.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'b2b_wholesale') // You can create this preset in Cloudinary dashboard
  formData.append('cloud_name', cloudName)

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(`Cloudinary upload failed: ${data.error.message}`)
    }

    return data.secure_url
  } catch (error) {
    // console.error('Error uploading to Cloudinary:', error)
    throw error
  }
}

// For client-side uploads using CldUploadWidget
export function getCloudinaryUploadPreset() {
  return 'b2b_wholesale'
}
