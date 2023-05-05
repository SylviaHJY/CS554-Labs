import React, {useState, useEffect}from 'react';
import './App.css';
import { useQuery,useMutation } from '@apollo/client';
import queries from '../queries';
import LocationList from './LocationList';

function MyLocations() {
  const [errorMessage, setErrorMessage] = useState('');
  const { loading, error, data} = useQuery(queries.GET_USER_POSTED_LOCATIONS);

  const [deleteLocation] = useMutation(queries.DELETE_LOCATION, {
    update: (cache, { data: { deleteLocation} }) => {
      const cacheLocations = cache.readQuery({ query: queries.GET_USER_POSTED_LOCATIONS });
      const newPostedLocations = cacheLocations.userPostedLocations.filter(
        location => location.id !== deleteLocation.id
        );
      cache.writeQuery({
        query: queries.GET_USER_POSTED_LOCATIONS,
        data: { userPostedLocations: newPostedLocations }
      });

      const cacheLikes = cache.readQuery({ query: queries.GET_LIKED_LOCATIONS });
      if(cacheLikes.likedLocations.find(location => location.id === deleteLocation.id)) {
        const newLikedLocations = cacheLikes.likedLocations.filter(
          location => location.id !== deleteLocation.id
          );
        cache.writeQuery({
          query: queries.GET_LIKED_LOCATIONS,
          data: { likedLocations: newLikedLocations }
        });
      }
    }
  });

  const [updateLocation] = useMutation(queries.UPDATE_LOCATION, {
    refetchQueries: [
      {
        query: queries.GET_USER_POSTED_LOCATIONS,
      }
    ],

    update: (cache, { data: { updateLocation} }) => {
      const cacheLikes = cache.readQuery({ query: queries.GET_LIKED_LOCATIONS });

      let newLikedLocations;
      if(updateLocation.liked) {
        newLikedLocations = [...cacheLikes.likedLocations, updateLocation];
      } else {
        newLikedLocations = cacheLikes.likedLocations.filter(
        location => location.id !== updateLocation.id
        );

      }

      cache.writeQuery({
        query: queries.GET_LIKED_LOCATIONS,
        data: { likedLocations: newLikedLocations }
      });
    }
  });

  useEffect(() => {
    if(data) {
      console.log(data);
    }
  }, [data]);

  if(loading) return (
    <div>
    <h2>Loading....API Access Limit</h2>
    </div>
  );

  if(error) return (
    <div>
    <h2>404 Page Not Found</h2>
    </div>
  );

  const handleDelete = async (locationId) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation({
          variables: {
            id: locationId,
          },
        });
        console.log("Deleted location:", locationId);
      } catch (err) {
        console.error(err);
        setErrorMessage('Error: Failed to delete location.');
      }
    }
  };

  const handleLikeToggle = async (locationId, currentLikedStatus) => {
    try {
      await updateLocation({
        variables: {
          id: locationId,
          liked: !currentLikedStatus,
        },
      });
      console.log("Toggled like status for location:", locationId);
    } catch (err) {
      console.error(err);
      setErrorMessage('Error: Failed to like location.');
    }
  }

  return (
    <div className="App">
      <h1>My Locations</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <LocationList
        locations={data.userPostedLocations}
        onDelete={handleDelete}
        onLike={handleLikeToggle}
        showLoadMore={false}
        showDelete={true}
      />
    </div>
  );
}

export default MyLocations;