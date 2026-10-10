import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Link as ScrollLink, animateScroll as scroll } from 'react-scroll';
import logo from '../../assets/logo_white.svg';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollTarget, setScrollTarget] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuClose = () => {
    setIsOpen(false);
  };

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (location.hash === '' || location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1280 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollTarget && location.pathname === '/' && location.hash === '') {
      const element = document.getElementById(scrollTarget);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setScrollTarget(null);
      }
    }
  }, [location, scrollTarget]);

  const handleNavAndScroll = (targetId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setScrollTarget(targetId);
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    toggleMenu();
  };

  const renderNASADataLink = () => {
    if (location.pathname === '/') {
      return (
        <li className="navbar-list-item" onClick={()=> toggleMenu()}>
          <ScrollLink className="rem-default" to="apod" smooth={true} duration={500}>NASA Data</ScrollLink>
        </li>
      );
    } else {
      return (
        <li className="navbar-list-item" onClick={() => handleNavAndScroll('apod')}>
          <span className="rem-default">NASA Data</span>
        </li>
      );
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <NavLink to="/" onClick={() => scroll.scrollToTop()}>
          <img src={logo} alt="UrbanScope Logo" className="logo-img" />
        </NavLink>
      </div>
      <div className={`navigator ${isOpen ? 'open' : ''}`}>
        <ul className={`navbar-links ${isOpen ? 'open' : ''}`}>
          <li className="navbar-list-item" onClick={() => { scroll.scrollToTop(); toggleMenu(); }}>
            <NavLink className={({ isActive }) => ("rem-default " + (isActive ? ' active' : ''))} to="/">Home</NavLink>
          </li>
          <li className="navbar-list-item" onClick={()=>toggleMenu()}>
            <NavLink className={({ isActive }) => ("rem-default " + (isActive ? ' active' : ''))} to="/heat-risk">Heat Risk</NavLink>
          </li>
          <li className="navbar-list-item" onClick={()=>toggleMenu()}>
            <NavLink className={({ isActive }) => ("rem-default " + (isActive ? ' active' : ''))} to="/green-space">Green Space</NavLink>
          </li>
          <li className="navbar-list-item" onClick={()=>toggleMenu()}>
            <NavLink className={({ isActive }) => ("rem-default " + (isActive ? ' active' : ''))} to="/healthcare">Healthcare</NavLink>
          </li>
          <li className="navbar-list-item" onClick={()=>toggleMenu()}>
            <NavLink className={({ isActive }) => ("rem-default " + (isActive ? ' active' : ''))} to="/urban-vr">Urban VR</NavLink>
          </li>
          <li className="navbar-list-item" onClick={()=>toggleMenu()}>
            <NavLink className={({ isActive }) => ("rem-default " + (isActive ? ' active' : ''))} to="/maps-3d">3D Maps</NavLink>
          </li>
          <li className="navbar-list-item" onClick={toggleMenu}>
            <NavLink className={({ isActive }) => ("rem-default " + (isActive ? ' active' : ''))} to="/about">About</NavLink>
          </li>
        </ul>
      </div>
      <div className="hamburger" id="hamburger" onClick={toggleMenu} aria-label="Menu">
        <div className={`bar ${isOpen ? 'bar1-open' : ''}`}></div>
        <div className={`bar ${isOpen ? 'bar2-open' : ''}`}></div>
        <div className={`bar ${isOpen ? 'bar3-open' : ''}`}></div>
      </div>
    </nav>
  );
}

export default Navbar;
