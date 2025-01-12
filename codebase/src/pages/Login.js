// src/pages/Login.js
import React, { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Logo from '../images/faviconpls.png';

const Login = () => {
  const { loginWithRedirect, isAuthenticated, user, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      console.log('User is authenticated, redirecting to profile');
      const username = user.user_metadata?.display_name || user.nickname || user.email.split('@')[0];
      navigate(`/profile/${username}`);
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  const handleLogin = () => {
    loginWithRedirect();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className='container'>
        <div className='row d-flex justify-content-center'>
          <div className='col-md-5 box'>
            <div className='row d-flex justify-content-center' style={{ marginTop: '50px' }}>
              <h3 className='center primary monarque'>QonnectR – Sign In</h3>
              <img src={Logo} alt='QonnectR Logo' className='center' id='img-login'></img>
            </div>
            <div className='row d-flex justify-content-center'>
              {!isAuthenticated && (
                <a className='custom-view text-center' style={{maxWidth: '200px'}} onClick={handleLogin}>
                  Sign In
                </a>
              )}
              <p className='primary text-center'>
                <br />
                Don't have an account? <Link className='primary' to='/signup'>Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;