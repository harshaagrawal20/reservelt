// Product actions for interacting with the backend API

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Helper function to handle API errors
const handleError = (error) => {
  console.error('API Error:', error)
  throw error
}

/**
 * Fetch all approved products
 * @returns {Promise<Array>} Array of products
 */
export async function getAllProducts({ ownerClerkId, q, status = 'approved' } = {}) {
  try {
    const params = new URLSearchParams()
    if (ownerClerkId) params.set('ownerClerkId', ownerClerkId)
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    const url = params.toString() ? `${API_BASE_URL}/products?${params.toString()}` : `${API_BASE_URL}/products`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }

    const data = await response.json()
    return data.products
  } catch (error) {
    handleError(error)
  }
}

/**
 * Fetch a product by ID
 * @param {string} productId - The ID of the product to fetch
 * @returns {Promise<Object>} Product object
 */
export async function getProductById(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`)

    if (!response.ok) {
      throw new Error('Product not found')
    }

    const data = await response.json()
    return data.product
  } catch (error) {
    handleError(error)
  }
}

/**
 * Create a new product
 * @param {Object} productData - The product data
 * @returns {Promise<Object>} Created product
 */
export async function createProduct(productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      throw new Error('Failed to create product')
    }

    const data = await response.json()
    return data.product
  } catch (error) {
    handleError(error)
  }
}

/**
 * Update a product
 * @param {string} productId - The ID of the product to update
 * @param {Object} productData - The updated product data
 * @returns {Promise<Object>} Updated product
 */
export async function updateProduct(productId, productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      throw new Error('Failed to update product')
    }

    const data = await response.json()
    return data.product
  } catch (error) {
    handleError(error)
  }
}

/**
 * Delete a product
 * @param {string} productId - The ID of the product to delete
 * @returns {Promise<Object>} Response data
 */
export async function deleteProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete product')
    }

    return await response.json()
  } catch (error) {
    handleError(error)
  }
}