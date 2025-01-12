import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthStatus = () => {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();

  return (
    <div>
      <h2>Authentication Status</h2>
      <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      {user && <p>User: {user.name}</p>}
      {!isAuthenticated ? (
        <button onClick={() => loginWithRedirect()}>Log In</button>
      ) : (
        <button onClick={() => logout({ returnTo: 'https://qonnectr.vercel.app'})}>Log Out</button>
      )}
    </div>
  );
};

export default AuthStatus;