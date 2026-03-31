#!/bin/bash

# Trackion Demo Store Setup Script
echo "🚀 Setting up Trackion Demo Store..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the full-website directory"
    echo "   cd examples/full-website && ./setup.sh"
    exit 1
fi

# Check if Trackion SDK is built
if [ ! -d "../../sdk/web/dist" ]; then
    echo "📦 Building Trackion SDK..."
    cd ../../sdk/web
    npm run build
    cd ../../examples/full-website
    echo "✅ SDK built successfully"
else
    echo "✅ Trackion SDK already built"
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the project to verify everything works
echo "🔨 Building project to verify setup..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful - setup complete!"
else
    echo "❌ Build failed - please check the errors above"
    exit 1
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start your Trackion server:"
echo "   cd ../../ && go run ./cmd"
echo ""
echo "2. Update configuration in src/main.tsx with your:"
echo "   - Server URL (default: http://localhost:8080)"
echo "   - API Key"
echo "   - Project ID"
echo ""
echo "3. Start the demo:"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:3001 and explore!"
echo ""
echo "🧪 Testing Features:"
echo "- Visit /testing for comprehensive feature testing"
echo "- Browse products and complete checkout flows"  
echo "- Test error tracking with intentional errors"
echo "- Configure feature flags in your Trackion dashboard"
echo ""
echo "📊 Check your Trackion dashboard to see events and errors!"
echo ""