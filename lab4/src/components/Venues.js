import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link,useParams} from 'react-router-dom';
import noImage from '../images/no-image.jpeg';

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardHeader
} from '@mui/material';
import '../App.css';


const venue = (props) => {
  const [showData, setShowData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  let {id} = useParams();
  const regex = /(<([^>]+)>)/gi;

  useEffect(() => {
    console.log('EventCard useEffect fired');
    const fetchData = async () => {
      try{
        const { data } = await axios.get(
          `https://app.ticketmaster.com/discovery/v2/venues/${id}.json?countryCode=US&apikey=UhZkh6bYUIeOg1Ms9jGHBdHuX6kG5xmq`
        );
        setShowData(data);
        setLoading(false);
        setNotFound(false);
      } catch (e) {
        console.log(e);
        if (e.status === 429){
          setLoading(true);
        }
        setNotFound(true);
      }
    }
    fetchData();
  } , [id]);

  let boxOfficeInfo = null;
  if (showData && showData.boxOfficeInfo && showData.boxOfficeInfo.openHoursDetail){
    boxOfficeInfo = showData.boxOfficeInfo.openHoursDetail.replace(regex, '');
  } else {
    boxOfficeInfo = 'No box office info available';
  }

  let generalInfo = null;
  if (showData && showData.generalInfo && showData.generalInfo.generalRule){
    generalInfo = showData.generalInfo.generalRule.replace(regex, '');
  } else {
    generalInfo = 'No general info available';
  }

  let parkingDetail = null;
  if (showData && showData.parkingDetail){
    parkingDetail = showData.parkingDetail.replace(regex, '');
  } else {
    parkingDetail = 'No parking info available';
  }

  if(notFound){
    return (
      <div>
        <h2>404 Page Not Found</h2>
      </div>
    );
  }else if(loading){
    return (
      <div>
      <h2>Loading....API Access Limit</h2>
      </div>
    ); 
  }else{
    return(
      <Card
      variant='outlined'
      sx={{
        maxWidth: 550,
        height: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: 5,
        border: '1px solid #1e8678',
        boxShadow:
          '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);'
      }}
     >
      <CardHeader 
        title={showData.name}
        sx={{
          borderBottom: '1px solid #1e8678',
          fontWeight: 'bold'
        }}
      />

      <CardMedia 
          component='img'
          height='140'
          image={
            showData.images
              ? showData.images[0].url
              : noImage
          }
          alt='Venue Image'
      />

      <CardContent>
          <Typography
            variant='body2'
            color='text.secondary'
            component='span'
            sx={{
              borderBottom: '1px solid #1e8678',
              fontWeight: 'bold'
            }}
          >
          
          <dl>
            <p>
              <dt className='title'>Time Zone:</dt>
              {showData.timezone ? (
                <dd>{showData.timezone}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>City:</dt>
              {showData.city && showData.city.name ? (
                <dd>{showData.city.name}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>State:</dt>
              {showData.state && showData.state.name ?(
                <dd>{showData.state.name}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Country:</dt>
              {showData.country && showData.country.name ? (
                <dd>{showData.country.name}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Address:</dt>
              {showData.address && showData.address.line1 ? (
                <dd>{showData.address.line1}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Postal Code:</dt>
              {showData.postalCode ? (
                <dd>{showData.postalCode}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>boxOfficeInfo:</dt>
              <dd>{boxOfficeInfo}</dd>
            </p>
            <p>
              <dt className='title'>generalInfo:</dt>
              <dd>{generalInfo}</dd>
            </p>
            <p>
              <dt className='title'>parkingDetail:</dt>
              <dd>{parkingDetail}</dd>
            </p>
          </dl>
          <Link to ='/venues/page/1'>Back to First Page VenuesList</Link>
        </Typography>
      </CardContent>
    </Card>
   )
  }
};

export default venue;