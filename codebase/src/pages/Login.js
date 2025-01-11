// src/pages/Login.js

import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { login } from './authService'; // Import the login function

const Login = () => {
  const handleLogin = (e) => {
    e.preventDefault();
    login(); // Call the login function to initiate Auth0 login
  };

  return (
    <div>
      <div className='container'>
        <div className='row d-flex justify-content-center'>
          <div className='col-md-5 box'>
            <div className='row d-flex justify-content-center' style={{ marginTop: '50px' }}>
              <h3 className='center primary monarque'> ResDex – Sign In</h3>
              <Button className='custom' onClick={handleLogin}>
                Sign In
              </Button>
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