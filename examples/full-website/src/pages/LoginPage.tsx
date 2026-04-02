import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'
import { useTrackion, useCaptureError } from '@trackion/web/react'
import { useState } from 'react'

interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

interface SignupForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const trackion = useTrackion()
  const captureError = useCaptureError()
  const navigate = useNavigate()

  const loginForm = useForm<LoginForm>()
  const signupForm = useForm<SignupForm>()

  const handleModeChange = (newMode: 'login' | 'signup') => {
    trackion.track('auth_mode_changed', {
      from_mode: mode,
      to_mode: newMode
    })
    setMode(newMode)
  }

  const handleLogin = async (data: LoginForm) => {
    trackion.track('login_attempted', {
      email: data.email,
      remember_me: data.rememberMe
    })

    try {
      // Simulate authentication
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (data.email === 'demo@trackion.tech' && data.password === 'demo123') {
            resolve(true)
          } else {
            reject(new Error('Invalid credentials'))
          }
        }, 1000)
      })

      // Success
      trackion.track('login_successful', {
        email: data.email,
        method: 'email_password'
      })

      // Update user identification
      trackion.identify(`user_${data.email.split('@')[0]}`, {
        email: data.email,
        login_method: 'email_password',
        last_login: new Date().toISOString()
      })

      navigate('/profile')

    } catch (error) {
      captureError(error, {
        form_type: 'login',
        email: data.email
      })

      trackion.track('login_failed', {
        email: data.email,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })

      alert('Invalid credentials. Try: demo@trackion.tech / demo123')
    }
  }

  const handleSignup = async (data: SignupForm) => {
    trackion.track('signup_attempted', {
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName
    })

    if (data.password !== data.confirmPassword) {
      captureError(new Error('Password confirmation mismatch'), {
        form_type: 'signup',
        email: data.email
      })
      alert('Passwords do not match')
      return
    }

    try {
      // Simulate user creation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      trackion.track('signup_successful', {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        signup_method: 'email_password'
      })

      // Update user identification
      trackion.identify(`user_${data.email.split('@')[0]}`, {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        signup_method: 'email_password',
        signup_date: new Date().toISOString()
      })

      navigate('/profile')

    } catch (error) {
      captureError(error, {
        form_type: 'signup',
        email: data.email
      })

      trackion.track('signup_failed', {
        email: data.email,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })

      alert('Signup failed. Please try again.')
    }
  }

  const handleSocialLogin = (provider: string) => {
    trackion.track('social_login_clicked', {
      provider,
      current_mode: mode
    })
    alert(`${provider} login would be implemented here`)
  }

  return (
    <div className="login-page">
      <div style={{ 
        maxWidth: '400px', 
        margin: '0 auto', 
        padding: '2rem 0' 
      }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p style={{ color: '#64748b' }}>
              {mode === 'login' 
                ? 'Sign in to your Trackion Demo account' 
                : 'Join the Trackion Demo experience'
              }
            </p>
          </div>

          {/* Mode Toggle */}
          <div style={{ 
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '0.5rem',
            padding: '0.25rem',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => handleModeChange('login')}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                borderRadius: '0.25rem',
                background: mode === 'login' ? 'white' : 'transparent',
                color: mode === 'login' ? '#1e293b' : '#64748b',
                fontWeight: mode === 'login' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => handleModeChange('signup')}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                borderRadius: '0.25rem',
                background: mode === 'signup' ? 'white' : 'transparent',
                color: mode === 'signup' ? '#1e293b' : '#64748b',
                fontWeight: mode === 'signup' ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Sign Up
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email"
                  className="form-input"
                  placeholder="demo@trackion.tech"
                  {...loginForm.register('email', { required: 'Email is required' })}
                />
                {loginForm.formState.errors.email && 
                  <div className="form-error">{loginForm.formState.errors.email.message}</div>
                }
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password"
                  className="form-input"
                  placeholder="demo123"
                  {...loginForm.register('password', { required: 'Password is required' })}
                />
                {loginForm.formState.errors.password && 
                  <div className="form-error">{loginForm.formState.errors.password.message}</div>
                }
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox"
                    {...loginForm.register('rememberMe')}
                  />
                  Remember me
                </label>
              </div>

              <button 
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '1rem' }}
                disabled={loginForm.formState.isSubmitting}
              >
                <LogIn size={16} style={{ marginRight: '0.5rem' }} />
                {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(handleSignup)}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input 
                    type="text"
                    className="form-input"
                    {...signupForm.register('firstName', { required: 'First name is required' })}
                  />
                  {signupForm.formState.errors.firstName && 
                    <div className="form-error">{signupForm.formState.errors.firstName.message}</div>
                  }
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input 
                    type="text"
                    className="form-input"
                    {...signupForm.register('lastName', { required: 'Last name is required' })}
                  />
                  {signupForm.formState.errors.lastName && 
                    <div className="form-error">{signupForm.formState.errors.lastName.message}</div>
                  }
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email"
                  className="form-input"
                  {...signupForm.register('email', { required: 'Email is required' })}
                />
                {signupForm.formState.errors.email && 
                  <div className="form-error">{signupForm.formState.errors.email.message}</div>
                }
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password"
                  className="form-input"
                  {...signupForm.register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />
                {signupForm.formState.errors.password && 
                  <div className="form-error">{signupForm.formState.errors.password.message}</div>
                }
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input 
                  type="password"
                  className="form-input"
                  {...signupForm.register('confirmPassword', { required: 'Please confirm your password' })}
                />
                {signupForm.formState.errors.confirmPassword && 
                  <div className="form-error">{signupForm.formState.errors.confirmPassword.message}</div>
                }
              </div>

              <button 
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '1rem' }}
                disabled={signupForm.formState.isSubmitting}
              >
                <UserPlus size={16} style={{ marginRight: '0.5rem' }} />
                {signupForm.formState.isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Social Login */}
          <div style={{ margin: '1rem 0' }}>
            <div style={{ 
              textAlign: 'center', 
              color: '#64748b', 
              fontSize: '0.875rem',
              position: 'relative'
            }}>
              <span style={{ background: 'white', padding: '0 1rem' }}>or continue with</span>
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: 0, 
                right: 0, 
                height: '1px', 
                background: '#e2e8f0',
                zIndex: -1
              }}></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button 
              onClick={() => handleSocialLogin('Google')}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              🌐 Google
            </button>
            <button 
              onClick={() => handleSocialLogin('GitHub')}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              💻 GitHub
            </button>
          </div>

          {/* Demo Credentials */}
          {mode === 'login' && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: '#f8fafc', 
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              <strong>Demo Credentials:</strong><br />
              Email: demo@trackion.tech<br />
              Password: demo123
            </div>
          )}
        </div>
      </div>
    </div>
  )
}