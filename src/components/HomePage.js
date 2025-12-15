import React from 'react';
import { Link } from 'react-router-dom';
import { mem0Data } from '../data';
import './HomePage.css';

const HomePage = () => {
  // Projects for the sidebar
  const sidebarItems = [
    {
      id: 1,
      name: "AuraVote",
      logo: "/images/auravote-logo.png",
      isImage: true,
      url: "https://www.auravote.com/"
    },
    {
      id: 2,
      name: "No Signal",
      logo: "/images/no-signal-logo.png",
      isImage: true,
      logoClass: "nosignal-logo",
      url: "https://www.youtube.com/@nosignal1010"
    },
    {
      id: 3,
      name: "Weekly",
      logo: "/images/weekly-logo.png",
      isImage: true,
      logoClass: "weekly-logo",
      url: "https://open.spotify.com/playlist/0pOb7h66pxfx2tHR1HTdfI"
    },
    {
      id: 4,
      name: "Streaming",
      logo: "/images/Live.png",
      isImage: true,
      url: "https://linktr.ee/mem0cypher"
    },
    {
      id: 5,
      name: "Echospeak",
      logo: "/images/echospeak-logo.png",
      isImage: true,
      comingSoon: true,
      url: "#"
    }
  ];

  // Get the content data
  const contentData = mem0Data;

  return (
    <div className="database-layout">
      {/* Sidebar with project logos */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Projects</h2>
        </div>
        <div className="project-list">
          {sidebarItems.map(item => (
            <div 
              key={item.id} 
              className={`project-item ${item.comingSoon ? 'coming-soon' : ''}`}
            >
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={item.comingSoon ? (e) => e.preventDefault() : null}
                style={{ pointerEvents: item.comingSoon ? 'none' : 'auto' }}
              >
                <div className="project-logo-container">
                  {item.isImage ? (
                    <img src={item.logo} alt={item.name} className={`project-logo-img ${item.logoClass || ''}`} />
                  ) : (
                    <div className="project-logo">{item.logo}</div>
                  )}
                </div>
                <div className="project-name">{item.name}</div>
              </a>
              {item.comingSoon && <div className="coming-soon-indicator">Coming Soon</div>}
            </div>
          ))}
        </div>
      </div>
      
      {/* Main content - Database of thoughts */}
      <div className="main-content">
        <div className="database-header">
          <h1>database</h1>
        </div>
        
        {/* Database layout */}
        <div className="thought-list">
          {contentData.map((item, index) => (
            <Link to={`/database/${item.id}`} key={item.id} className="thought-item">
              <div className="thought-row-number">{String(index + 1).padStart(3, '0')}</div>
              <div className="thought-date">{item.date}</div>
              <div className="thought-title">{item.title}</div>
              <div className="thought-type">{item.type}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage; 