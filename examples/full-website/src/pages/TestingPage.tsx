import { useState, useCallback } from 'react'
import { 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  Settings,
  Bug,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { 
  useTrackion, 
  useCaptureError, 
  useFeatureFlag, 
  useRemoteConfig 
} from '@trackion/web/react'

export default function TestingPage() {
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | 'pending'>>({})
  const trackion = useTrackion()
  const captureError = useCaptureError()

  // Feature flags for testing
  const testFeatureFlag = useFeatureFlag('test_feature_flag')
  const advancedTesting = useFeatureFlag('advanced_testing_features')
  const experimentalUI = useFeatureFlag('experimental_ui')

  // Remote config for testing
  const testingConfig = useRemoteConfig<{
    maxTestCount: number
    testTimeout: number
    enableVerboseLogging: boolean
    testingTheme: 'light' | 'dark'
  }>('testing_config', {
    maxTestCount: 10,
    testTimeout: 5000,
    enableVerboseLogging: false,
    testingTheme: 'light'
  })

  const updateTestResult = useCallback((testName: string, result: 'success' | 'error' | 'pending') => {
    setTestResults(prev => ({ ...prev, [testName]: result }))
  }, [])

  // Test 1: Basic Event Tracking
  const testEventTracking = () => {
    updateTestResult('eventTracking', 'pending')
    
    try {
      trackion.track('test_event', {
        test_type: 'basic_event',
        timestamp: new Date().toISOString(),
        random_value: Math.random(),
        user_action: 'button_click'
      })
      
      updateTestResult('eventTracking', 'success')
    } catch (error) {
      captureError(error, { test_name: 'eventTracking' })
      updateTestResult('eventTracking', 'error')
    }
  }

  // Test 2: Error Capture Testing
  const testErrorCapture = () => {
    updateTestResult('errorCapture', 'pending')
    
    try {
      // Manual error capture
      captureError(new Error('This is a test error for demonstration'), {
        test_type: 'manual_error',
        error_source: 'testing_page',
        severity: 'info',
        additional_context: {
          feature_flags: { testFeatureFlag, advancedTesting },
          user_agent: navigator.userAgent
        }
      })
      
      updateTestResult('errorCapture', 'success')
    } catch (error) {
      updateTestResult('errorCapture', 'error')
    }
  }

  // Test 3: Automatic Error (throws an error)
  const testAutomaticError = () => {
    updateTestResult('automaticError', 'pending')
    
    trackion.track('automatic_error_test_triggered', {
      test_type: 'automatic_error'
    })
    
    setTimeout(() => {
      try {
        // This will throw an error that should be caught automatically
        throw new Error('Automatic error capture test - this should appear in your error tracking!')
      } catch (error) {
        updateTestResult('automaticError', 'success')
      }
    }, 1000)
  }

  // Test 4: User Identification
  const testUserIdentification = () => {
    updateTestResult('userIdentification', 'pending')
    
    try {
      const newUserId = `test_user_${Date.now()}`
      trackion.identify(newUserId, {
        test_session: true,
        test_timestamp: new Date().toISOString(),
        browser: navigator.userAgent.split(' ')[0],
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
      
      trackion.track('user_identification_test', {
        new_user_id: newUserId,
        previous_session: trackion.getSessionId()
      })
      
      updateTestResult('userIdentification', 'success')
    } catch (error) {
      captureError(error, { test_name: 'userIdentification' })
      updateTestResult('userIdentification', 'error')
    }
  }

  // Test 5: Page Tracking
  const testPageTracking = () => {
    updateTestResult('pageTracking', 'pending')
    
    try {
      trackion.page({
        path: '/testing/manual-page',
        title: 'Manual Page Test',
        referrer: window.location.href,
        properties: {
          test_mode: true,
          page_load_time: performance.now(),
          viewport_size: `${window.innerWidth}x${window.innerHeight}`
        }
      })
      
      updateTestResult('pageTracking', 'success')
    } catch (error) {
      captureError(error, { test_name: 'pageTracking' })
      updateTestResult('pageTracking', 'error')
    }
  }

  // Test 6: UTM Parameter Tracking
  const testUTMTracking = () => {
    updateTestResult('utmTracking', 'pending')
    
    try {
      trackion.track('utm_test_event', {
        test_type: 'utm_tracking'
      }, {
        utm: {
          source: 'testing_page',
          medium: 'demo',
          campaign: 'trackion_test'
        }
      })
      
      updateTestResult('utmTracking', 'success')
    } catch (error) {
      captureError(error, { test_name: 'utmTracking' })
      updateTestResult('utmTracking', 'error')
    }
  }

  // Test 7: Runtime Refresh
  const testRuntimeRefresh = async () => {
    updateTestResult('runtimeRefresh', 'pending')
    
    try {
      await trackion.refreshRuntime({ force: true })
      
      trackion.track('runtime_refresh_test', {
        test_type: 'runtime_refresh',
        flags_count: Object.keys(trackion.getRuntimeSnapshot().flags).length,
        config_count: Object.keys(trackion.getRuntimeSnapshot().config).length
      })
      
      updateTestResult('runtimeRefresh', 'success')
    } catch (error) {
      captureError(error, { test_name: 'runtimeRefresh' })
      updateTestResult('runtimeRefresh', 'error')
    }
  }

  // Test 8: Batch Event Testing
  const testBatchEvents = () => {
    updateTestResult('batchEvents', 'pending')
    
    try {
      for (let i = 0; i < 5; i++) {
        trackion.track(`batch_test_event_${i}`, {
          batch_index: i,
          batch_size: 5,
          test_type: 'batch_events',
          timestamp: new Date().toISOString()
        })
      }
      
      updateTestResult('batchEvents', 'success')
    } catch (error) {
      captureError(error, { test_name: 'batchEvents' })
      updateTestResult('batchEvents', 'error')
    }
  }

  const runAllTests = async () => {
    const tests = [
      testEventTracking,
      testErrorCapture,
      testUserIdentification,
      testPageTracking,
      testUTMTracking,
      testBatchEvents,
      testRuntimeRefresh
    ]

    trackion.track('all_tests_started', {
      total_tests: tests.length,
      test_config: testingConfig || {}
    })

    for (const test of tests) {
      await new Promise(resolve => setTimeout(resolve, 500))
      test()
    }

    // Don't run automatic error in batch to avoid confusion
    trackion.track('all_tests_completed', {
      total_tests: tests.length
    })
  }

  const getResultIcon = (result?: 'success' | 'error' | 'pending') => {
    switch (result) {
      case 'success':
        return <CheckCircle size={16} style={{ color: '#10b981' }} />
      case 'error':
        return <XCircle size={16} style={{ color: '#ef4444' }} />
      case 'pending':
        return <div className="spinner" style={{ width: '16px', height: '16px' }} />
      default:
        return <div style={{ width: '16px', height: '16px' }} />
    }
  }

  return (
    <div className="testing-page">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Bug size={40} style={{ color: '#3b82f6' }} />
        Trackion Testing Suite
      </h1>
      <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.125rem' }}>
        Test all Trackion features and see real-time analytics in action. Every test generates actual events that you can view in your dashboard.
      </p>

      {/* Feature Flag Status */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={20} />
          Current Feature Flags & Config
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div style={{ 
            background: testFeatureFlag ? '#dcfce7' : '#fee2e2',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: `1px solid ${testFeatureFlag ? '#bbf7d0' : '#fecaca'}`
          }}>
            <div style={{ fontWeight: '500' }}>test_feature_flag</div>
            <div style={{ color: testFeatureFlag ? '#059669' : '#dc2626' }}>
              {testFeatureFlag ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          
          <div style={{ 
            background: advancedTesting ? '#dcfce7' : '#fee2e2',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: `1px solid ${advancedTesting ? '#bbf7d0' : '#fecaca'}`
          }}>
            <div style={{ fontWeight: '500' }}>advanced_testing_features</div>
            <div style={{ color: advancedTesting ? '#059669' : '#dc2626' }}>
              {advancedTesting ? 'Enabled' : 'Disabled'}
            </div>
          </div>

          <div style={{ 
            background: experimentalUI ? '#dcfce7' : '#fee2e2',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: `1px solid ${experimentalUI ? '#bbf7d0' : '#fecaca'}`
          }}>
            <div style={{ fontWeight: '500' }}>experimental_ui</div>
            <div style={{ color: experimentalUI ? '#059669' : '#dc2626' }}>
              {experimentalUI ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          
          <div style={{ 
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontWeight: '500' }}>testing_config</div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Max Tests: {testingConfig?.maxTestCount}<br/>
              Timeout: {testingConfig?.testTimeout}ms<br/>
              Theme: {testingConfig?.testingTheme}
            </div>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Test Controls</h3>
          <button 
            onClick={runAllTests}
            className="btn btn-primary flex items-center gap-2"
          >
            <Play size={16} />
            Run All Tests
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1rem' 
        }}>
          {/* Individual Test Cards */}
          <div className="card" style={{ border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={16} />
                Event Tracking
              </h4>
              {getResultIcon(testResults.eventTracking)}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Tests basic event tracking with custom properties and metadata.
            </p>
            <button 
              onClick={testEventTracking}
              className="btn btn-secondary btn-small"
            >
              Test Event Tracking
            </button>
          </div>

          <div className="card" style={{ border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} />
                Manual Error Capture
              </h4>
              {getResultIcon(testResults.errorCapture)}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Tests manual error capture with context and metadata.
            </p>
            <button 
              onClick={testErrorCapture}
              className="btn btn-secondary btn-small"
            >
              Test Error Capture
            </button>
          </div>

          <div className="card" style={{ border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={16} />
                Automatic Error
              </h4>
              {getResultIcon(testResults.automaticError)}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Throws an actual error to test automatic error capture.
            </p>
            <button 
              onClick={testAutomaticError}
              className="btn btn-danger btn-small"
            >
              Trigger Error
            </button>
          </div>

          <div className="card" style={{ border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} />
                User Identification
              </h4>
              {getResultIcon(testResults.userIdentification)}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Tests user identification and trait assignment.
            </p>
            <button 
              onClick={testUserIdentification}
              className="btn btn-secondary btn-small"
            >
              Test User ID
            </button>
          </div>

          <div className="card" style={{ border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0 }}>Page Tracking</h4>
              {getResultIcon(testResults.pageTracking)}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Tests manual page view tracking with metadata.
            </p>
            <button 
              onClick={testPageTracking}
              className="btn btn-secondary btn-small"
            >
              Test Page View
            </button>
          </div>

          <div className="card" style={{ border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0 }}>UTM Tracking</h4>
              {getResultIcon(testResults.utmTracking)}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Tests UTM parameter tracking for campaign attribution.
            </p>
            <button 
              onClick={testUTMTracking}
              className="btn btn-secondary btn-small"
            >
              Test UTM Params
            </button>
          </div>

          <div className="card" style={{ border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={16} />
                Runtime Refresh
              </h4>
              {getResultIcon(testResults.runtimeRefresh)}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Tests runtime data refresh for feature flags and config.
            </p>
            <button 
              onClick={testRuntimeRefresh}
              className="btn btn-secondary btn-small"
            >
              Test Runtime
            </button>
          </div>

          <div className="card" style={{ border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0 }}>Batch Events</h4>
              {getResultIcon(testResults.batchEvents)}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Tests multiple events in sequence to verify batching.
            </p>
            <button 
              onClick={testBatchEvents}
              className="btn btn-secondary btn-small"
            >
              Test Batching
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Testing (Feature Flag Controlled) */}
      {advancedTesting && (
        <div className="card" style={{ 
          marginBottom: '2rem',
          background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
          color: 'white'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>🔬 Advanced Testing Features</h3>
          <p style={{ marginBottom: '1rem', opacity: 0.9 }}>
            These advanced testing features are enabled by the 'advanced_testing_features' feature flag.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button 
              onClick={() => {
                trackion.track('performance_test', {
                  test_type: 'performance',
                  timing: performance.now(),
                  memory: (performance as any).memory?.usedJSHeapSize || 0
                })
              }}
              className="btn"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              Performance Test
            </button>
            
            <button 
              onClick={() => {
                for (let i = 0; i < 50; i++) {
                  trackion.track('stress_test_event', { iteration: i })
                }
              }}
              className="btn"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              Stress Test (50 events)
            </button>
            
            <button 
              onClick={() => trackion.flush()}
              className="btn"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              Force Flush
            </button>
          </div>
        </div>
      )}

      {/* Testing Instructions */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>📝 Testing Instructions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4>How to Use This Page:</h4>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: 1.8 }}>
              <li>Click individual test buttons to test specific features</li>
              <li>Use "Run All Tests" to execute a comprehensive test suite</li>
              <li>Watch the status indicators for real-time feedback</li>
              <li>Check your Trackion dashboard to see the generated events</li>
              <li>Test error tracking with the "Trigger Error" button</li>
            </ol>
          </div>
          <div>
            <h4>What Gets Tracked:</h4>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.8 }}>
              <li>Every button click and user interaction</li>
              <li>Page navigation and time spent</li>
              <li>Error events (both manual and automatic)</li>
              <li>User identification changes</li>
              <li>Feature flag and config usage</li>
              <li>Performance and timing data</li>
            </ul>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#f8fafc', 
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <strong>💡 Pro Tip:</strong> Open your browser's developer console to see detailed logs, 
          then check your Trackion dashboard to view all the events and errors generated by these tests.
        </div>
      </div>
    </div>
  )
}