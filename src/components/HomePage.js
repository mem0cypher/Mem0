import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { mem0Data } from '../data';
import './HomePage.css';

const HomePage = () => {
  const [sortOrder, setSortOrder] = useState('newest');
  const [showStreamingModal, setShowStreamingModal] = useState(false);

  const kickUrl = 'https://kick.com/mem0cypher';
  const twitchUrl = 'https://www.twitch.tv/mem0cypher';

  useEffect(() => {
    if (!showStreamingModal) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowStreamingModal(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showStreamingModal]);

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
      name: "GitHub",
      logo: "/images/githublogo.png",
      isImage: true,
      url: "https://github.com/mem0cypher"
    },
    {
      id: 5,
      name: "Streaming",
      logo: "/images/Live.png",
      isImage: true,
      url: "https://linktr.ee/mem0cypher",
      openStreamingModal: true
    },
    {
      id: 6,
      name: "Echospeak",
      logo: "/images/echospeak-logo.png",
      isImage: true,
      comingSoon: true,
      url: "#"
    }
  ];

  // Get the content data
  const contentData = useMemo(() => {
    const copy = [...mem0Data];
    copy.sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();

      if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;

      return sortOrder === 'oldest' ? aTime - bTime : bTime - aTime;
    });
    return copy;
  }, [sortOrder]);

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
                onClick={(e) => {
                  if (item.comingSoon) {
                    e.preventDefault();
                    return;
                  }

                  if (item.openStreamingModal) {
                    e.preventDefault();
                    setShowStreamingModal(true);
                  }
                }}
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

      {showStreamingModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setShowStreamingModal(false)}
        >
          <div
            className="modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title">Choose a platform</div>
              <button
                type="button"
                className="modal-close"
                aria-label="Close"
                onClick={() => setShowStreamingModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-subtitle">Where do you want to watch?</div>
              <div className="modal-actions">
                <a
                  className="modal-button"
                  href={twitchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowStreamingModal(false)}
                >
                  Watch on Twitch
                </a>
                <a
                  className="modal-button"
                  href={kickUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowStreamingModal(false)}
                >
                  Watch on Kick
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content - Database of thoughts */}
      <div className="main-content">
        <div className="database-header">
          <h1>database</h1>
          <div className="database-info">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              aria-label="Sort database entries"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
        
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