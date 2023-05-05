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

const Attraction = (props) => {
  const [showData, setShowData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  let {id} = useParams();

  useEffect(() => {
    console.log('EventCard useEffect fired');
    const fetchData = async () => {
      try{
        const { data } = await axios.get(
          `https://app.ticketmaster.com/discovery/v2/attractions/${id}.json?countryCode=US&apikey=UhZkh6bYUIeOg1Ms9jGHBdHuX6kG5xmq`
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
    };
    fetchData();
  }, [id]);

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
          alt='Attraction Image'
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
              <dt className='title'>Type:</dt>
              {showData.type ? (
                <dd>{showData.type}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Classifications:</dt>
              {showData.classifications && showData.classifications.segment ?(
                <dd>{showData.classifications.segment.name}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Genre:</dt>
              {showData.classifications && showData.classifications.genre ?(
                <dd>{showData.classifications.genre.name}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>SubGenre:</dt>
              {showData.classifications && showData.classifications.subGenre ?(
                <dd>{showData.classifications.subGenre.name}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>YouTube:</dt>
              {showData.externalLinks && showData.externalLinks.youtube ? (
                <a href={showData.externalLinks.youtube[0].url}>
                  {showData.externalLinks.youtube[0].url}
                </a>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Twitter:</dt>
              {showData.externalLinks && showData.externalLinks.twitter ? (
                <a href={showData.externalLinks.twitter[0].url}>
                  {showData.externalLinks.twitter[0].url}
                </a>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Facebook:</dt>
              {showData.externalLinks && showData.externalLinks.facebook ? (
                <a href={showData.externalLinks.facebook[0].url}>
                  {showData.externalLinks.facebook[0].url}
                </a>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Instagram:</dt>
              {showData.externalLinks && showData.externalLinks.instagram ? (
                <a href={showData.externalLinks.instagram[0].url}>
                  {showData.externalLinks.instagram[0].url}
                </a>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Homepage:</dt>
              {showData.externalLinks && showData.externalLinks.homepage ? (
                <a href={showData.externalLinks.homepage[0].url}>
                  {showData.externalLinks.homepage[0].url}
                </a>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
            <p>
              <dt className='title'>Upcoming Events:</dt>
              {showData.upcomingEvents ? (
                <dd>{showData.upcomingEvents._total}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
            </p>
          </dl>
          <Link to ='/attractions/page/1'>Back to First Page AttractionsList</Link>
          </Typography>
        </CardContent>
      </Card>
    );
  }
};

export default Attraction;