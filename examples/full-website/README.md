# Trackion Demo Store - Complete Example Website

A comprehensive React + Vite example showcasing **all features** of the Trackion analytics SDK in a realistic e-commerce environment.

## 🚀 Features Demonstrated

This example website showcases every aspect of Trackion's capabilities:

### 📊 **Event Tracking**
- **Automatic page views** on navigation
- **Custom event tracking** for user interactions
- **E-commerce events** (add to cart, checkout, purchase)
- **Navigation tracking** with detailed context
- **Form submissions** and user actions

### 🚨 **Error Tracking**
- **Automatic error capture** for uncaught errors
- **Manual error reporting** with context
- **React error boundaries** integration
- **Error deduplication** and filtering
- **Comprehensive testing** with intentional errors

### 🎯 **Feature Flags**
- **Dynamic UI changes** based on feature flags
- **A/B testing scenarios** (banners, sections, layouts)
- **Real-time flag updates** without page refresh
- **Conditional feature rendering**

### ⚙️ **Remote Configuration**
- **Dynamic content** (text, colors, settings)
- **Real-time configuration updates**
- **Themed experiences** controlled remotely
- **Flexible content management**

### 👤 **User Identification**
- **User tracking** across sessions
- **Authentication flow** with user traits
- **Session management** and identification
- **Custom user properties**

### 🔍 **UTM & Campaign Tracking**
- **UTM parameter capture** and attribution
- **Campaign tracking** simulation
- **Referral source analysis**

## 🏃‍♂️ Quick Start

### 1. **Setup Trackion Server**
First, make sure your Trackion server is running:

```bash
# From the main Trackion directory
cd /path/to/trackion
go run ./cmd
```

Your Trackion server should be available at `http://localhost:8080`

### 2. **Configure the Demo**
Update the Trackion configuration in `src/main.tsx`:

```typescript
const trackionConfig = {
  serverUrl: 'http://localhost:8080',     // Your Trackion server URL
  apiKey: 'your_api_key',                // Your API key
  projectId: 'your_project_id',          // Your project ID
  userId: 'demo_user_123',               // Test user ID
  autoPageview: true,
  batchSize: 10,
  flushIntervalMs: 3000
}
```

### 3. **Install & Run**

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

The demo will be available at `http://localhost:3001`

## 🧪 Testing All Features

### **Navigation Test**
1. Browse between pages (Home → Products → Profile)
2. Check your Trackion dashboard for automatic page views
3. Notice navigation events with context

### **E-commerce Flow Test**
1. **Browse Products** - View product listings with filtering
2. **Product Detail** - Click products to see detailed tracking
3. **Add to Cart** - Watch cart events with product details
4. **Checkout Flow** - Complete the purchase process
5. **Success Page** - See conversion tracking

### **Error Tracking Test**
1. Visit the **Testing** page
2. Click "**Trigger Error**" to test automatic error capture
3. Click "**Test Error Capture**" for manual error reporting
4. Check the **Errors** section in your Trackion dashboard

### **Feature Flags Test**
1. Configure feature flags in your Trackion dashboard:
   - `show_promotion_banner`
   - `advanced_testing_features`
   - `experimental_ui`
   - `express_checkout`
   - `show_analytics_section`
2. Refresh the page to see real-time changes
3. Toggle flags to see immediate UI updates

### **Remote Config Test**
1. Configure remote config in your Trackion dashboard:
   ```json
   {
     "hero_config": {
       "title": "Custom Hero Title",
       "subtitle": "Dynamic subtitle from Trackion",
       "ctaText": "Custom CTA"
     },
     "banner_config": {
       "text": "🎉 Live from Trackion!",
       "bgColor": "#10b981",
       "textColor": "#ffffff"
     }
   }
   ```
2. See content update without code changes

### **Comprehensive Testing Suite**
Visit `/testing` for the complete testing suite:

- **✅ Event Tracking Test** - Basic event with metadata
- **⚠️ Error Capture Test** - Manual error reporting  
- **💥 Automatic Error Test** - Triggers real errors
- **👤 User ID Test** - User identification flow
- **📄 Page Tracking Test** - Manual page view events
- **🔗 UTM Test** - Campaign attribution tracking
- **🔄 Runtime Refresh** - Feature flag & config updates
- **📦 Batch Events** - Multiple events testing

## 📱 Pages Overview

### **🏠 Home Page (`/`)**
- Hero section with remote config
- Feature highlights 
- Dynamic analytics section (feature flag controlled)
- Session start tracking

### **🛍️ Products Page (`/products`)**
- Product grid with filtering and sorting
- Add to cart functionality
- Comprehensive e-commerce tracking
- Search and filter events

### **📦 Product Detail (`/products/:id`)**
- Detailed product information
- Error testing button
- Reviews and ratings interaction
- Feature highlight tracking

### **🛒 Cart Page (`/cart`)**
- Shopping cart management
- Quantity updates tracking
- Cart abandonment scenarios
- Checkout initiation

### **💳 Checkout (`/checkout`)**
- Multi-step checkout process  
- Form validation and submission
- Payment simulation (with errors)
- Express checkout (feature flag)

### **👤 Profile (`/profile`)**
- User dashboard with analytics
- Order history
- Settings management
- Achievement system (remote config)

### **🔐 Login (`/login`)**
- Authentication simulation
- User identification tracking
- Social login testing
- Form interaction events

### **🧪 Testing (`/testing`)**
- Comprehensive testing suite
- Feature flag status display
- All Trackion features testing
- Real-time result indicators

## 📊 Analytics Dashboard

After using the demo, check your Trackion dashboard to see:

1. **Events Dashboard**
   - Page views with paths and timing
   - Custom events with detailed properties
   - User interactions and conversions
   - E-commerce funnel analytics

2. **Error Tracking**
   - Grouped errors by fingerprint
   - Stack traces with context
   - Error frequency and patterns
   - User-specific error data

3. **User Analytics**
   - User journeys and sessions
   - Feature usage patterns
   - Conversion paths
   - Retention analytics

## 🎯 Key Learning Points

### **Event Structure**
Every event includes rich metadata:
```javascript
trackion.track('product_viewed', {
  product_id: 'prod_123',
  product_name: 'Analytics Dashboard',
  product_category: 'Software',
  product_price: 299,
  source: 'products_grid',
  user_action: 'click'
})
```

### **Error Context**
Errors capture comprehensive debugging info:
```javascript
captureError(error, {
  component: 'CheckoutForm',
  user_id: 'user_123',
  form_step: 'payment',
  cart_total: 299.99
})
```

### **Feature Flag Usage**
Dynamic UI based on real-time flags:
```jsx
const showBanner = useFeatureFlag('show_promotion_banner')
return showBanner && <PromotionBanner />
```

### **Remote Configuration**
Content management without deployments:
```jsx
const config = useRemoteConfig('hero_config', fallback)
return <Hero title={config?.title} />
```

## 🔧 Customization

### **Adding New Events**
1. Add tracking calls where needed:
   ```javascript
   trackion.track('custom_event', { 
     key: 'value',
     timestamp: Date.now()
   })
   ```

### **Creating Feature Flags**
1. Add flag checks in components:
   ```jsx
   const newFeature = useFeatureFlag('new_feature_name')
   ```
2. Configure the flag in your Trackion dashboard

### **Remote Config Setup**
1. Add config usage:
   ```jsx
   const config = useRemoteConfig('config_key', defaultValue)
   ```
2. Set the configuration in your dashboard

## 🚨 Error Testing

The demo includes multiple error scenarios:

1. **Network Errors** - Simulated API failures
2. **Validation Errors** - Form submission failures  
3. **Runtime Errors** - JavaScript exceptions
4. **Component Errors** - React error boundary testing
5. **Async Errors** - Promise rejection handling

## 📈 Production Readiness

This example demonstrates production-ready patterns:

- **Error Boundaries** - Graceful error handling
- **Performance** - Efficient event batching
- **Type Safety** - Full TypeScript support
- **Accessibility** - Proper ARIA labels
- **SEO** - Meta tags and semantic HTML
- **Mobile** - Responsive design patterns

## 🤝 Contributing

To extend this example:

1. Add new pages following the existing patterns
2. Include comprehensive tracking for new features
3. Test error scenarios thoroughly
4. Update documentation with new use cases

## 🆘 Support

- **Trackion Documentation**: [docs.trackion.tech](https://docs.trackion.tech)
- **API Reference**: Check `/docs/api/` in the main repository
- **SDK Reference**: Check `/sdk/web/README.md`

---

**This example showcases Trackion's full potential in a realistic application. Every interaction generates valuable analytics data that helps you understand user behavior and improve your product.** 🚀