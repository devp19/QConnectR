// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-7t302exjqhg6x04w.us.auth0.com"
      clientId="kcpmUlIuokOuZq8eJ2rbWuWFkrg3yAEz"  // Replace with your SPA client ID
      authorizationParams={{
        redirect_uri: "https://qonnectr.vercel.app",
        scope: "openid profile email"
      }}
      cacheLocation="localstorage"
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);

reportWebVitals();