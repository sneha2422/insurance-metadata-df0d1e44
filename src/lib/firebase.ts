import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBl7K4bqBPGT6E7dj5XhVSVdYXcZqF5Tqo",
  authDomain: "insurance-metadata-catalog.firebaseapp.com",
  projectId: "insurance-metadata-catalog",
  storageBucket: "insurance-metadata-catalog.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize authentication
export const initializeAuth = async () => {
  try {
    // Try to use __initial_auth_token if available
    const initialToken = (window as any).__initial_auth_token;
    
    if (!initialToken) {
      // Sign in anonymously if no token is available
      const result = await signInAnonymously(auth);
      return result.user;
    }
    
    return auth.currentUser;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};
