import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { data } from '../data';
import './DatabasePage.css';

const DatabasePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = data.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="card-header">
        <div className="card-title">DATABASE</div>
        <div className="card-info">{filteredData.length} FILES</div>
      </div>
      
      <div className="card-content">
        <div className="database-controls">
          <input 
            type="text" 
            className="search-bar" 
            placeholder="Search database..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="filter-button">Filter</button>
        </div>
        
        <table className="database-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id}>
                <td><Link to={`/database/${item.id}`}>{item.title}</Link></td>
                <td>{item.type}</td>
                <td>{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span>Database online - {filteredData.length} entries found</span>
        </div>
      </div>
      
      <div className="memory-card-footer">
        <div className="memory-card-button">BACK</div>
        <div className="memory-card-button">OPEN</div>
        <div className="memory-card-button">SORT</div>
      </div>
    </>
  );
};

export default DatabasePage; 