import React from 'react';
import logo from './logo.svg';
import './App.css';
import Home from './components/Home';
import Events from './components/Events';
import Attractions from './components/Attractions';
import Venues from './components/Venues';
import EventsList from './components/EventsList';
import AttractionsList from './components/AttractionsList';
import VenuesList from './components/VenuesList';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';


function App() {
  return (
    <Router>
      <div className='App'>
        <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <h1 className='APP-title'>
          Welcome to Ticketmaster API playground!
          </h1>
          <Link className='showlink' to='/'>Home</Link>
          <Link className='showlink' to='/events/page/1'>Events</Link>
          <Link className='showlink' to='/attractions/page/1'>Attractions</Link>
          <Link className='showlink' to='/venues/page/1'>Venues</Link>
        </header>
        <br />
        <br />
        <div className='App-body'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/events/page/:page' element={<EventsList />} />
            <Route path='/attractions/page/:page' element={<AttractionsList />} />
            <Route path='/venues/page/:page' element={<VenuesList />} />
            <Route path='/events/:id' element={<Events />} />
            <Route path='/attractions/:id' element={<Attractions />} />
            <Route path='/venues/:id' element={<Venues />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
