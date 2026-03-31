import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User } from 'lucide-react'
import { useTrackion } from '@trackion/web/react'
import { useCart } from '../hooks/useCart'
import { useEffect } from 'react'

export default function Header() {
  const location = useLocation()
  const trackion = useTrackion()
  const { items } = useCart()

  // Track page views when location changes
  useEffect(() => {
    trackion.page({
      path: location.pathname,
      title: document.title,
      referrer: document.referrer || undefined
    })
  }, [location, trackion])

  const handleNavClick = (navItem: string) => {
    trackion.track('navigation_click', {
      item: navItem,
      current_page: location.pathname
    })
  }

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link 
            to="/" 
            className="logo"
            onClick={() => handleNavClick('logo')}
          >
            📊 Trackion Demo
          </Link>
          
          <ul className="nav-links">
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
                onClick={() => handleNavClick('home')}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/products"
                className={location.pathname === '/products' ? 'active' : ''}
                onClick={() => handleNavClick('products')}
              >
                Products
              </Link>
            </li>
            <li>
              <Link 
                to="/testing"
                className={location.pathname === '/testing' ? 'active' : ''}
                onClick={() => handleNavClick('testing')}
              >
                Testing
              </Link>
            </li>
          </ul>

          <div className="user-menu">
            <Link 
              to="/cart" 
              className="btn btn-secondary btn-small flex items-center gap-2"
              onClick={() => handleNavClick('cart')}
            >
              <ShoppingCart size={16} />
              Cart ({cartItemCount})
            </Link>
            <Link 
              to="/profile" 
              className="btn btn-secondary btn-small flex items-center gap-2"
              onClick={() => handleNavClick('profile')}
            >
              <User size={16} />
              Profile
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}