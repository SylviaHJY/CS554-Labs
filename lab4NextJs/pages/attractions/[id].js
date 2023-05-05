import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import noImage from '@images/no-image.jpeg';
import MyLayout from '@/components/MyLayout';
import styles from '@/styles/layout.module.css';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Attraction = ({ attraction }) => {
  const router = useRouter();

  // 如果 fallback 为 true 且页面数据尚不可用，显示加载状态
  if (router.isFallback) {
    return (
    <><Head>
        <title>loading</title>
      </Head>
      <div>Loading...</div></>
    );
  }
  return (
    <MyLayout>
      <Head>
        <title>{attraction.name}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>{attraction.name}</h1>
          <Image
            src={attraction.images ? attraction.images[0].url : noImage}
            alt="Attraction Image"
            width={250}
            height={250}
          />

          <dl>
              <dt className="title">Type:</dt>
              {attraction.type ? (
                <dd>{attraction.type}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
              <dt className="title">Classifications:</dt>
              {attraction.classifications &&
              attraction.classifications.segment ? (
                <dd>{attraction.classifications.segment.name}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
              <dt className="title">Genre:</dt>
              {attraction.classifications &&
              attraction.classifications.genre ? (
                <dd>{attraction.classifications.genre.name}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
              <dt className="title">SubGenre:</dt>
              {attraction.classifications &&
              attraction.classifications.subGenre ? (
                <dd>{attraction.classifications.subGenre.name}</dd>
              ) : (
                <dd>Not Available</dd>
              )}
              <dt className="title">YouTube:</dt>
              {attraction.externalLinks && attraction.externalLinks.youtube ? (
                <dd><a href={attraction.externalLinks.youtube[0].url}>
                  {attraction.externalLinks.youtube[0].url}
                </a></dd>
              ) : (
                <dd>Not Available</dd>
              )}
              <dt className="title">Twitter:</dt>
              {attraction.externalLinks && attraction.externalLinks.twitter ? (
                <dd><a href={attraction.externalLinks.twitter[0].url}>
                  {attraction.externalLinks.twitter[0].url}
                </a></dd>
              ) : (
                <dd>Not Available</dd>
              )}
              <dt className="title">Facebook:</dt>
              {attraction.externalLinks &&
              attraction.externalLinks.facebook ? (
                <dd><a href={attraction.externalLinks.facebook[0].url}>
                  {attraction.externalLinks.facebook[0].url}
                </a></dd>
              ) : (
                <dd>Not Available</dd>
              )}
              <dt className="title">Instagram:</dt>
              {attraction.externalLinks &&
              attraction.externalLinks.instagram ? (
                <dd><a href={attraction.externalLinks.instagram[0].url}>
                  {attraction.externalLinks.instagram[0].url}
                </a></dd>
              ) : (
                <dd>Not Available</dd>
              )}
            <dt className='title'>Homepage:</dt>
            {attraction.externalLinks &&attraction.externalLinks.homepage ? (
             <dd><a href={attraction.externalLinks.homepage[0].url}>
              {attraction.externalLinks.homepage[0].url}
              </a></dd>
              ) : (
              <dd>Not Available</dd>
              )}
              <dt className="title">Upcoming Events:</dt>
              {attraction.upcomingEvents ? (
              <dd>{attraction.upcomingEvents._total}</dd>
              ) : (
              <dd>Not Available</dd>
              )}
          </dl>
          <br/>
          <Link href="/attractions/page/1" legacyBehavior>
            <a style={{ color: 'blue' }}>Back to First Page AttractionsList</a>
          </Link>
        </div>
      </div>
    </MyLayout>
  );
};

export async function getStaticProps({ params }) {
  const { id } = params;

  try {
    const { data } = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/attractions/${id}.json?countryCode=US&apikey=UhZkh6bYUIeOg1Ms9jGHBdHuX6kG5xmq`
    );

    return {
      props: {
        attraction: data,
      },
      revalidate: 86400,
    };
  } catch (error) {
    console.error(`Error fetching data for attraction ID: ${id}`);
    return {
      notFound: true,
    };
  }
}

export async function getStaticPaths() {
  const { data } = await axios.get(
    `https://app.ticketmaster.com/discovery/v2/attractions.json?countryCode=US&apikey=UhZkh6bYUIeOg1Ms9jGHBdHuX6kG5xmq`
  );
  const paths = data._embedded.attractions.map((attraction) => ({
    params: { id: attraction.id },
  }));

  return { 
    paths, 
    fallback: true 
  };
}

export default Attraction;

