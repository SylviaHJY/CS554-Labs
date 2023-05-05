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

const event = (props) => {
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
          `https://app.ticketmaster.com/discovery/v2/events/${id}.json?countryCode=US&apikey=UhZkh6bYUIeOg1Ms9jGHBdHuX6kG5xmq`
        );
        setShowData(data);
        setLoading(false);
        setNotFound(false);
      }catch(e){
        console.log(e);
        if (e.status === 429){
          setLoading(true);
        }
        setNotFound(true);
      }
    }
      fetchData();
  }, [id]);

  let info = null;
  if(showData && showData.info){
    info = showData && showData.info.replace(regex, '');
  }else{
    info = 'No description available';
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
    return (
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
          alt='Event Image'
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
              <dt className='title'>Sales Date:</dt>
              {showData.sales && showData.sales.public && showData.sales.public.startDateTime ? (
                <dd>{showData.sales.public.startDateTime}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Start Date:</dt>
              {showData.dates && showData.dates.start && showData.dates.start.localDate ?(
                <dd>{showData.dates.start.localDate}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Start Time:</dt>
              {showData.dates && showData.dates.start && showData.dates.start.localTime ? (
                <dd>{showData.dates.start.localTime}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Time Zone:</dt>
              {showData.dates && showData.dates.timezone ? (
                <dd>{showData.dates.timezone}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Address:</dt>
              {showData._embedded.venues[0].postalCode &&
              showData._embedded.venues[0].city.name && showData._embedded.venues[0].state.name && showData._embedded.venues[0].address.line1 ? (
                <dd>{showData._embedded.venues[0].address.line1},{showData._embedded.venues[0].city.name}, {showData._embedded.venues[0].state.name} {showData._embedded.venues[0].postalCode}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>info:</dt>
              <dd>{info}</dd>
            </p>
            <p>
              <dt className='title'>Price Range:</dt>
              {showData.priceRanges ? (
                <dd>
                  {showData.priceRanges[0].min} -{' '}
                  {showData.priceRanges[0].max}
                </dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Ticket Limit:</dt>
              {showData.ticketLimit && showData.ticketLimit.info ? (
                <dd>{showData.ticketLimit.info}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            
            <p>
              <dt className='title'>Accessibility:</dt>
              {showData.accessibility && showData.accessibility.ticketLimit ? (
                <dd>{showData.accessibility.ticketLimit}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>

            <p>
              <dt className='title'>Products:</dt>
              {showData.products ?(
                <dd>{showData.products[0].name}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>

            <p>
              <dt className='title'>Seat Map:</dt>
              {showData.seatmap && showData.seatmap.staticUrl ? (
                <dd>
                  <a href={showData.seatmap.staticUrl}>
                    {showData.seatmap.staticUrl}
                  </a>
                </dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
          </dl>
          <Link to ='/events/page/1'>Back to First Page EventsList</Link>
          </Typography>
        </CardContent>
      </Card>
    );
  }
}

export default event;