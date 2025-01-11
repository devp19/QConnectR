import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const Login = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  const handleLogin = async () => {
    try {
      await loginWithRedirect({
        appState: {
          returnTo: "/profile"
        },
        prompt: "login"
      });
    } catch (error) {
      console.error("Login error:", error);
    }
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
              <h3 className='center primary monarque'> ResDex – Sign In</h3>
              {!isAuthenticated && (
                <Button className='custom' onClick={handleLogin}>
                  Sign In
                </Button>
              )}
              <p className='primary'>
                <br></br>
                Don't have an account? <Link className='primary' to="/signup">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;