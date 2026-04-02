import { useTrackion } from '@trackion/web/react'

export default function Footer() {
  const trackion = useTrackion()

  const handleFooterClick = (section: string, item: string) => {
    trackion.track('footer_click', {
      section,
      item,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Trackion</h3>
            <ul>
              <li>
                <a href="#" onClick={() => handleFooterClick('about', 'company')}>
                  Our Company
                </a>
              </li>
              <li>
                <a href="#" onClick={() => handleFooterClick('about', 'careers')}>
                  Careers
                </a>
              </li>
              <li>
                <a href="#" onClick={() => handleFooterClick('about', 'press')}>
                  Press
                </a>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Support</h3>
            <ul>
              <li>
                <a href="#" onClick={() => handleFooterClick('support', 'help')}>
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" onClick={() => handleFooterClick('support', 'contact')}>
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" onClick={() => handleFooterClick('support', 'status')}>
                  System Status
                </a>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Legal</h3>
            <ul>
              <li>
                <a href="#" onClick={() => handleFooterClick('legal', 'privacy')}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" onClick={() => handleFooterClick('legal', 'terms')}>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" onClick={() => handleFooterClick('legal', 'cookies')}>
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Connect</h3>
            <ul>
              <li>
                <a href="#" onClick={() => handleFooterClick('social', 'twitter')}>
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" onClick={() => handleFooterClick('social', 'github')}>
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" onClick={() => handleFooterClick('social', 'discord')}>
                  Discord
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          © 2024 Trackion Demo Store. All rights reserved. | Powered by Trackion Analytics
        </div>
      </div>
    </footer>
  )
}