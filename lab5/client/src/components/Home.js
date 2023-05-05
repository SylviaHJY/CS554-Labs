import React, { useState, useEffect } from 'react';
import './App.css';
import { useQuery, useMutation} from '@apollo/client';
import queries from '../queries';
import LocationList from './LocationList';

function HomePage() {
  const [pageNum, setPageNum] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [likedLocationIds, setLikedLocationIds] = useState(new Set());
  const { loading, error, data} = useQuery(queries.GET_LOCATION_POSTS, {
    variables: { pageNum },
  });

  const [updateLocation] = useMutation(queries.UPDATE_LOCATION, {
    update: (cache, { data: { updateLocation } }) => {
      // Update the GET_LOCATION_POSTS query
      const cacheDataPosts = cache.readQuery({
        query: queries.GET_LOCATION_POSTS,
        variables: { pageNum },
      });
  
      const updatedLocationPosts = cacheDataPosts.locationPosts.map((location) =>
        location.id === updateLocation.id ? updateLocation : location
      );
  
      cache.writeQuery({
        query: queries.GET_LOCATION_POSTS,
        variables: { pageNum },
        data: { locationPosts: updatedLocationPosts },
      });
  
      // Update the GET_LIKED_LOCATIONS query
      const cacheDataLiked = cache.readQuery({
        query: queries.GET_LIKED_LOCATIONS,
      }) || { likedLocations: [] }; // If the cache is empty, set it to an empty array
      
      let newLikedLocations;
  
      if (updateLocation.liked) {
        newLikedLocations = [...cacheDataLiked.likedLocations, updateLocation];
      } else {
        newLikedLocations = cacheDataLiked.likedLocations.filter(
          (location) => location.id !== updateLocation.id
        );
      }
  
      cache.writeQuery({
        query: queries.GET_LIKED_LOCATIONS,
        data: { likedLocations: newLikedLocations },
      });
    },
  });

  useEffect(() => {
    if (data) {
      console.log(data);
    }
  }, [data]);  

  if (loading)
    return (
      <div>
        <h2>Loading....API Access Limit</h2>
      </div>
    );

  if (error)
    return (
      <div>
        <h2>404 Page Not Found</h2>
      </div>
    );

    const handleLikeToggle = async (locationId, currentLikedStatus) => {
      try {
        const updatedLocationData = await updateLocation({
          variables: {
            id: locationId,
            liked: !currentLikedStatus,
          },
        });
    
        const updatedLocation = updatedLocationData.data.updateLocation;

          // If the user has already liked the location and is trying to like it again, return early
        if (!currentLikedStatus && likedLocationIds.has(locationId)) {
          console.log("Location already liked:", locationId);
          return;
        }
    
        if (updatedLocation.liked) {
          // Add the location ID to likedLocationIds when the user likes a location
          setLikedLocationIds((prevState) => new Set([...prevState, locationId]));
        } else {
          // Remove the location ID from likedLocationIds when the user unlikes a location
          setLikedLocationIds((prevState) => {
            const newSet = new Set([...prevState]);
            newSet.delete(locationId);
            return newSet;
          });
        }
        console.log("Toggled like status for location:", locationId);
      } catch (err) {
        console.log(err);
        if(err){
          setErrorMessage("Error: Failed to like location");
        }
      }
    };

    const handleGetMore = () => {
      setPageNum(pageNum + 1);
    };
  

  return (
    <div className='App'>
      <h1>Locations</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <LocationList
        locations={data.locationPosts}
        onLike={handleLikeToggle}
        onLoadMore={handleGetMore}
        showLoadMore
        showDelete={false}
        isLastPage={pageNum ===5}
      />
    </div>
  );
}

export default HomePage;

        
  
