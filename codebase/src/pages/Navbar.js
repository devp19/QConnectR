import React from 'react';
import { NavLink } from 'react-router-dom';
import NavbarLogo from '../images/logo-icon.png';
import { useAuth0 } from '@auth0/auth0-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth0();

  console.log('isAuthenticated:', isAuthenticated);
  console.log('user:', user);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      logout({ returnTo: window.location.origin });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light pt-4">
      <NavLink className="navbar-brand" to="/">
        <img id="navbar-logo" className="img-fluid" src={NavbarLogo} alt="ResDex Logo" />
      </NavLink>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <NavLink exact to="/" className="nav-link" activeClassName="active">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-house-door-fill" viewBox="0 0 16 16">
                <path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5"/>
              </svg>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink exact to="/search" className="nav-link" activeClassName="active">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
              </svg>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink exact to="/notifications" className="nav-link" activeClassName="active">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-bell-fill" viewBox="0 0 16 16">
                <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2m.995-14.901a1 1 0 1 0-1.99 0A5 5 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901"/>
              </svg>
            </NavLink>
          </li>
          {isAuthenticated && user && (
            <li className="nav-item">
              <NavLink to={`/profile/${user.nickname || user.email.split('@')[0]}`} className="nav-link" activeClassName="active">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-person-circle" viewBox="0 0 16 16">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                  <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                </svg>
              </NavLink>
            </li>
          )}
          <li className="nav-item">
            {isAuthenticated ? (
              <NavLink to="/login" className="nav-link" onClick={handleLogout}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                  <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                </svg>
              </NavLink>
            ) : (
              <NavLink to="/login" className="nav-link" activeClassName="active">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="primary" className="bi bi-box-arrow-in-right" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"/>
                  <path fillRule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                </svg>
              </NavLink>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;