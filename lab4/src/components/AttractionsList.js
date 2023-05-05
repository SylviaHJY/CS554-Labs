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

const AttractionsList = () =>{
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [showsData, setShowsData] = useState(undefined);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();
  const {page} = useParams();
  const totalPages = 50;
  let card = null;

  useEffect(() => {
    console.log('on load useEffect');
    const fetchData = async () => {
      try{
        const { data } = await axios.get(`https://app.ticketmaster.com/discovery/v2/attractions.json?page=${Number(page)-1}&apikey=UhZkh6bYUIeOg1Ms9jGHBdHuX6kG5xmq&countryCode=US`);
        setShowsData(data._embedded.attractions);
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
          const { data } = await axios.get(`https://app.ticketmaster.com/discovery/v2/attractions.json?keyword=${searchTerm}&apikey=UhZkh6bYUIeOg1Ms9jGHBdHuX6kG5xmq&countryCode=US`);
          setSearchData(data._embedded.attractions);
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

    const changedPage = async(totalPages, page) => {
      try {
        if (page > 0 && page <= totalPages) {
          setNotFound(false);
          navigate(`/attractions/page/${page}`);
        } else {
          setNotFound(true);
          console.log("Page does not exist");
        }
      } catch (e) {
        console.log(e);
        setNotFound(true);
      }
    };

    const buildCard = (attractions)  => {
      const imageSrc = attractions.images ? attractions.images[0].url : noImage;
      return (
        <Grid item xs={12} sm={6} md={4} lg={3} key={attractions.id}>
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
            <Link to={`/attractions/${attractions.id}`}>
             <CardMedia
                sx={{
                  height: '100%',
                  width: '100%',
                }}
                component="img"
                image={imageSrc}
                title="attractions image"
              />

              <CardContent>
                <Typography
                sx={{
                  borderBottom: '1px solid #1e8678',
                  fontWeight: 'bold'
                }}
                gutterBottom
                variant='h6'
                component='h3'
              >
                {attractions.name}
              </Typography>
              <Typography variant='body2' color='textSecondary' component='p'>
              {attractions.classifications[0]?.genre?.name || 'No genre available'}
              </Typography>

              <Typography variant='body2' color='textSecondary' component='p'>
              {attractions.url?.url || 'No url available'}
              </Typography>

              <Typography variant='body2' color='textSecondary' component='p'>
                {attractions.externalLinks?.facebook?.[0]?.url || 'No facebook available'}
              </Typography>

              <Typography variant='body2' color='textSecondary' component='p'>
                {attractions.externalLinks?.twitter?.[0]?.url || 'No twitter available'}
              </Typography>

              <Typography variant='body2' color='textSecondary' component='p'>
                {attractions.externalLinks?.instagram?.[0]?.url || 'No instagram available'}
              </Typography>

              <Typography variant='body2' color='textSecondary' component='p'>
                {attractions.externalLinks?.youtube?.[0]?.url || 'No youtube available'}
              </Typography>

              <Typography variant='body2' color='textSecondary' component='p'>
                {attractions.externalLinks?.homepage?.[0]?.url || 'No homepage available'}
              </Typography>
           </CardContent>
          </Link>
        </CardActionArea>
      </Card>
    </Grid>
  );
};

if (searchTerm) {
  card = searchData && searchData.map((attractions) => buildCard(attractions));
} else {
  card = showsData && showsData.map((attractions) => buildCard(attractions));
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

export default AttractionsList;
