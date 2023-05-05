import React, { useState, useEffect } from "react";
import "./App.css";
import { useQuery, useMutation } from "@apollo/client";
import queries from "../queries";
import LocationList from "./LocationList";

function MyLikes() {
  const [errorMessage, setErrorMessage] = useState("");
  const { loading, error, data } = useQuery(queries.GET_LIKED_LOCATIONS);
  const [updateLocation] = useMutation(queries.UPDATE_LOCATION, {
    update: (cache, { data: { updateLocation } }) => {
      const cacheLikes = cache.readQuery({ query: queries.GET_LIKED_LOCATIONS });

      let newLikedLocations;
      if (updateLocation.liked) {
        // Check if the location is already in the array
        const isLocationInLikes = cacheLikes.likedLocations.some(
          (location) => location.id === updateLocation.id
        );
        
        if (!isLocationInLikes) {
          newLikedLocations = [...cacheLikes.likedLocations, updateLocation];
        } else {
          // If the location is already in the array, don't modify the array
          newLikedLocations = cacheLikes.likedLocations;
        }
      } else {
        newLikedLocations = cacheLikes.likedLocations.filter(
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
      await updateLocation({
        variables: {
          id: locationId,
          liked: !currentLikedStatus,
        },
      });
      console.log("Toggled like status for location:", locationId);
    } catch (err) {
      console.log(err);
      setErrorMessage("Error: Failed to like location.");
    }
  };

  return (
    <div className="App">
      <h1>My Likes</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <LocationList
        locations={data.likedLocations}
        onLike={handleLikeToggle}
        showLoadMore={false}
        showDelete={false}
      />
    </div>
  );
}

export default MyLikes;

