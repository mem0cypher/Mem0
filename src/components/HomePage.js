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
      url: "https://www.youtube.com/@WeeklySound"
    },
    {
      id: 4,
      name: "Simulichat",
      logo: "/images/simulichat-logo.png",
      isImage: true,
      logoClass: "simulichat-logo",
      url: "https://github.com/mem0cypher/SimulChat"
    },
    {
      id: 7,
      name: "Echospeak",
      logo: "/images/echospeak-logo.png",
      isImage: true,
      logoClass: "echospeak-logo",
      comingSoon: true
    },
    {
      id: 5,
      name: "Slopshooter",
      logo: "/images/slopshooter-logo.png",
      isImage: true,
      logoClass: "slopshooter-logo",
      comingSoon: true
    },
    {
      id: 6,
      name: "Pixelpunks",
      logo: "/images/pixelpunks-logo.webp",
      isImage: true,
      logoClass: "pixelpunks-logo",
      comingSoon: true
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
                href={item.comingSoon ? '#' : item.url} 
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