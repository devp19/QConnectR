// src/App.js
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
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
import Create from './pages/Create';
import Recovery from './pages/recovery';
import Success from './pages/Success';
import ReleaseDocs from './pages/ReleaseDocs';
import V101 from './Releases/V101';
import Notifications from './pages/Notifications';
import AuthStatus from './pages/AuthStatus';
import ProtectedRoute from './pages/ProtectedRoute';

// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/recovery" element={<Recovery />} />
        <Route path="/team" element={<Team />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/search" element={<Search />} />
        <Route path="/success" element={<Success />} />
        <Route path="/releasedocs" element={<ReleaseDocs />} />
        <Route path="/releasedocs/v101" element={<V101 />} />
        <Route path="/test" element={<AuthStatus />} />

        {/* Protected routes */}
        <Route
          path="/profile/:username"
          element={
              <Profile />
          }
        />
        <Route
          path="/create"
          element={
              <Create />
          }
        />
        <Route
          path="/notifications"
          element={
              <Notifications />
          }
        />
        {/* Add other protected routes similarly */}
      </Routes>
      <Footer />
    </div>
  );
}

export default App;