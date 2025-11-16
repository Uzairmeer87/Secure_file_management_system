import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user } = useAuth();
  return (
    <nav className="navbar">
      <Link to={user ? "/" : "/login"} className="navbar-title">Secure File Manager</Link>
      <div className="navbar-actions">
        {user ? (
          <Link to="/">Dashboard</Link>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
export default Navbar;
