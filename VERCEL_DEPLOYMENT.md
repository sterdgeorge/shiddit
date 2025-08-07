# 🚀 Vercel Deployment Guide for Shiddit

## 📋 Overview

This guide will walk you through deploying your Shiddit website to Vercel, including Firebase integration, environment variables, and production optimizations.

## 🛠️ Prerequisites

- [ ] Vercel account (free at [vercel.com](https://vercel.com))
- [ ] GitHub/GitLab/Bitbucket account
- [ ] Firebase project set up
- [ ] Node.js installed locally (for testing)

## 📁 Project Structure Check

Ensure your project has these essential files:

```
app-shiddit/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utilities and Firebase config
├── scripts/                # Admin setup scripts
├── public/                 # Static assets
├── package.json            # Dependencies
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
└── README.md               # Project documentation
```

## 🔧 Step 1: Prepare Your Project

### 1.1 Update package.json

Ensure your `package.json` has the correct scripts and dependencies:

```json
{
  "name": "shiddit",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "firebase": "^10.0.0",
    "lucide-react": "^0.300.0",
    "tailwindcss": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

### 1.2 Create next.config.js

```javascript
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
}

module.exports = nextConfig
```

### 1.3 Create .gitignore

```gitignore
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

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Firebase
.firebase/
firebase-debug.log
```

## 🔐 Step 2: Environment Variables Setup

### 2.1 Create .env.local (for local development)

```bash
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
```

### 2.2 Update Firebase Configuration

Update `lib/firebase.ts` to use environment variables:

```typescript
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Analytics only on client side
let analytics = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

export { analytics }

export default app
```

## 📦 Step 3: Prepare for Deployment

### 3.1 Test Local Build

```bash
# Install dependencies
npm install

# Test the build
npm run build

# Test production server locally
npm start
```

### 3.2 Commit Your Code

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare for Vercel deployment"

# Push to your repository
git push origin main
```

## 🚀 Step 4: Deploy to Vercel

### 4.1 Connect to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub/GitLab/Bitbucket account
3. **Click "New Project"**
4. **Import your repository** from the list

### 4.2 Configure Project Settings

In the Vercel dashboard:

1. **Project Name:** `shiddit` (or your preferred name)
2. **Framework Preset:** `Next.js`
3. **Root Directory:** `./` (leave empty if project is in root)
4. **Build Command:** `npm run build` (should auto-detect)
5. **Output Directory:** `.next` (should auto-detect)
6. **Install Command:** `npm install` (should auto-detect)

### 4.3 Set Environment Variables

In the Vercel project settings:

1. **Go to Settings → Environment Variables**
2. **Add each environment variable:**

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyApezZ6jDvIrw54cZs4ExF4AI2CclYs_K4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=shiddit-d1ccb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://shiddit-d1ccb-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=shiddit-d1ccb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=shiddit-d1ccb.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=929483961055
NEXT_PUBLIC_FIREBASE_APP_ID=1:929483961055:web:37abdd1638117d8a1eaf6a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-R4W9HDBFCE
NEXT_PUBLIC_ADMIN_EMAIL=admin@shiddit.com
NEXT_PUBLIC_ADMIN_USERNAME=ShidditAdmin
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_NAME=Shiddit
```

3. **Set Environment:** Select `Production`, `Preview`, and `Development`
4. **Click "Save"**

### 4.4 Deploy

1. **Click "Deploy"**
2. **Wait for build to complete** (usually 2-5 minutes)
3. **Check build logs** for any errors

## 🔧 Step 5: Post-Deployment Setup

### 5.1 Set Up Admin User

After deployment, run the admin setup:

```bash
# Clone your repository locally
git clone https://github.com/yourusername/shiddit.git
cd shiddit

# Install dependencies
npm install

# Run admin setup script
node scripts/setup-admin.js
```

### 5.2 Configure Custom Domain (Optional)

1. **Go to Vercel Dashboard → Domains**
2. **Add your custom domain**
3. **Update DNS records** as instructed
4. **Update environment variables** with new domain

### 5.3 Set Up Firebase Security Rules

In Firebase Console:

1. **Go to Firestore Database → Rules**
2. **Update rules for production:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all users
    match /{document=**} {
      allow read: if true;
    }
    
    // Allow write access to authenticated users
    match /users/{userId} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /posts/{postId} {
      allow write: if request.auth != null;
    }
    
    match /comments/{commentId} {
      allow write: if request.auth != null;
    }
    
    match /conversations/{conversationId} {
      allow write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    match /favorites/{favoriteId} {
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Admin access
    match /{document=**} {
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## 🔍 Step 6: Testing & Verification

### 6.1 Test Core Functionality

1. **Visit your deployed site**
2. **Test user registration/login**
3. **Test post creation**
4. **Test admin panel access**
5. **Test user banning**
6. **Test content deletion**

### 6.2 Performance Check

1. **Run Lighthouse audit**
2. **Check Core Web Vitals**
3. **Test mobile responsiveness**
4. **Verify loading speeds**

## 🔄 Step 7: Continuous Deployment

### 7.1 Automatic Deployments

Vercel automatically deploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

### 7.2 Deployment Workflow

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys
# Check deployment status in Vercel dashboard
```

## 🛡️ Step 8: Security & Monitoring

### 8.1 Security Checklist

- [ ] Environment variables are set
- [ ] Firebase security rules are configured
- [ ] Admin credentials are changed
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Domain is verified

### 8.2 Monitoring Setup

1. **Vercel Analytics** (built-in)
2. **Firebase Analytics** (already configured)
3. **Error tracking** (consider Sentry)
4. **Performance monitoring**

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs in Vercel dashboard
# Common fixes:
npm install --legacy-peer-deps
# or
npm install --force
```

#### Environment Variables Not Working
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Check Vercel environment variable settings
- Redeploy after adding variables

#### Firebase Connection Issues
- Verify Firebase project is active
- Check API keys are correct
- Ensure Firestore rules allow access

#### Admin Panel Not Working
- Run admin setup script
- Check admin user exists in Firebase
- Verify `isAdmin: true` flag is set

## 📊 Performance Optimization

### 8.1 Vercel Optimizations

1. **Enable Edge Functions** for faster response times
2. **Use Image Optimization** with Next.js Image component
3. **Enable Compression** (automatic with Vercel)
4. **Use CDN** (automatic with Vercel)

### 8.2 Code Optimizations

1. **Lazy load components**
2. **Optimize images**
3. **Minimize bundle size**
4. **Use proper caching headers**

## 🎯 Final Checklist

- [ ] Project builds successfully locally
- [ ] Environment variables are configured
- [ ] Admin user is created
- [ ] Custom domain is set up (optional)
- [ ] Firebase security rules are updated
- [ ] All functionality is tested
- [ ] Performance is optimized
- [ ] Monitoring is set up
- [ ] Backup strategy is in place

## 🚀 Your Site is Live!

Your Shiddit website is now deployed on Vercel with:
- ✅ Automatic deployments
- ✅ Global CDN
- ✅ HTTPS enabled
- ✅ Firebase integration
- ✅ Admin panel
- ✅ Production optimizations

**Your site URL:** `https://your-project-name.vercel.app`

---

## 📞 Support

If you encounter issues:

1. **Check Vercel deployment logs**
2. **Review Firebase Console**
3. **Test locally first**
4. **Check environment variables**
5. **Verify Firebase security rules**

Your Shiddit website is now production-ready! 🎉
