import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Home = () => {
  return (
    <div>
      <h1>Welcome to Your Site Name!</h1>
      <p>Discover the world of live events, concerts, and more with Ticketmaster API</p>

      <h2>Our Purpose</h2>
      <p>
        We created this site to celebrate the magic of live events and connect people to their favorite performances.<br/>
        From the electrifying concerts to unforgettable sporting events, our mission is to help you explore and experience the best moments of your life. <br/>
        We hope you enjoy your journey with us!
      </p>

      <h2>Explore Our Listings</h2>
      <p>Start your journey now by exploring our listings:</p>
      <div className="listings">
        <Link to="/events/page/1" className="listing-link">
          <div className="listing">
            <h3>Events</h3>
            <p>Find exciting events happening</p>
          </div>
        </Link>
        <Link to="/attractions/page/1" className="listing-link">
          <div className="listing">
            <h3>Attractions</h3>
            <p>Discover popular attractions and performers</p>
          </div>
        </Link>
        <Link to="/venues/page/1" className="listing-link">
          <div className="listing">
            <h3>Venues</h3>
            <p>Explore iconic venues around the world</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;


