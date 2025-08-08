# Cloudinary Setup Guide

## Step 1: Create Cloudinary Account
1. Go to https://cloudinary.com
2. Sign up for a free account (no credit card required)
3. Get your credentials from the dashboard

## Step 2: Configure Environment Variables
Add these to your `.env.local` file:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=shiddit_uploads
```

## Step 3: Create Upload Preset
1. Go to your Cloudinary Dashboard
2. Navigate to Settings > Upload
3. Scroll down to "Upload presets"
4. Click "Add upload preset"
5. Set name to: `shiddit_uploads`
6. Set "Signing Mode" to: `Unsigned`
7. Save the preset

## Step 4: Test the Integration
1. Restart your development server
2. Try uploading a profile picture
3. Check that images are stored in Cloudinary

## Benefits of Cloudinary:
- ✅ No credit card required
- ✅ 25GB free storage
- ✅ Image optimization
- ✅ Automatic resizing
- ✅ CDN delivery
- ✅ Easy integration

## Free Tier Limits:
- 25GB storage
- 25GB bandwidth/month
- 25,000 transformations/month
- Perfect for profile pictures and community images!
