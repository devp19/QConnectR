// src/authService.js
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Add debounce function to prevent rapid navigation
let navigationTimeout = null;
const debounceNavigation = (navigate, path) => {
  if (navigationTimeout) {
    clearTimeout(navigationTimeout);
  }
  navigationTimeout = setTimeout(() => {
    navigate(path);
  }, 100);
};

export const handleAuthentication = async (user, isAuthenticated, navigate) => {
  if (isAuthenticated && user) {
    try {
      // Extract user ID from Auth0 user
      const userId = user.sub;
      console.log('Authenticating user:', userId);

      // Fetch user data from Firestore
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const displayName = userData.displayName;

        console.log('User signed in successfully:', displayName);
        // Use debounced navigation
        debounceNavigation(navigate, `/profile/${displayName}`);
      } else {
        console.error('No user data found in Firestore');
        debounceNavigation(navigate, '/');
      }
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error);
      debounceNavigation(navigate, '/');
    }
  }
};