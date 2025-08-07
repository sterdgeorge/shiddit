const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Your Firebase config
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
const db = getFirestore(app);

const samplePosts = [
  {
    title: "Welcome to Shiddit",
    content: "Welcome to our new social platform. You can create posts, vote on them, and join communities. The voting system works with upvotes and downvotes to determine post visibility.",
    authorId: "admin",
    authorUsername: "admin",
    communityId: "general",
    communityName: "general",
    score: 15,
    upvotes: ["user1", "user2", "user3", "user4", "user5"],
    downvotes: [],
    commentCount: 3,
    type: "text",
    createdAt: serverTimestamp(),
  },
  {
    title: "Dark Mode Now Default",
    content: "We've implemented dark mode as the default theme for improved user experience. Light mode is still available as an option. Please share your feedback on the new design.",
    authorId: "admin",
    authorUsername: "admin",
    communityId: "general",
    communityName: "general",
    score: 8,
    upvotes: ["user1", "user2", "user3"],
    downvotes: ["user4"],
    commentCount: 2,
    type: "text",
    createdAt: serverTimestamp(),
  },
  {
    title: "Voting System Implementation",
    content: "The voting system is now fully operational. Users can upvote and downvote posts, and karma will be tracked accordingly. Posts with higher scores will receive greater visibility in the feed.",
    authorId: "admin",
    authorUsername: "admin",
    communityId: "general",
    communityName: "general",
    score: 12,
    upvotes: ["user1", "user2", "user3", "user4"],
    downvotes: [],
    commentCount: 1,
    type: "text",
    createdAt: serverTimestamp(),
  },
  {
    title: "Leaderboard Feature Available",
    content: "The leaderboard displays top posts based on their score. Posts with the highest upvotes will be featured. Create quality content to reach the top of the leaderboard.",
    authorId: "admin",
    authorUsername: "admin",
    communityId: "general",
    communityName: "general",
    score: 20,
    upvotes: ["user1", "user2", "user3", "user4", "user5", "user6"],
    downvotes: ["user7"],
    commentCount: 4,
    type: "text",
    createdAt: serverTimestamp(),
  },
  {
    title: "Feed Sorting Options",
    content: "Multiple feed sorting options are now available: Hot, New, and Rising. Each option presents posts in different orders based on factors such as score, time, and user engagement.",
    authorId: "admin",
    authorUsername: "admin",
    communityId: "general",
    communityName: "general",
    score: 6,
    upvotes: ["user1", "user2"],
    downvotes: [],
    commentCount: 0,
    type: "text",
    createdAt: serverTimestamp(),
  }
];

async function createSamplePosts() {
  try {
    console.log('Creating sample posts...');
    
    for (const post of samplePosts) {
      await addDoc(collection(db, 'posts'), post);
      console.log(`Created post: ${post.title}`);
    }
    
    console.log('All sample posts created successfully!');
    console.log('You can now see the voting system in action.');
    
  } catch (error) {
    console.error('Error creating sample posts:', error);
  }
}

// Run the script
createSamplePosts().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 