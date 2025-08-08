# Shiddit - Reddit-style Social Platform

A modern, Reddit-style social media platform built with Next.js 13+, TypeScript, TailwindCSS, and Firebase.

## Features

### 🧠 Core Features
- **Feed Page** - Browse posts from all communities
- **Dynamic Community Pages** - `/s/[community]` for community-specific content
- **Leaderboard** - Top 10 most liked posts at `/leaderboard`
- **User Authentication** - Email/password with Firebase Auth

- **Post Creation** - Create posts with title, content, and community selection
- **Community Creation** - Create new communities with custom names and descriptions
- **User Profiles** - Public profiles at `/user/[username]`
- **Settings Page** - Dark/light mode toggle and profile management

### 🎨 UI/UX Features
- **Dark/Light Mode** - Toggle between themes with persistent storage
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, Reddit-inspired interface with TailwindCSS
- **Loading States** - Smooth loading indicators throughout the app
- **Error Handling** - User-friendly error messages and fallbacks

### 🔒 Security & Authentication
- **Route Protection** - Middleware-based authentication guards
- **Firebase Security Rules** - Server-side data validation
- **Guest Restrictions** - Guests can browse but cannot interact
- **Username Uniqueness** - Unique usernames enforced at registration

## Tech Stack

- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Icons**: Lucide React
- **State Management**: React Context + Hooks
- **Deployment**: Vercel-ready

## Project Structure

```
app-shiddit/
├── app/                          # Next.js App Router pages
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage (feed)
│   ├── login/                   # Authentication pages
│   ├── register/
│   ├── leaderboard/             # Top posts

│   ├── settings/                # User settings
│   ├── create-post/             # Post creation
│   ├── create-community/        # Community creation
│   ├── s/[community]/           # Dynamic community pages
│   └── user/[username]/         # Dynamic user profiles
├── components/                   # Reusable components
│   ├── providers/               # Context providers
│   ├── layout/                  # Layout components
│   ├── feed/                    # Feed-related components
│   └── ui/                      # UI components
├── lib/                         # Utilities and configurations
│   ├── firebase.ts             # Firebase configuration
│   ├── auth.ts                 # Authentication utilities
│   └── utils.ts                # General utilities
├── middleware.ts                # Route protection
├── tailwind.config.ts          # TailwindCSS configuration
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd app-shiddit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Storage (optional, for future image uploads)

4. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   ```

5. **Set up Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read their own profile and public user profiles
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Usernames are public for lookup
       match /usernames/{username} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       
       // Posts are public to read, authenticated users can create
       match /posts/{postId} {
         allow read: if true;
         allow create: if request.auth != null;
         allow update: if request.auth != null && 
           resource.data.authorId == request.auth.uid;
       }
       
       // Communities are public to read, authenticated users can create
       match /communities/{communityId} {
         allow read: if true;
         allow create: if request.auth != null;
       }
       
       // Community names for uniqueness
       match /communityNames/{name} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       

     }
   }
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### For Users
1. **Register** - Create an account with email, password, and unique username
2. **Browse** - View the feed, explore communities, and check the leaderboard
3. **Interact** - Like posts, create posts, and join conversations
4. **Connect** - Join communities and interact with other users
5. **Customize** - Toggle themes and update your profile

### For Developers
- **Add Features** - Extend the platform with new functionality
- **Customize Styling** - Modify TailwindCSS classes and components
- **Enhance Security** - Add more Firebase security rules as needed
- **Deploy** - Deploy to Vercel or your preferred hosting platform

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
The app is compatible with any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the Firebase console for authentication and database issues
2. Verify your environment variables are correctly set
3. Ensure Firestore security rules are properly configured
4. Check the browser console for any JavaScript errors

## Future Enhancements

- [ ] Image upload functionality
- [ ] Comment system on posts
- [ ] User following/friends system
- [ ] Community moderation tools
- [ ] Search functionality
- [ ] Notifications system
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] API endpoints for external integrations 