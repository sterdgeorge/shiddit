#!/bin/bash

# 🚀 Shiddit Vercel Deployment Script
# This script helps automate the deployment process

echo "🚀 Starting Shiddit deployment to Vercel..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_status "Checking prerequisites..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if next.config.js exists
if [ ! -f "next.config.js" ]; then
    print_warning "next.config.js not found. Creating one..."
    cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  output: 'standalone',
  swcMinify: true,
  compress: true,
}

module.exports = nextConfig
EOF
    print_success "Created next.config.js"
fi

print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies. Please check your package.json and try again."
    exit 1
fi

print_status "Building the project..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed. Please fix the build errors and try again."
    exit 1
fi

print_success "Build completed successfully!"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating template..."
    cat > .env.local << 'EOF'
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyApezZ6jDvIrw54cZs4ExF4AI2CclYs_K4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=shiddit-d1ccb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://shiddit-d1ccb-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=shiddit-d1ccb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=shiddit-d1ccb.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=929483961055
NEXT_PUBLIC_FIREBASE_APP_ID=1:929483961055:web:37abdd1638117d8a1eaf6a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-R4W9HDBFCE

# Admin Configuration
NEXT_PUBLIC_ADMIN_EMAIL=admin@shiddit.com
NEXT_PUBLIC_ADMIN_USERNAME=ShidditAdmin

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_NAME=Shiddit
EOF
    print_success "Created .env.local template"
    print_warning "Please update .env.local with your actual values before deploying."
fi

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    print_warning ".gitignore not found. Creating one..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/

# Production
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Firebase
.firebase/
firebase-debug.log

# TypeScript
*.tsbuildinfo
EOF
    print_success "Created .gitignore"
fi

print_status "Checking git status..."
if [ ! -d ".git" ]; then
    print_warning "Git repository not initialized. Initializing..."
    git init
    git add .
    git commit -m "Initial commit for Vercel deployment"
    print_success "Git repository initialized"
else
    print_status "Git repository found. Checking for changes..."
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Uncommitted changes found. Committing..."
        git add .
        git commit -m "Update for Vercel deployment"
        print_success "Changes committed"
    else
        print_success "No uncommitted changes"
    fi
fi

print_success "✅ Project is ready for deployment!"

echo ""
echo "📋 Next Steps:"
echo "1. Push your code to GitHub/GitLab/Bitbucket:"
echo "   git remote add origin <your-repo-url>"
echo "   git push -u origin main"
echo ""
echo "2. Go to https://vercel.com and create a new project"
echo ""
echo "3. Import your repository"
echo ""
echo "4. Set up environment variables in Vercel dashboard:"
echo "   - NEXT_PUBLIC_FIREBASE_API_KEY"
echo "   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
echo "   - NEXT_PUBLIC_FIREBASE_DATABASE_URL"
echo "   - NEXT_PUBLIC_FIREBASE_PROJECT_ID"
echo "   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
echo "   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
echo "   - NEXT_PUBLIC_FIREBASE_APP_ID"
echo "   - NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
echo ""
echo "5. Deploy!"
echo ""
echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"
echo ""
print_success "🎉 Deployment preparation complete!" 