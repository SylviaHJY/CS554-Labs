import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link ,useParams ,useNavigate} from 'react-router-dom';
import noImage from '../images/no-image.jpeg';
import SearchItems from './SearchItems';


import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography
} from '@mui/material';
import '../App.css';

const EventsList = () => {
  const regex = /(<([^>]+)>)/gi;
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [showsData, setShowsData] = useState(undefined);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const {page} = useParams();
  let card = null;
  const totalPages = 50;

  useEffect(() => {
    console.log('on load useEffect');
    const fetchData = async () => {
      try{
        const { data } = await axios.get(`https://app.ticketmaster.com/discovery/v2/events.json?&page=${Number(page)-1}&apikey=UhZkh6bYUIeOg1Ms9jGHBdHuX6kG5xmq&countryCode=US`);
        setShowsData(data._embedded.events);
        setLoading(false);
        setNotFound(false);
      }catch(e){
        console.log(e);
        if (e.status === 429) {
          setLoading(true);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      }
    }
    fetchData();
  }, [page]);

  useEffect(() => {
    console.log('on search useEffect');
    const fetchData = async () => {
      try{
        const { data } = await axios.get(`https://app.ticketmaster.com/discovery/v2/events.json?keyword=${searchTerm}&apikey=UhZkh6bYUIeOg1Ms9jGHBdHuX6kG5xmq&countryCode=US`);
        setSearchData(data._embedded.events);
        setLoading(false);
        setNotFound(false);
      }catch(e){
        console.log(e);
        if (e.status === 429) {
          setLoading(true);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      }
    }
    fetchData();
  }, [searchTerm]);

  const searchValue = async (value) => {
    setSearchTerm(value);
  };

  const changedPage = async (totalPages, page) => {
    try {
      if (page > 0 && page <= totalPages) {
        setNotFound(false);
        navigate(`/events/page/${page}`);
      } else {
        setNotFound(true);
        console.log("Page does not exist");
      }
    } catch (e) {
      console.log(e);
      setNotFound(true);
    }
  };

  const buildCard = (event) => {
    const { name, images, dates, priceRanges} = event;
    const startDate = dates.start && dates.start.localDate ? `Start date: ${dates.start.localDate}` : 'Start date not available';
    const startDateTime = dates.start && dates.start.localTime ? `Start time: ${dates.start.localTime}` : 'Start time not available';
    const imageSrc = images && images[0] ? images[0].url : noImage;
    const priceRange =
      priceRanges && priceRanges[0]
        ? `Price: ${priceRanges[0].min} - ${priceRanges[0].max}`
        : 'Price not available';
  
    return (
      <Grid item xs={12} sm={7} md={5} lg={4} xl={3} key={event.id}>
        <Card
          variant="outlined"
          sx={{
            maxWidth: 250,
            height: 'auto',
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: 5,
            border: '1px solid #1e8678',
            boxShadow:
              '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);',
          }}
        >
          <CardActionArea>
            <Link to={`/events/${event.id}`}>
              <CardMedia
                sx={{
                  height: '100%',
                  width: '100%',
                }}
                component="img"
                image={imageSrc}
                title="event image"
              />
  
              <CardContent>
                <Typography
                  sx={{
                    borderBottom: '1px solid #1e8678',
                    fontWeight: 'bold',
                  }}
                  gutterBottom
                  variant="h6"
                  component="h3"
                >
                  {name}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {startDate}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {startDateTime}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {priceRange}
                </Typography>
                <Typography variant='body2' color='textSecondary' component='p'>
                  {event.info
                    ? event.info.replace(regex, '').substring(0, 139) + '...'
                    : 'No information available'}
                  {event.info ? <span> More Info</span> : <span></span>}
                </Typography>
              </CardContent>
            </Link>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };

  if(searchTerm){
    card = searchData && searchData.map((event) => buildCard(event));
  }else{
    card = showsData && showsData.map((event) => buildCard(event));
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
      <div>
        <SearchItems searchValue={searchValue} />
          <br />
          <br />
        <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
        <div>
        {page > 1 && page <= totalPages && (
          <button onClick={() => changedPage(totalPages,Number(page) - 1)}>
            Prev
          </button>
        )}
        {"  "}
        {page < totalPages && (
          <button onClick={() => changedPage(totalPages,Number(page) + 1)}>
            Next
          </button>
        )}
       </div>
      </div>
          <br />
            <br />
            <Grid
              container
              spacing={2}
              sx={{
                flexGrow: 1,
                flexDirection: 'row'
              }}
            >
              {card}
            </Grid>
      </div>
    );
  }
};

export default EventsList;

  



    
