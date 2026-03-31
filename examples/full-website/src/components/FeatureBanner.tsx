interface FeatureBannerProps {
  config?: {
    text: string
    bgColor: string
    textColor: string
  }
}

export default function FeatureBanner({ config }: FeatureBannerProps) {
  if (!config) return null

  return (
    <div 
      className="feature-banner"
      style={{ 
        backgroundColor: config.bgColor, 
        color: config.textColor 
      }}
    >
      {config.text}
    </div>
  )
}