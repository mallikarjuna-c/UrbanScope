import React, { useState, useRef, useEffect } from 'react';
import './UrbanVR.css';

function UrbanVR() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Video data aligned with urban health theme
  const videos = [
    {
      id: 1,
      title: 'Urban Heat Island Visualization',
      description: 'Immersive 360° view of urban heat distribution patterns and their impact on city health',
      thumbnail: '/3dvideos/video1.mp4',
      src: '/3dvideos/video1.mp4',
      category: 'Heat Analysis'
    },
    {
      id: 2,
      title: 'Green Space Distribution',
      description: 'Explore urban green spaces and their accessibility from a 360° perspective',
      thumbnail: '/3dvideos/video2.mp4',
      src: '/3dvideos/video2.mp4',
      category: 'Green Infrastructure'
    },
    {
      id: 3,
      title: 'Air Quality Monitoring',
      description: 'Virtual tour through air quality zones in urban environments',
      thumbnail: '/3dvideos/video3.mp4',
      src: '/3dvideos/video3.mp4',
      category: 'Environmental Health'
    },
    {
      id: 4,
      title: 'Urban Development Overview',
      description: 'Comprehensive 360° view of urban development and health infrastructure',
      thumbnail: '/3dvideos/video4.mp4',
      src: '/3dvideos/video4.mp4',
      category: 'Urban Planning'
    },
    {
      id: 5,
      title: 'Healthcare Accessibility',
      description: 'Immersive visualization of healthcare facility distribution in cities',
      thumbnail: '/3dvideos/video5.mp4',
      src: '/3dvideos/video5.mp4',
      category: 'Healthcare Access'
    },
    {
      id: 6,
      title: 'Sustainable City Vision',
      description: '360° tour of sustainable urban design and healthy city planning',
      thumbnail: '/3dvideos/video6.mp4',
      src: '/3dvideos/video6.mp4',
      category: 'Sustainability'
    },
    {
      id: 7,
      title: 'Urban Health Indicators',
      description: 'Interactive 360° exploration of key urban health metrics and patterns',
      thumbnail: '/3dvideos/video7.mp4',
      src: '/3dvideos/video7.mp4',
      category: 'Health Metrics'
    },
    {
      id: 8,
      title: 'Smart City Infrastructure',
      description: 'Immersive view of smart city technologies and urban health monitoring systems',
      thumbnail: '/3dvideos/video8.mp4',
      src: '/3dvideos/video8.mp4',
      category: 'Smart Cities'
    },
    {
      id: 9,
      title: 'Climate Resilience Planning',
      description: '360° visualization of climate adaptation strategies and urban resilience measures',
      thumbnail: '/3dvideos/video9.mp4',
      src: '/3dvideos/video9.mp4',
      category: 'Climate Action'
    }
  ];

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="urban-vr-page">
      {/* Header Section */}
      <section className="vr-header">
        <div className="vr-header-content">
          <h1 className="vr-title">🥽 Urban Health VR Experience</h1>
          <p className="vr-subtitle">
            Immersive 360° visualization of urban health data and city environments
          </p>
          <div className="vr-badges">
            <span className="vr-badge">🌍 360° Videos</span>
            <span className="vr-badge">🏙️ Urban Health</span>
            <span className="vr-badge">📊 Data Visualization</span>
          </div>
        </div>
      </section>

      {/* Video Player Section */}
      {selectedVideo && (
        <section className="vr-player-section">
          <div className="container">
            <div className="vr-player-container" ref={containerRef}>
              <video
                ref={videoRef}
                className="vr-video-player"
                src={selectedVideo.src}
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <div className="vr-controls">
                <button className="vr-control-btn" onClick={togglePlay}>
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </button>
                <button className="vr-control-btn" onClick={toggleFullscreen}>
                  {isFullscreen ? '🗗 Exit Fullscreen' : '⛶ Fullscreen'}
                </button>
              </div>
              <div className="vr-video-info">
                <h3>{selectedVideo.title}</h3>
                <p>{selectedVideo.description}</p>
                <span className="vr-category-badge">{selectedVideo.category}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Video Gallery Section */}
      <section className="vr-gallery-section">
        <div className="container">
          <h2 className="section-title">
            {selectedVideo ? 'Select Another Experience' : 'Choose Your VR Experience'}
          </h2>
          <div className="vr-gallery-grid">
            {videos.map((video) => (
              <div
                key={video.id}
                className={`vr-card ${selectedVideo?.id === video.id ? 'active' : ''}`}
                onClick={() => handleVideoSelect(video)}
              >
                <div className="vr-card-thumbnail">
                  <video
                    src={video.thumbnail}
                    muted
                    loop
                    autoPlay
                    playsInline
                    className="vr-thumbnail-video"
                  />
                  <div className="vr-card-overlay">
                    <span className="vr-play-icon">▶️</span>
                  </div>
                </div>
                <div className="vr-card-content">
                  <span className="vr-card-category">{video.category}</span>
                  <h3 className="vr-card-title">{video.title}</h3>
                  <p className="vr-card-description">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}

export default UrbanVR;
