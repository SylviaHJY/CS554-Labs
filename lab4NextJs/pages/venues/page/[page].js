// pages/venues/page/[page].js
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import noImage from '@images/no-image.jpeg';
import MyLayout from '@/components/MyLayout';
import styles from '@/styles/layout.module.css';
import Head from 'next/head';

const VenuesList = ({ venuesData, page }) => {
  const totalPages = 50;

  const buildCard = (venue) => {
    const imageSrc = venue.images && venue.images[0] ? venue.images[0].url : noImage;

    return (
      <div className={styles.card} key={venue.id}>
        <Link href={`/venues/${venue.id}`}>

          <Image src={imageSrc} alt="venue image" width={250} height={250} />
           <p style={{ fontSize: '24px' }}>{venue.name}</p>
        </Link>
        <p>{venue.city.name}</p>
        <p>{venue.state.name}</p>
        <p>{venue.country.name}</p>
      </div>
    );
  };

  const card = venuesData && venuesData.map((venue) => buildCard(venue));

  return (
    <MyLayout>
      <Head>
        <title>Venues List</title>
      </Head>
      <div className={styles.pagination}>
        {page > 1 && (
          <Link href={`/venues/page/${Number(page) - 1}`} legacyBehavior>
            <a>Prev</a>
          </Link>
        )}
        {'  '}
        {page < totalPages && (
          <Link href={`/venues/page/${Number(page) + 1}`} legacyBehavior>
            <a>Next</a>
          </Link>
        )}
      </div>
      <div className={styles.container}>
        {card}
      </div>
    </MyLayout>
  );
};

export async function getStaticProps({ params }) {
  const { data } = await axios.get(`https://app.ticketmaster.com/discovery/v2/venues.json?page=${Number(params.page) - 1}&apikey=UhZkh6bYUIeOg1Ms9jGHBdHuX6kG5xmq&countryCode=US`);
  return {
    props: {
      venuesData: data._embedded.venues,
      page: Number(params.page),
    },
    revalidate: 86400,
  };
}

export async function getStaticPaths() {
  const totalPages = 50;
  const paths = Array.from({ length: totalPages }, (_, i) => ({
    params: { page: (i + 1).toString() },
  }));

  return {
    paths,
    fallback: false,
  };
}

export default VenuesList;
