import { Routes, Route } from 'react-router-dom'
import { useFeatureFlag, useRemoteConfig } from '@trackion/web/react'
import Header from './components/Header'
import Footer from './components/Footer'
import FeatureBanner from './components/FeatureBanner'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import TestingPage from './pages/TestingPage'
import { CartProvider } from './hooks/useCart'

function App() {
  const showBanner = useFeatureFlag('show_promotion_banner')
  const bannerConfig = useRemoteConfig<{
    text: string
    bgColor: string
    textColor: string
  }>('banner_config', {
    text: '🎉 Welcome to Trackion Demo Store!',
    bgColor: '#3b82f6',
    textColor: '#ffffff'
  })

  return (
    <CartProvider>
      <div className="app">
        {showBanner && <FeatureBanner config={bannerConfig} />}
        <Header />
        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/testing" element={<TestingPage />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}

export default App