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
  comments: 0
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
  createdAt: timestamp
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

### 3. Backup Strategy
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
- [ ] Change default admin password
- [ ] Set up backup strategy
- [ ] Document admin procedures

Your admin system is now ready for production use! 🚀
