// src/config/auth0Config.js
export const auth0Config = {
    spa: {
      domain: "dev-7t302exjqhg6x04w.us.auth0.com",
      clientId: "kcpmUlIuokOuZq8eJ2rbWuWFkrg3yAEz"  // New SPA client ID
    },
    m2m: {
      domain: "dev-7t302exjqhg6x04w.us.auth0.com",
      clientId: "iU7B8cMVVWKZKEibqOVj84yedzVRmyml",  // Your existing M2M client ID
      clientSecret: "your_m2m_client_secret"
    }
  };