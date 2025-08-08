# 🛡️ Shiddit Admin Setup Guide

## 📋 Overview

This guide will help you set up the admin system for your Shiddit website. The admin panel provides comprehensive user management, content moderation, and site administration capabilities.

## 🔐 Admin Credentials

**Default Admin Account:**
- **Email:** `admin@shiddit.com`
- **Password:** `AdminShiddit2025!`
- **Username:** `ShidditAdmin`

⚠️ **IMPORTANT:** Change these credentials immediately after setup for security!

## 🚀 Setup Instructions

### 1. Firebase Configuration

Your Firebase project is already configured with the following settings:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyApezZ6jDvIrw54cZs4ExF4AI2CclYs_K4",
  authDomain: "shiddit-d1ccb.firebaseapp.com",
  databaseURL: "https://shiddit-d1ccb-default-rtdb.firebaseio.com",
  projectId: "shiddit-d1ccb",
  storageBucket: "shiddit-d1ccb.firebasestorage.app",
  messagingSenderId: "929483961055",
  appId: "1:929483961055:web:37abdd1638117d8a1eaf6a",
  measurementId: "G-R4W9HDBFCE"
}
```

### 2. Create Admin User

Run the admin setup script to create the admin user:

```bash
# Navigate to your project directory
cd app-shiddit

# Run the admin setup script
node scripts/setup-admin.js
```

This script will:
- Create the admin user in Firebase Authentication
- Create the admin user document in Firestore
- Set the `isAdmin: true` flag
- Provide you with the admin credentials

### 3. Access Admin Panel

Once the admin user is created:

1. **Log in** with the admin credentials
2. **Navigate** to `/admin` in your browser
3. **Verify** you have admin access

## 🛠️ Admin Features

### User Management
- **View All Users:** See all registered users with their details
- **Search Users:** Search by username or email
- **User Details:** View comprehensive user information
- **Ban Users:** Ban users with custom reasons
- **Unban Users:** Restore banned user accounts

### Content Moderation
- **Delete Posts:** Remove inappropriate posts
- **Delete Comments:** Remove inappropriate comments
- **Bulk Operations:** Delete all user content when banning

### Voting System (NEW!)
- **Admin Voting Modifier:** Admins can add multiple votes (1-100) to any post
- **Vote Removal:** Remove all admin votes from posts
- **Instant Updates:** Score changes are reflected immediately
- **Settings Panel:** Configure voting behavior in the admin panel

### Community Management
- **Member Count Inflation:** Modify community member counts directly
- **Real-time Updates:** Changes are saved immediately
- **Bulk Operations:** Manage multiple communities efficiently

### Admin Panel Sections

#### 1. Users Tab
- List of all registered users
- User status (Active, Banned, Admin)
- Karma information
- Quick actions (View Details, Ban)

#### 2. Banned Users Tab
- List of all banned users
- Ban reasons and dates
- Unban functionality

#### 3. Posts Tab
- Recent posts with details
- Post statistics (likes, comments)
- Delete functionality

#### 4. Comments Tab
- Recent comments with content
- Author information
- Delete functionality

#### 5. Communities Tab (ENHANCED!)
- List of all communities
- **Member count editing with save button**
- **Real-time member count updates**
- Community deletion

#### 6. Voting Settings Tab (NEW!)
- **Admin voting instructions**
- **Community inflation guide**
- **Feature documentation**

## 🎯 How to Use Admin Voting

### Step 1: Access Admin Voting
1. Log in as an admin user
2. Navigate to any post in the feed
3. Look for the settings icon (⚙️) next to the vote buttons

### Step 2: Use Admin Controls
1. Click the settings icon to open admin controls
2. Set the number of votes you want to add (1-100)
3. Click "+X" to add upvotes or "-X" to add downvotes
4. Use "Remove All Votes" to clear admin votes

### Step 3: Verify Changes
- Score updates are immediate
- Changes are permanent in the database
- Only admins can see and use these controls

## 🏘️ How to Use Community Member Inflation

### Step 1: Access Community Management
1. Go to the Admin Panel
2. Click on the "Communities" tab
3. Find the community you want to modify

### Step 2: Modify Member Count
1. Click on the member count number
2. Enter the new member count
3. Click "Save" or press Enter
4. The change is applied immediately

### Step 3: Verify Changes
- Member count updates are instant
- Changes are reflected across the site
- No need to refresh the page

## 🔒 Security Features

### User Banning System
When a user is banned:
- ✅ User cannot log in
- ✅ All user posts are deleted
- ✅ All user comments are deleted
- ✅ All user messages are deleted
- ✅ All user favorites are deleted
- ✅ User profile is marked as banned

### Admin Protection
- Only users with `isAdmin: true` can access `/admin`
- Admin status is verified on every admin action
- All admin actions are logged with admin ID

### Voting Security
- Only admin users can use voting modifiers
- Admin votes are tracked and logged
- Vote removal is available for moderation

## 📊 Database Structure

### Users Collection
```javascript
{
  id: "user_id",
  email: "user@example.com",
  username: "username",
  isAdmin: false,           // Admin flag
  isBanned: false,          // Ban status
  banReason: "string",      // Ban reason
  bannedAt: timestamp,      // Ban date
  bannedBy: "admin_id",     // Admin who banned
  postKarma: 0,
  commentKarma: 0,
  totalKarma: 0,
  createdAt: timestamp,
  lastActive: timestamp
}
```

### Posts Collection
```javascript
{
  id: "post_id",
  title: "Post Title",
  authorId: "user_id",
  authorUsername: "username",
  content: "Post content",
  createdAt: timestamp,
  likes: 0,
  comments: 0,
  upvotes: ["user_id1", "user_id2"],    // Array of user IDs who upvoted
  downvotes: ["user_id3"],              // Array of user IDs who downvoted
  score: 1                              // Calculated score (upvotes - downvotes)
}
```

### Comments Collection
```javascript
{
  id: "comment_id",
  content: "Comment content",
  authorId: "user_id",
  authorUsername: "username",
  postId: "post_id",
  createdAt: timestamp,
  upvotes: ["user_id1"],
  downvotes: [],
  score: 1
}
```

### Communities Collection
```javascript
{
  id: "community_id",
  name: "community_name",
  displayName: "Community Display Name",
  description: "Community description",
  creatorId: "user_id",
  creatorUsername: "username",
  createdAt: timestamp,
  memberCount: 150,         // Can be modified by admins
  postCount: 25,
  type: "public",
  nsfw: false
}
```

## 🚨 Important Security Notes

### 1. Change Default Credentials
After setup, immediately change the admin password:
1. Log in as admin
2. Go to Settings
3. Change password to a strong, unique password

### 2. Admin Access Control
- Only trusted individuals should have admin access
- Regularly review admin user list
- Monitor admin actions for suspicious activity

### 3. Voting Moderation
- Use admin voting responsibly
- Monitor for abuse of voting powers
- Keep logs of admin voting actions

### 4. Backup Strategy
- Regularly backup your Firestore database
- Keep admin credentials secure
- Document all admin actions

## 🔧 Troubleshooting

### Admin Panel Not Accessible
1. Verify admin user exists in Firebase Auth
2. Check Firestore for admin user document
3. Ensure `isAdmin: true` flag is set
4. Clear browser cache and cookies

### Ban System Not Working
1. Check Firestore security rules
2. Verify admin permissions
3. Check browser console for errors
4. Ensure all collections exist

### Voting Modifier Not Working
1. Verify user has admin privileges
2. Check browser console for errors
3. Ensure post exists in database
4. Check Firestore security rules

### Community Inflation Not Working
1. Verify admin permissions
2. Check if save button is clicked
3. Look for console errors
4. Ensure community document exists

### Script Errors
1. Verify Firebase configuration
2. Check network connectivity
3. Ensure Firebase project is active
4. Verify API keys are correct

## 📞 Support

If you encounter issues:

1. **Check Firebase Console** for errors
2. **Review browser console** for JavaScript errors
3. **Verify Firestore rules** allow admin operations
4. **Test with a fresh admin account**

## 🔄 Maintenance

### Regular Tasks
- [ ] Review banned users monthly
- [ ] Monitor admin actions
- [ ] Update admin credentials quarterly
- [ ] Backup database weekly
- [ ] Review security logs
- [ ] Monitor admin voting patterns
- [ ] Check community member counts

### Updates
- Keep Firebase SDK updated
- Monitor for security patches
- Update admin panel features as needed

---

## 🎯 Quick Start Checklist

- [ ] Run admin setup script
- [ ] Log in with admin credentials
- [ ] Access `/admin` panel
- [ ] Test user banning functionality
- [ ] Test post/comment deletion
- [ ] **Test admin voting modifier**
- [ ] **Test community member inflation**
- [ ] Change default admin password
- [ ] Set up backup strategy
- [ ] Document admin procedures

Your admin system is now ready for production use! 🚀

## 🆕 Recent Updates

### Voting Modifier Fix (Latest)
- ✅ Admin voting now works properly
- ✅ Multiple votes can be added (1-100)
- ✅ Vote removal functionality added
- ✅ Real-time score updates
- ✅ Admin-only access controls

### Community Inflation Fix (Latest)
- ✅ Member count editing with save button
- ✅ Real-time updates across the site
- ✅ Enter key support for quick saves
- ✅ Visual feedback for changes
- ✅ Proper error handling

Both features are now fully functional and ready for use!
