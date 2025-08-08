# Database Setup Guide

This guide will help you set up the Firebase database for the Shiddit application.

## Prerequisites

1. Node.js installed on your system
2. Firebase CLI installed: `npm install -g firebase-tools`
3. Access to the Firebase project

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Database Setup Script

```bash
node scripts/setup-database.js
```

This script will:
- Check for existing communities and create sample ones if none exist
- Check for existing users
- Create sample posts if none exist
- Provide next steps for deployment

### 3. Deploy Firebase Configuration

#### Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

#### Deploy Storage Rules
```bash
firebase deploy --only storage
```

#### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 4. Verify Setup

After deployment, you should be able to:
- Create communities
- Upload profile pictures
- Create posts
- Use the premium payment system

## Database Structure

### Collections

#### users
- `id`: User ID (from Firebase Auth)
- `username`: Unique username
- `email`: User's email
- `bio`: User biography
- `profilePicture`: URL to profile picture
- `createdAt`: Account creation date
- `postKarma`: Karma from posts
- `commentKarma`: Karma from comments
- `totalKarma`: Total karma
- `isAdmin`: Admin status
- `isPremium`: Premium verification status
- `waitingForPayment`: Payment pending status
- `senderAddress`: Wallet address for payments


#### communities
- `id`: Community ID
- `name`: Community name (unique)
- `displayName`: Display name
- `description`: Community description
- `creatorId`: Creator's user ID
- `creatorUsername`: Creator's username
- `createdAt`: Creation date
- `memberCount`: Number of members
- `postCount`: Number of posts
- `type`: Community type (public/restricted/private)
- `nsfw`: NSFW flag
- `imageUrl`: Community image URL

#### posts
- `id`: Post ID
- `title`: Post title
- `content`: Post content
- `authorId`: Author's user ID
- `authorUsername`: Author's username
- `communityId`: Community ID
- `communityName`: Community name
- `score`: Post score
- `upvotes`: Array of user IDs who upvoted
- `downvotes`: Array of user IDs who downvoted
- `commentCount`: Number of comments
- `type`: Post type (text/image/video/link/poll)
- `createdAt`: Creation date

#### communityMembers
- `id`: Membership ID
- `communityId`: Community ID
- `userId`: User ID
- `username`: Username
- `joinedAt`: Join date
- `role`: Member role (creator/member)

## Troubleshooting

### Profile Picture Upload Issues
- Ensure Firebase Storage is properly configured
- Check storage rules allow user uploads
- Verify the storage bucket is accessible

### Community Creation Issues
- Check if community name already exists (case-insensitive)
- Ensure user has permission to create communities
- Verify Firestore rules allow community creation

### Premium Payment Issues
- Check if user is authenticated
- Verify the payment address is correct
- Ensure Firestore rules allow user updates

### Communities Not Displaying
- Check if communities collection exists
- Verify Firestore indexes are deployed
- Check browser console for errors

## Security Rules

The application uses the following security rules:

### Firestore Rules
- Users can read all public data
- Users can only write to their own user document
- Community creators can modify their communities
- Authenticated users can create posts and comments

### Storage Rules
- Users can upload their own profile pictures
- Users can upload post images
- Users can upload community images
- All images are publicly readable

## Monitoring

Monitor the application using:
- Firebase Console
- Browser developer tools
- Application logs

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Firebase configuration
3. Check Firestore rules and indexes
4. Ensure all dependencies are installed
