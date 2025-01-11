// src/authService.js

import auth0 from 'auth0-js';
import { db } from '../firebaseConfig'; // Ensure you have Firebase configured
import { doc, getDoc } from 'firebase/firestore';

const auth0Client = new auth0.WebAuth({
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
  redirectUri: window.location.origin,
  responseType: 'token id_token',
  scope: 'openid profile email',
});

export const login = () => {
  auth0Client.authorize();
};

export const handleAuthentication = async (navigate) => {
  auth0Client.parseHash(async (err, authResult) => {
    if (authResult && authResult.accessToken && authResult.idToken) {
      setSession(authResult);

      // Extract user ID from authResult
      const userId = authResult.idTokenPayload.sub;

      try {
        // Fetch user data from Firestore
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const displayName = userData.displayName;

          console.log('User signed in successfully');
          navigate(`/profile/${displayName}`); // Navigate to the user's profile page
        } else {
          console.error('No user data found in Firestore');
          navigate('/'); // Redirect to home or error page
        }
      } catch (error) {
        console.error('Error fetching user data from Firestore:', error);
        navigate('/'); // Redirect to home or error page
      }
    } else if (err) {
      console.error('Error during authentication:', err);
      navigate('/'); // Optionally redirect to home or error page
    }
  });
};

const setSession = (authResult) => {
  const expiresAt = JSON.stringify(
    authResult.expiresIn * 1000 + new Date().getTime()
  );
  localStorage.setItem('accessToken', authResult.accessToken);
  localStorage.setItem('idToken', authResult.idToken);
  localStorage.setItem('expiresAt', expiresAt);
};