import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { User, Settings, ShoppingBag, TrendingUp, CheckCircle } from 'lucide-react'
import { useTrackion, useFeatureFlag, useRemoteConfig } from '@trackion/web/react'

export default function ProfilePage() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('overview')
  const trackion = useTrackion()
  const showAdvancedAnalytics = useFeatureFlag('advanced_user_analytics')
  const profileConfig = useRemoteConfig<{
    welcomeMessage: string
    showBadges: boolean
  }>('profile_config', {
    welcomeMessage: 'Welcome back!',
    showBadges: true
  })

  const success = searchParams.get('success')

  useEffect(() => {
    trackion.track('profile_page_viewed', {
      tab: activeTab,
      success_redirect: !!success
    })

    if (success) {
      trackion.track('checkout_success_viewed', {
        source: 'profile_redirect'
      })
    }
  }, [trackion, activeTab, success])

  const handleTabChange = (tab: string) => {
    trackion.track('profile_tab_changed', {
      from_tab: activeTab,
      to_tab: tab
    })
    setActiveTab(tab)
  }

  const handleUserAction = (action: string) => {
    trackion.track('profile_action', {
      action,
      tab: activeTab
    })
  }

  return (
    <div className="profile-page">
      {success && (
        <div className="card" style={{ 
          background: 'linear-gradient(90deg, #10b981, #059669)',
          color: 'white',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={32} />
            <div>
              <h3 style={{ margin: 0 }}>Order Completed Successfully!</h3>
              <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>
                Thank you for your purchase. You'll receive a confirmation email shortly.
              </p>
            </div>
          </div>
        </div>
      )}

      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        {profileConfig?.welcomeMessage || 'Welcome back!'}
      </h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Manage your account, view your analytics, and track your activity.
      </p>

      {/* Tab Navigation */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                padding: '1rem',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Account Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ 
                background: '#f8fafc', 
                padding: '1.5rem', 
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>demo_user_123</div>
                <div style={{ color: '#64748b' }}>User ID</div>
              </div>
              <div style={{ 
                background: '#f8fafc', 
                padding: '1.5rem', 
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>42</div>
                <div style={{ color: '#64748b' }}>Events Tracked</div>
              </div>
              <div style={{ 
                background: '#f8fafc', 
                padding: '1.5rem', 
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>5</div>
                <div style={{ color: '#64748b' }}>Pages Visited</div>
              </div>
            </div>

            {profileConfig?.showBadges && (
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Achievements</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ 
                    background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    fontSize: '0.875rem'
                  }}>
                    🎯 First Purchase
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    fontSize: '0.875rem'
                  }}>
                    📊 Analytics Explorer
                  </div>
                  <div style={{ 
                    background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    fontSize: '0.875rem'
                  }}>
                    🚀 Early Adopter
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Recent Orders</h3>
            {success ? (
              <div style={{ 
                background: '#f0fdf4', 
                border: '1px solid #bbf7d0',
                padding: '1rem', 
                borderRadius: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Order #TRK-{Date.now()}</div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      Completed - {new Date().toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ color: '#059669', fontWeight: 'bold' }}>
                    Processing
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <ShoppingBag size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
                <p>No orders yet. Start shopping to see your orders here!</p>
                <button 
                  onClick={() => handleUserAction('browse_products')}
                  className="btn btn-primary"
                  style={{ marginTop: '1rem' }}
                >
                  Browse Products
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Your Analytics</h3>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              Here's how you've been using our demo store:
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ 
                background: '#f8fafc', 
                padding: '1rem', 
                borderRadius: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '500' }}>Page Views</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total visits across all pages</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  {Math.floor(Math.random() * 20) + 5}
                </div>
              </div>

              <div style={{ 
                background: '#f8fafc', 
                padding: '1rem', 
                borderRadius: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '500' }}>Events Tracked</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Button clicks, form submissions, etc.</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                  {Math.floor(Math.random() * 100) + 20}
                </div>
              </div>

              <div style={{ 
                background: '#f8fafc', 
                padding: '1rem', 
                borderRadius: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '500' }}>Session Duration</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Average time spent per session</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {Math.floor(Math.random() * 15) + 3}m
                </div>
              </div>

              {showAdvancedAnalytics && (
                <div style={{ 
                  background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  padding: '1rem', 
                  borderRadius: '0.5rem'
                }}>
                  <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>🔬 Advanced Analytics</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                    This advanced analytics section is controlled by the 'advanced_user_analytics' feature flag. 
                    It shows detailed user behavior patterns and conversion funnels.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Settings</h3>
            
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>User Identification</h4>
              <div className="form-group">
                <label className="form-label">Current User ID</label>
                <input 
                  type="text"
                  className="form-input"
                  value="demo_user_123"
                  readOnly
                  style={{ background: '#f8fafc' }}
                />
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                  This user ID is used for tracking and analytics
                </div>
              </div>
              
              <button 
                onClick={() => {
                  const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`
                  trackion.setUserId(newUserId)
                  handleUserAction('change_user_id')
                  alert(`User ID changed to: ${newUserId}`)
                }}
                className="btn btn-secondary"
              >
                Generate New User ID
              </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Analytics Preferences</h4>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" defaultChecked />
                  Track page views automatically
                </label>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" defaultChecked />
                  Enable error tracking
                </label>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" defaultChecked />
                  Allow feature flag updates
                </label>
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: '1rem' }}>Danger Zone</h4>
              <button 
                onClick={() => {
                  trackion.track('clear_all_data_clicked', {
                    user_id: trackion.getSessionId()
                  })
                  if (confirm('This will clear all your tracking data. Are you sure?')) {
                    handleUserAction('clear_data')
                    alert('Data cleared! (This is just a demo)')
                  }
                }}
                className="btn btn-danger"
              >
                Clear All Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}