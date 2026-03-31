import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, TrendingUp, Users, Zap } from 'lucide-react'
import { useTrackion, useFeatureFlag, useRemoteConfig } from '@trackion/web/react'

export default function HomePage() {
  const trackion = useTrackion()
  const showNewSection = useFeatureFlag('show_analytics_section')
  const heroConfig = useRemoteConfig<{
    title: string
    subtitle: string
    ctaText: string
  }>('hero_config', {
    title: 'Welcome to Trackion Demo Store',
    subtitle: 'Experience the power of real-time analytics',
    ctaText: 'Shop Now'
  })

  useEffect(() => {
    // Track home page view with additional context
    trackion.track('page_view', {
      page: 'home',
      section: 'landing',
      timestamp: new Date().toISOString()
    })

    // Track session start if this is the first page
    if (document.referrer === '') {
      trackion.track('session_start', {
        landing_page: '/',
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`
      })
    }
  }, [trackion])

  const handleCTAClick = () => {
    trackion.track('hero_cta_click', {
      cta_text: heroConfig?.ctaText || 'Shop Now',
      location: 'hero_section'
    })
  }

  const handleFeatureClick = (featureName: string) => {
    trackion.track('feature_highlight_click', {
      feature: featureName,
      section: 'features'
    })
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '4rem 0',
        borderRadius: '1rem',
        marginBottom: '3rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          {heroConfig?.title || 'Welcome to Trackion Demo Store'}
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
          {heroConfig?.subtitle || 'Experience the power of real-time analytics'}
        </p>
        <Link
          to="/products"
          className="btn btn-primary"
          style={{ 
            fontSize: '1.125rem', 
            padding: '1rem 2rem',
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: '2px solid white'
          }}
          onClick={handleCTAClick}
        >
          {heroConfig?.ctaText || 'Shop Now'} →
        </Link>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem' }}>
          Trackion Features in Action
        </h2>
        <div className="card-grid">
          <div className="card" onClick={() => handleFeatureClick('event_tracking')}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <TrendingUp size={32} style={{ color: '#3b82f6', marginRight: '1rem' }} />
              <h3>Event Tracking</h3>
            </div>
            <p>Every click, page view, and interaction is tracked automatically. Navigate around to see it in action!</p>
          </div>

          <div className="card" onClick={() => handleFeatureClick('error_monitoring')}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <Zap size={32} style={{ color: '#ef4444', marginRight: '1rem' }} />
              <h3>Error Tracking</h3>
            </div>
            <p>JavaScript errors are captured automatically. Try the testing page to see error capture in action.</p>
          </div>

          <div className="card" onClick={() => handleFeatureClick('feature_flags')}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <Users size={32} style={{ color: '#10b981', marginRight: '1rem' }} />
              <h3>Feature Flags</h3>
            </div>
            <p>Features can be toggled in real-time. Notice the banner at the top? That's controlled by a feature flag!</p>
          </div>

          <div className="card" onClick={() => handleFeatureClick('remote_config')}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <ShoppingBag size={32} style={{ color: '#8b5cf6', marginRight: '1rem' }} />
              <h3>Remote Config</h3>
            </div>
            <p>Content and styling can be updated without code changes. This hero section uses remote configuration!</p>
          </div>
        </div>
      </section>

      {/* Analytics Section (Feature Flag Controlled) */}
      {showNewSection && (
        <section className="analytics-section" style={{
          background: '#f8fafc',
          padding: '3rem',
          borderRadius: '1rem',
          marginTop: '3rem',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>
            🎉 New Analytics Section!
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            This section is controlled by the 'show_analytics_section' feature flag. 
            You can toggle this on/off from your Trackion dashboard!
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>1.2M+</div>
              <div style={{ color: '#64748b' }}>Events Tracked</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>99.9%</div>
              <div style={{ color: '#64748b' }}>Uptime</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>50ms</div>
              <div style={{ color: '#64748b' }}>Avg Response Time</div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section" style={{
        textAlign: 'center',
        marginTop: '4rem',
        padding: '2rem',
        background: 'white',
        borderRadius: '1rem',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Ready to explore?</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          Browse our products, test error tracking, or explore your profile. Every action generates analytics data!
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
          <Link to="/testing" className="btn btn-secondary">
            Test Features
          </Link>
        </div>
      </section>
    </div>
  )
}