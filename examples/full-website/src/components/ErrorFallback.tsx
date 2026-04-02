interface ErrorFallbackProps {
  error?: Error
  reset?: () => void
}

export default function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="error-boundary">
      <h2>😵 Something went wrong!</h2>
      <p>We've automatically reported this error and our team will look into it.</p>
      {error && (
        <details style={{ marginTop: '1rem', textAlign: 'left' }}>
          <summary>Error Details</summary>
          <pre style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#dc2626' }}>
            {error.message}
          </pre>
        </details>
      )}
      {reset && (
        <button onClick={reset} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Try Again
        </button>
      )}
    </div>
  )
}