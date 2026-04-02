import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrackion, useFeatureFlag } from '@trackion/web/react'
import { useCart } from '../hooks/useCart'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  featured?: boolean
}

// Mock product data
const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Analytics Dashboard Pro',
    description: 'Professional analytics dashboard with real-time insights',
    price: 299,
    category: 'Software',
    image: '📊',
    featured: true
  },
  {
    id: '2',
    name: 'Event Tracker Starter',
    description: 'Basic event tracking solution for small websites',
    price: 99,
    category: 'Software',
    image: '📈'
  },
  {
    id: '3',
    name: 'Error Monitor Elite',
    description: 'Advanced error tracking with detailed stack traces',
    price: 199,
    category: 'Software',
    image: '🚨'
  },
  {
    id: '4',
    name: 'Feature Flag Manager',
    description: 'Control your features with powerful flag management',
    price: 149,
    category: 'Software',
    image: '🎛️'
  },
  {
    id: '5',
    name: 'Remote Config Service',
    description: 'Dynamic configuration management without deployments',
    price: 129,
    category: 'Software',
    image: '⚙️'
  },
  {
    id: '6',
    name: 'User Analytics Suite',
    description: 'Complete user behavior analysis and insights',
    price: 249,
    category: 'Software',
    image: '👥'
  }
]

export default function ProductsPage() {
  const [filter, setFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const trackion = useTrackion()
  const { addToCart } = useCart()
  const showDiscountBadge = useFeatureFlag('show_discount_badges')

  useEffect(() => {
    trackion.track('products_page_viewed', {
      total_products: PRODUCTS.length,
      timestamp: new Date().toISOString()
    })
  }, [trackion])

  const handleFilterChange = (newFilter: string) => {
    trackion.track('products_filtered', {
      filter: newFilter,
      previous_filter: filter,
      products_count: filteredProducts.length
    })
    setFilter(newFilter)
  }

  const handleSortChange = (newSort: string) => {
    trackion.track('products_sorted', {
      sort_by: newSort,
      previous_sort: sortBy,
      products_count: filteredProducts.length
    })
    setSortBy(newSort)
  }

  const handleAddToCart = (product: Product) => {
    trackion.track('add_to_cart_clicked', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_category: product.category,
      source: 'products_page'
    })
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    })
  }

  const handleProductClick = (product: Product) => {
    trackion.track('product_clicked', {
      product_id: product.id,
      product_name: product.name,
      product_category: product.category,
      source: 'products_grid'
    })
  }

  // Filter products
  const filteredProducts = PRODUCTS.filter(product => 
    filter === 'all' || product.category.toLowerCase() === filter
  )

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'name':
      default:
        return a.name.localeCompare(b.name)
    }
  })

  const categories = ['all', ...new Set(PRODUCTS.map(p => p.category.toLowerCase()))]

  return (
    <div className="products-page">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Our Products</h1>
        <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
          Discover our suite of analytics and monitoring tools
        </p>
      </div>

      {/* Filters and Sorting */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          alignItems: 'end'
        }}>
          <div className="form-group">
            <label className="form-label">Filter by Category</label>
            <select 
              className="form-input"
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Sort by</label>
            <select 
              className="form-input"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
            </select>
          </div>

          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Showing {sortedProducts.length} of {PRODUCTS.length} products
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {sortedProducts.map((product) => (
          <div key={product.id} className="product-card">
            <Link 
              to={`/products/${product.id}`}
              onClick={() => handleProductClick(product)}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="product-image">
                {product.image}
                {showDiscountBadge && product.featured && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: '#ef4444',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    HOT!
                  </div>
                )}
              </div>
            </Link>
            
            <div className="product-content">
              <Link 
                to={`/products/${product.id}`}
                onClick={() => handleProductClick(product)}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <h3 className="product-title">{product.name}</h3>
                <p className="product-description">{product.description}</p>
              </Link>
              
              <div className="product-price">${product.price}</div>
              
              <button 
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={(e) => {
                  e.preventDefault()
                  handleAddToCart(product)
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="card text-center">
          <h3>No products found</h3>
          <p style={{ color: '#64748b' }}>
            Try adjusting your filter criteria
          </p>
        </div>
      )}
    </div>
  )
}