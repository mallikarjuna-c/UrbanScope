import React, { useEffect } from 'react';
import Typed from 'typed.js';
import Earth from '../3D_Models/Earth/Earth.jsx';

function Hero() {
  useEffect(() => {
    // Initialize Typed instance
    var typed = new Typed(".auto-typed", {
      strings: ["Healthier Cities.", "Cleaner Air.", "Greener Communities.", "Sustainable Future."],
      typeSpeed: 150,
      backSpeed: 70,
      loop: true
    });

    // Cleanup function to destroy Typed instance when component unmounts
    return () => {
      typed.destroy();
    };
  }, []); // Empty dependency array to run only once when component mounts

  return (
    <div className="container col-xxl-9 px-3 py-5 override-display">
      <div className="row flex-lg-row-reverse align-items-center g-5 py-5">
        <div className="col-10 col-sm-8 col-lg-6 flex justify-center" id="earth">
          <Earth />
        </div>
        <div className="col-lg-6">
          <h1 className="display-2 fw-bold text-light">Building <span className="highlight"><br /><span className="auto-typed"></span></span></h1>
          <p className="lead text-light">Welcome to UrbanScope, where NASA Earth observations reveal urban health patterns. Discover how heat islands, air quality, and green spaces impact community wellbeing through satellite data visualization and analysis.</p>
          <div className="d-grid gap-5 d-md-flex justify-content-md-start pt-2">
            <a href="#apod">
              <button type="button" className="btn btn-primary btn-lg px-4 me-md-2">Explore Data</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
