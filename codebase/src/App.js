// src/App.js

import React, { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
import { handleAuthentication } from './pages/authService';

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    handleAuthentication(navigate);
  }, [navigate]);

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
          <Route path="/success" element={<Success />} />
          <Route path="/create" element={<Create />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/releasedocs" element={<ReleaseDocs />} />
          <Route path="/releasedocs/v101" element={<V101 />} />
          <Route path="/profile/:username" element={<Profile />} />
        </Routes>
        <Footer />
      </AuthWrapper>
    </div>
  );
}

export default App;