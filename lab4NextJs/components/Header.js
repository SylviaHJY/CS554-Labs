import Link from 'next/link';

const linkStyle = {
  marginRight: 15,
  color: '#FFFFFF', // Add this line to change the link text color
};

const Header = () => (
  <div>
    <Link href='/' legacyBehavior>
      <a style={linkStyle}>Home</a>
    </Link>

    <Link href='/events/page/1' legacyBehavior>
      <a style={linkStyle}>Events</a>
    </Link>

    <Link href='/attractions/page/1' legacyBehavior>
      <a style={linkStyle}>Attractions</a>
    </Link>

    <Link href='/venues/page/1' legacyBehavior>
      <a style={linkStyle}>Venues</a>
    </Link>
  </div>
);

export default Header;


