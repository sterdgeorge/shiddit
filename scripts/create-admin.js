const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Your Firebase config (copy from lib/firebase.ts)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_CREDENTIALS = {
  EMAIL: 'admin@shiddit.com',
  PASSWORD: 'admin123',
  USERNAME: 'admin',
};

async function createAdminUser() {
  try {
    console.log('Attempting to create admin user...');
    
    // Try to create the admin user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      ADMIN_CREDENTIALS.EMAIL, 
      ADMIN_CREDENTIALS.PASSWORD
    );
    
    const user = userCredential.user;
    console.log('Admin user created successfully:', user.uid);
    
    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: user.email,
      username: ADMIN_CREDENTIALS.USERNAME,
      displayName: ADMIN_CREDENTIALS.USERNAME,
      bio: '',
      avatar: '',
      createdAt: serverTimestamp(),
      friends: [],
      isAdmin: true,
      postKarma: 0,
      commentKarma: 0,
      totalKarma: 0,
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    await setDoc(doc(db, 'usernames', ADMIN_CREDENTIALS.USERNAME), { uid: user.uid });
    
    console.log('Admin user profile created in Firestore');
    console.log('Admin credentials:');
    console.log('Email:', ADMIN_CREDENTIALS.EMAIL);
    console.log('Password:', ADMIN_CREDENTIALS.PASSWORD);
    console.log('Username:', ADMIN_CREDENTIALS.USERNAME);
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists. Attempting to sign in...');
      
      try {
        const signInResult = await signInWithEmailAndPassword(
          auth, 
          ADMIN_CREDENTIALS.EMAIL, 
          ADMIN_CREDENTIALS.PASSWORD
        );
        console.log('Admin user signed in successfully');
        
        // Update admin status
        await setDoc(doc(db, 'users', signInResult.user.uid), {
          isAdmin: true
        }, { merge: true });
        
        console.log('Admin status updated');
      } catch (signInError) {
        console.error('Failed to sign in admin user:', signInError.message);
        console.log('The admin user exists but the password is different.');
        console.log('You may need to reset the password in Firebase Console.');
      }
    } else {
      console.error('Error creating admin user:', error.message);
    }
  }
}

// Run the script
createAdminUser().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 