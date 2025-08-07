// Firebase Authentication Configuration Script
// This script helps configure Firebase Auth settings

const firebaseConfig = {
  // Your Firebase config here
  apiKey: "AIzaSyApezZ6jDvIrw54cZs4ExF4AI2CclYs_K4",
  authDomain: "shiddit-d1ccb.firebaseapp.com",
  projectId: "shiddit-d1ccb",
  // ... other config
};

console.log(`
Firebase Authentication Configuration Guide:

1. EMAIL SENDER NAME:
   - Go to Firebase Console > Authentication > Templates
   - Click "Email verification" template
   - Change "Your shiddit-d1ccb team" to "Shiddit Team"
   - Save the changes

2. EMAIL DOMAIN:
   - Go to Firebase Console > Authentication > Settings
   - Under "Authorized domains", you can:
     a) Use the default: noreply@shiddit-d1ccb.firebaseapp.com
     b) Add your custom domain if you have one
     c) Configure a custom SMTP server for more control

3. CUSTOM SMTP (Optional):
   - In Authentication > Settings > SMTP
   - Configure your own SMTP server for custom email domain
   - This allows emails from your own domain (e.g., noreply@yoursite.com)

4. EMAIL TEMPLATES:
   - You can customize all email templates in Authentication > Templates
   - Available templates: Email verification, Password reset, Email change

Note: Some settings require Firebase Admin SDK or manual configuration in the console.
`);

module.exports = {
  firebaseConfig,
  emailSettings: {
    senderName: "Shiddit Team",
    defaultDomain: "noreply@shiddit-d1ccb.firebaseapp.com",
    templates: {
      emailVerification: {
        subject: "Verify your email address",
        senderName: "Shiddit Team"
      },
      passwordReset: {
        subject: "Reset your password",
        senderName: "Shiddit Team"
      }
    }
  }
};
