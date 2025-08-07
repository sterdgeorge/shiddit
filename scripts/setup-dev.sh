#!/bin/bash

echo "Setting up Shiddit development environment..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyApezZ6jDvIrw54cZs4ExF4AI2CclYs_K4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=shiddit-d1ccb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=shiddit-d1ccb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=shiddit-d1ccb.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=929483961055
NEXT_PUBLIC_FIREBASE_APP_ID=1:929483961055:web:37abdd1638117d8a1eaf6a

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo ".env.local created with your Firebase config!"
else
    echo ".env.local already exists"
fi

# Start development server
echo "Starting development server..."
npm run dev 