import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">mem0</div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/database">Database</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header; 