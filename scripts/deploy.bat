@echo off
REM 🚀 Shiddit Vercel Deployment Script for Windows
REM This script helps automate the deployment process

echo 🚀 Starting Shiddit deployment to Vercel...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed. Please install Git first.
    pause
    exit /b 1
)

echo [INFO] Checking prerequisites...

REM Check if package.json exists
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Check if next.config.js exists
if not exist "next.config.js" (
    echo [WARNING] next.config.js not found. Creating one...
    (
        echo /** @type {import^('next'^).NextConfig} */
        echo const nextConfig = {
        echo   experimental: {
        echo     appDir: true,
        echo   },
        echo   images: {
        echo     domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
        echo   },
        echo   env: {
        echo     CUSTOM_KEY: process.env.CUSTOM_KEY,
        echo   },
        echo   output: 'standalone',
        echo   swcMinify: true,
        echo   compress: true,
        echo }
        echo.
        echo module.exports = nextConfig
    ) > next.config.js
    echo [SUCCESS] Created next.config.js
)

echo [INFO] Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies. Please check your package.json and try again.
    pause
    exit /b 1
)

echo [INFO] Building the project...
call npm run build

if %errorlevel% neq 0 (
    echo [ERROR] Build failed. Please fix the build errors and try again.
    pause
    exit /b 1
)

echo [SUCCESS] Build completed successfully!

REM Check if .env.local exists
if not exist ".env.local" (
    echo [WARNING] .env.local not found. Creating template...
    (
        echo # Firebase Configuration
        echo NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyApezZ6jDvIrw54cZs4ExF4AI2CclYs_K4
        echo NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=shiddit-d1ccb.firebaseapp.com
        echo NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://shiddit-d1ccb-default-rtdb.firebaseio.com
        echo NEXT_PUBLIC_FIREBASE_PROJECT_ID=shiddit-d1ccb
        echo NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=shiddit-d1ccb.firebasestorage.app
        echo NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=929483961055
        echo NEXT_PUBLIC_FIREBASE_APP_ID=1:929483961055:web:37abdd1638117d8a1eaf6a
        echo NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-R4W9HDBFCE
        echo.
        echo # Admin Configuration
        echo NEXT_PUBLIC_ADMIN_EMAIL=admin@shiddit.com
        echo NEXT_PUBLIC_ADMIN_USERNAME=ShidditAdmin
        echo.
        echo # Site Configuration
        echo NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
        echo NEXT_PUBLIC_SITE_NAME=Shiddit
    ) > .env.local
    echo [SUCCESS] Created .env.local template
    echo [WARNING] Please update .env.local with your actual values before deploying.
)

REM Check if .gitignore exists
if not exist ".gitignore" (
    echo [WARNING] .gitignore not found. Creating one...
    (
        echo # Dependencies
        echo node_modules/
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo.
        echo # Next.js
        echo .next/
        echo out/
        echo.
        echo # Production
        echo build/
        echo.
        echo # Environment variables
        echo .env
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo.
        echo # Vercel
        echo .vercel
        echo.
        echo # IDE
        echo .vscode/
        echo .idea/
        echo.
        echo # OS
        echo .DS_Store
        echo Thumbs.db
        echo.
        echo # Logs
        echo *.log
        echo.
        echo # Firebase
        echo .firebase/
        echo firebase-debug.log
        echo.
        echo # TypeScript
        echo *.tsbuildinfo
    ) > .gitignore
    echo [SUCCESS] Created .gitignore
)

echo [INFO] Checking git status...
if not exist ".git" (
    echo [WARNING] Git repository not initialized. Initializing...
    git init
    git add .
    git commit -m "Initial commit for Vercel deployment"
    echo [SUCCESS] Git repository initialized
) else (
    echo [INFO] Git repository found. Checking for changes...
    git status --porcelain >nul 2>&1
    if %errorlevel% equ 0 (
        echo [WARNING] Uncommitted changes found. Committing...
        git add .
        git commit -m "Update for Vercel deployment"
        echo [SUCCESS] Changes committed
    ) else (
        echo [SUCCESS] No uncommitted changes
    )
)

echo [SUCCESS] ✅ Project is ready for deployment!

echo.
echo 📋 Next Steps:
echo 1. Push your code to GitHub/GitLab/Bitbucket:
echo    git remote add origin ^<your-repo-url^>
echo    git push -u origin main
echo.
echo 2. Go to https://vercel.com and create a new project
echo.
echo 3. Import your repository
echo.
echo 4. Set up environment variables in Vercel dashboard:
echo    - NEXT_PUBLIC_FIREBASE_API_KEY
echo    - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
echo    - NEXT_PUBLIC_FIREBASE_DATABASE_URL
echo    - NEXT_PUBLIC_FIREBASE_PROJECT_ID
echo    - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
echo    - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
echo    - NEXT_PUBLIC_FIREBASE_APP_ID
echo    - NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
echo.
echo 5. Deploy!
echo.
echo 📖 For detailed instructions, see VERCEL_DEPLOYMENT.md
echo.
echo [SUCCESS] 🎉 Deployment preparation complete!
pause
