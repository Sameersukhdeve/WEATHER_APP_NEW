// ============================================================
// components/YouTubeSection.jsx
// ============================================================
// Shows YouTube travel videos for the searched location.
// Only appears if the YouTube API is configured AND returns results.
// ============================================================

import React from 'react';

const YouTubeSection = ({ videos, location }) => {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="youtube-section card">
      <p className="section-title">▶️ Explore {location} on YouTube</p>

      <div className="youtube-grid">
        {videos.map(video => (
          <a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="youtube-card"
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="youtube-thumb"
              loading="lazy"
            />
            <div className="youtube-info">
              <p className="youtube-title">{video.title}</p>
              <p className="youtube-channel">📺 {video.channelName}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default YouTubeSection;
