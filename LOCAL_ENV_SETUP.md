# Local Environment Setup Guide

## Step 1: Create Local Environment File

Create a `.env.local` file in your project root directory with the following content:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=shiddit_uploads

# Firebase Configuration (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyApezZ6jDvIrw54cZs4ExF4AI2CclYs_K4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=shiddit-d1ccb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://shiddit-d1ccb-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=shiddit-d1ccb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=shiddit-d1ccb.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=929483961055
NEXT_PUBLIC_FIREBASE_APP_ID=1:929483961055:web:37abdd1638117d8a1eaf6a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-R4W9HDBFCE
```

## Step 2: Get Cloudinary Credentials

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Sign up or log in to your account
3. From the dashboard, copy your:
   - **Cloud Name** (found in the top right)
   - **API Key** (found in Account Details)
   - **API Secret** (found in Account Details)

## Step 3: Create Upload Preset

1. In your Cloudinary Dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Set the name to: `shiddit_uploads`
5. Set **Signing Mode** to: `Unsigned`
6. Click **Save**

## Step 4: Update Your .env.local File

Replace the placeholder values in your `.env.local` file with your actual Cloudinary credentials:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=shiddit_uploads
```

## Step 5: Restart Your Development Server

After updating the environment variables, restart your Next.js development server:

```bash
npm run dev
# or
yarn dev
```

## Step 6: Test Profile Picture Upload

1. Log in to your application
2. Go to your profile settings
3. Try uploading a profile picture
4. The upload should now work without the 401 Unauthorized error

## Troubleshooting

- **401 Unauthorized Error**: Make sure your Cloudinary credentials are correct
- **Upload Preset Not Found**: Ensure you created the `shiddit_uploads` preset with unsigned signing mode
- **Environment Variables Not Loading**: Restart your development server after making changes

## Security Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- Keep your API secret secure and don't share it publicly
