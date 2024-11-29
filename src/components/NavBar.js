import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          WHOU
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Events</Link>
          </li>
          <li className="nav-item">
            <Link to="/crew" className="nav-link">Crew</Link>
          </li>
          <li className="nav-item">
            <Link to="/organizations" className="nav-link">Organizations</Link>
          </li>
          <li className="nav-item">
            <Link to="/rates" className="nav-link">Rates</Link>
          </li>
          <li className="nav-item">
            <Link to="/seasons" className="nav-link">Seasons</Link>
          </li>
          <li className="nav-item">
            <Link to="/import" className="nav-link">Import</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default NavBar; 