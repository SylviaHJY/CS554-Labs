import React from 'react';
import './App.css';
import 
{ ApolloClient, 
  InMemoryCache, 
  ApolloProvider, 
  } from '@apollo/client';
import {NavLink, BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './Home';
import MyLikes from './myLikes';
import MyLocations from './myLocations';
import NewLocation from './newLocation';


const client = new ApolloClient({
  uri: 'http://localhost:4000',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
      <div className="App">
      <header className="App-header">
      <h1 className='App-title'>GraphQL with Apollo Client & Server Project</h1>
      <nav>
        <NavLink className= 'navlink' to='/'>Home</NavLink>
        <NavLink className= 'navlink' to='/my-likes'>My Likes of Locations</NavLink>
        <NavLink className= 'navlink' to='/my-locations'>My uploaded Locations</NavLink>
        <NavLink className= 'navlink' to='/new-location'>Add a new Location</NavLink>
      </nav>
      </header>
      <br />
      <br />
      <div className='App-body'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/my-likes' element={<MyLikes />} />
          <Route path='/my-locations' element={<MyLocations />} />
          <Route path='/new-location' element={<NewLocation />} />
        </Routes>
      </div>
     </div>
    </Router>
  </ApolloProvider>
  );
}

export default App;
