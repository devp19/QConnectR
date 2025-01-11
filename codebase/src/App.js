// src/App.js
import React, { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Home from './pages/Home';
import About from './pages/About';
import Navbar from './pages/Navbar';
import Login from './pages/Login';
import Footer from './pages/Footer';
import Team from './pages/Team';
import Contact from './pages/Contact';
import Search from './pages/Search';
import Signup from './pages/signup';
import Profile from './pages/Profile';
import AuthWrapper from './pages/AuthWrapper';
import Create from './pages/Create';
import Recovery from './pages/recovery';
import Success from './pages/Success';
import ReleaseDocs from './pages/ReleaseDocs';
import V101 from './Releases/V101';
import Notifications from './pages/Notifications';
import AuthStatus from './pages/AuthStatus';
import { handleAuthentication } from './pages/authService';

// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth0();

  useEffect(() => {
    // Only handle authentication when loading is complete and user is authenticated
    if (!isLoading && isAuthenticated && user) {
      console.log('Handling authentication for user:', user);
      handleAuthentication(user, isAuthenticated, navigate);
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Show loading state while Auth0 is initializing
  if (isLoading) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <ScrollToTop />
      <AuthWrapper>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/search" element={<Search />} />
          <Route path="/test" element={<AuthStatus />} />
          <Route path="/success" element={<Success />} />
          <Route path="/create" element={<Create />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/releasedocs" element={<ReleaseDocs />} />
          <Route path="/releasedocs/v101" element={<V101 />} />
          <Route path="/profile/:username" element={<Profile />} />
        </Routes>
        <Footer />
      </AuthWrapper>
      {/* Optional: Add debug information during development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          right: 0, 
          background: '#f0f0f0', 
          padding: '10px', 
          fontSize: '12px' 
        }}>
          <div>isLoading: {isLoading.toString()}</div>
          <div>isAuthenticated: {isAuthenticated.toString()}</div>
          <div>User: {user ? user.email : 'none'}</div>
        </div>
      )}
    </div>
  );
}

export default App;

// Optional: Add some basic loading styles
const styles = `
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);