import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinkClass = (path) =>
    `px-3 py-2 text-sm font-medium transition duration-200 ${
      location.pathname === path
        ? 'text-indigo-600 border-b-2 border-indigo-600'
        : 'text-gray-600 hover:text-indigo-500'
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand */}
        <Link to="/" className="text-2xl font-bold text-gray-800">
          <span className="text-indigo-600">Flex</span>
          <span className="text-gray-800">Lingo</span>
        </Link>

        {/* Hamburger Button */}
        <button
          className="text-gray-700 md:hidden focus:outline-none"
          onClick={toggleMobileMenu}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop Nav */}
        <ul className="hidden md:flex space-x-6">
          <li>
            <Link to="/" className={navLinkClass('/')}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/learn-asl" className={navLinkClass('/learn-asl')}>
              Learn ASL
            </Link>
          </li>
          <li>
            <Link to="/history" className={navLinkClass('/history')}>
              History
            </Link>
          </li>
        </ul>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white px-4 py-3 border-t border-gray-200 shadow">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className={navLinkClass('/')}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/learn-asl"
                className={navLinkClass('/learn-asl')}
                onClick={() => setMobileMenuOpen(false)}
              >
                Learn ASL
              </Link>
            </li>
            <li>
              <Link
                to="/history"
                className={navLinkClass('/history')}
                onClick={() => setMobileMenuOpen(false)}
              >
                History
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
