import React from 'react';
import noImage from '../img/download.jpeg';
import './App.css';

const LocationCard = ({ location, onLike, onDelete, showDelete}) => (
  <div className="card">
    <img src={location.image || noImage} alt={location.name} style={{ width: '100%', height: 'auto' }} />
    <h3>{location.name}</h3>
    <p>{location.address}</p>
    <p>userPosted: {location.userPosted ? 'true' : 'false'}</p>
    <div className='button-container'>
    <button onClick={() => onLike(location.id, location.liked)}>
      {location.liked ? 'Remove like' : 'Like'}
    </button>
    {showDelete && onDelete && (
      <button onClick={() => onDelete(location.id)}>Delete</button>
    )}
    </div>
  </div>
);

const LocationList = ({
  locations,
  onLike,
  onDelete,
  onLoadMore,
  showDelete,
  showLoadMore,
  isLastPage
}) => (
  <div className="location-list">
    <div className="card-grid">
    {locations.map((location) => (
      <LocationCard
        key={location.id}
        location={location}
        onLike={onLike}
        onDelete={onDelete}
        showDelete={showDelete}
      />
    ))}
    </div>
    {!isLastPage && showLoadMore && onLoadMore && (
      <button onClick={onLoadMore} className="load-more-btn">
        Get More
      </button>
    )}
  </div>
);

export default LocationList;
