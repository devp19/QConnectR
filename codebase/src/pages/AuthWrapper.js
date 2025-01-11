import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const AuthWrapper = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Navigate to the user's profile page
      const username = user.nickname || user.email.split('@')[0];
      navigate(`/profile/${username}`);
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  return <>{children}</>;
};

export default AuthWrapper;