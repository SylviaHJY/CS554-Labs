import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import noImage from '@images/no-image.jpeg';
import MyLayout from '@/components/MyLayout';
import styles from '@/styles/layout.module.css';
import { useRouter } from 'next/router';
import Head from 'next/head';

const Event = ({ event }) => {
  const router = useRouter();

  const regex = /(<([^>]+)>)/gi;

  let info = null;
  if(event && event.info){
    info = event.info.replace(regex, '');
  } else {
    info = 'No info available';
  }
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
        <title>{event.name}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>{event.name}</h1>
          <Image
          src={
            event.images ? event.images[0].url : noImage
          }
          alt="Event Image"
          width={250}
          height={250}
        />
      <dl>
          <dt className='title'>Sales Date:</dt> 
          {event.sales && event.sales.public && event.sales.public.startDateTime ? (
           <dd>{event.sales.public.startDateTime}</dd>)
            : (
             <dd>'Not Available'</dd>
            )}
          <dt className='title'>Start Date:</dt>
          {event.dates && event.dates.start && event.dates.start.localDate ? (
            <dd>{event.dates.start.localDate}</dd>
          ) : (
            <dd>'Not Available'</dd>
          )}
          <dt className='title'>Start Time:</dt>
          {event.dates && event.dates.start && event.dates.start.localTime ? (
            <dd>{event.dates.start.localTime}</dd>
          ) : (
            <dd>'Not Available'</dd>
          )}
          <dt className='title'>Time Zone:</dt>
          {event.dates && event.dates.timezone ? (
            <dd>{event.dates.timezone}</dd>
          ) : (
            <dd>'Not Available'</dd>
          )}
          <dt className='title'>Address:</dt>
          {event._embedded && event._embedded.venues && event._embedded.venues[0] && event._embedded.venues[0].postalCode && 
          event._embedded.venues[0].city && event._embedded.venues[0].city.name && event._embedded.venues[0].state && 
          event._embedded.venues[0].state.name && event._embedded.venues[0].address && event._embedded.venues[0].address.line1 ? (
            <dd>{event._embedded.venues[0].address.line1 + ', ' + event._embedded.venues[0].city.name + ', ' + event._embedded.venues[0].state.name + ' ' + event._embedded.venues[0].postalCode}</dd>
          ) : (
            <dd>Not Available</dd>
          )}
          <dt className='title'>Info:</dt>
          <dd>{info}</dd>
          <dt className='title'>Price Range:</dt>
          {event.priceRanges ? (
            <dd>
              {event.priceRanges[0].min + ' - ' + 
              event.priceRanges[0].max}
            </dd>
          ) : (
            <dd>'Not Available'</dd>
          )}
          <dt className='title'>Ticket Limit:</dt>
          {event.ticketLimit && event.ticketLimit.info ? (
            <dd>{event.ticketLimit.info}</dd>
          ) : (
            <dd>Not Available</dd>
          )}
          <dt className='title'>Accessibility:</dt>
          {event.accessibility && event.accessibility.ticketLimit ? (
            <dd>{event.accessibility.ticketLimit}</dd>
          ) : (
            <dd>Not Available</dd>
          )}
          <dt className='title'>Products:</dt>
          {event.products && event.products[0] && event.products[0].name ? (
            <dd>{event.products[0].name}</dd>
          ) : (
            <dd>Not Available</dd>
          )}
          <dt className='title'>Seat Map:</dt>
          {event.seatmap && event.seatmap.staticUrl ? (
            <dd>
              <a href={event.seatmap.staticUrl}>
              {event.seatmap.staticUrl}
              </a>
            </dd>
          ) : (
            <dd>Not Available</dd>
          )}
       </dl>
       <br/>
        <Link href="/events/page/1" legacyBehavior>
          <a  style={{ color: 'blue' }}>Back to First Page EventsList</a>
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
      `https://app.ticketmaster.com/discovery/v2/events/${id}.json?countryCode=US&apikey=UhZkh6bYUIeOg1Ms9jGHBdHuX6kG5xmq`
    );

    return {
      props: {
        event: data,
      },
      revalidate: 86400,
    };
  } catch (error) {
    console.error(`Error fetching data for event ID: ${id}`);
    return {
      notFound: true,
    };
  }
}

export async function getStaticPaths() {
  const { data } = await axios.get(
    'https://app.ticketmaster.com/discovery/v2/events.json?countryCode=US&apikey=UhZkh6bYUIeOg1Ms9jGHBdHuX6kG5xmq'
  );

  const paths = data._embedded.events.map((event) => ({
    params: { id: event.id },
  }));

  return {
    paths,
    fallback: true,
  };
}

export default Event;