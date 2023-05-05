import React, {useState}from 'react';
import './App.css';
import { useQuery,useMutation } from '@apollo/client';
import queries from '../queries';

function NewLocation () {
  const [errorMessage, setErrorMessage] = useState('');
  const [locationImage, setLocationImage] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationName, setLocationName] = useState('');

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
    }
  });
  const { loading: queryLoading, error: queryError, data } = useQuery(queries.GET_USER_POSTED_LOCATIONS);

  const [uploadLocation] = useMutation(queries.UPLOAD_LOCATION, {
    refetchQueries: [
      {
        query: queries.GET_USER_POSTED_LOCATIONS,
      }
    ],
    update: (cache, { data: { uploadLocation} }) => {
      const cacheLocations = cache.readQuery({ query: queries.GET_USER_POSTED_LOCATIONS });
      const newPostedLocations = [...cacheLocations.userPostedLocations, uploadLocation];
      cache.writeQuery({
        query: queries.GET_USER_POSTED_LOCATIONS,
        data: { userPostedLocations: newPostedLocations }
      });
    }
  });

  if(queryLoading) return (
    <div>
    <h2>Loading....API Access Limit</h2>
    </div>
  );

  if(queryError) return (
    <div>
    <h2>404 Page Not Found</h2>
    </div>
  );

  async function isImageUrlOnInternet(imageUrl) {
    // Check if the URL has a valid image extension
    const imageRegex = /\.(jpe?g|png|gif|bmp|webp)$/i;
    if (!imageRegex.test(imageUrl)) {
      return false;
    }
  
    try {
      const response = await fetch(imageUrl, {
        method: 'HEAD',
        redirect: 'follow',
        mode: 'no-cors',
        referrerPolicy: 'no-referrer',
      });
  
      // Check if the response headers indicate that the content is an image
     // 如果收到一个有效的响应，认为图片 URL 是有效的
      if (response.type === 'opaque' && response.status === 0) {
        return true;
      }
    } catch (error) {
      console.error(`Error checking image URL: ${error.message}`);
    }
  
    return false;
  }
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!locationImage || !locationAddress || !locationName) {
      setErrorMessage('Please fill out all fields');
      return;
    }
    if(typeof locationImage !== 'string' || typeof locationAddress !== 'string' || typeof locationName !== 'string') {
      setErrorMessage('Please enter a valid image url, address, and name');
      return;
    }

    // Check if the image URL is on the internet
    const isImageValid = await isImageUrlOnInternet(locationImage);
    if (!isImageValid) {
      setErrorMessage('The image URL is not valid or accessible on the internet');
      return;
    }

    try {
       await uploadLocation({
        variables: {
          image: locationImage,
          address: locationAddress,
          name: locationName
        }
      });
      setLocationImage('');
      setLocationAddress('');
      setLocationName('');
    }
    catch (err) {
      console.log(err);
      setErrorMessage('Error uploading location');
    }
   };

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

  return (
    <div className="App">
      <h1>Upload New Location</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="locationImage">Image URL: </label>
          <input
            type="text"
            id="locationImage"
            value={locationImage}
            required
            onChange={(e) => setLocationImage(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="locationAddress">Address: </label>
          <input
            type="text"
            id="locationAddress"
            value={locationAddress}
            required
            onChange={(e) => setLocationAddress(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="locationName">Name: </label>
          <input
            type="text"
            id="locationName"
            value={locationName}
            required
            onChange={(e) => setLocationName(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <br/>
      <br/>
      <div>
      {data && data.userPostedLocations.map((location) => (
          <div key={location.id}>
            <h2>{location.name}</h2>
            <img src={location.image} alt={location.name} />
            <p>{location.address}</p>
            <button onClick={() => handleDelete(location.id)}>Delete</button>
          </div>
        ))}
      </div>
      
     </div>
  );
}

export default NewLocation;