import { Star, Clock, Ticket } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormat';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const goToMovie = () => { navigate(`/movies/${movie._id}`); scrollTo(0, 0); };

  return (
    <div
      className="relative flex flex-col rounded-xl overflow-hidden cursor-pointer"
      style={{
        width: 220,
        background: 'rgba(255,255,255,0.03)',
        border: hovered ? '1px solid rgba(230,57,70,0.35)' : '1px solid rgba(255,255,255,0.07)',
        boxShadow: hovered
          ? '0 20px 48px rgba(0,0,0,0.6), 0 0 0 0 transparent'
          : '0 4px 20px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={goToMovie}
    >
      {/* Poster image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '2/3', maxHeight: 280 }}>
        <img
          src={movie.backdrop_path}
          alt={movie.title}
          className="w-full h-full object-cover object-center"
          style={{
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.4s ease',
            filter: hovered ? 'brightness(0.55)' : 'brightness(0.75)',
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />

        {/* Rating badge — top right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-md"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Star style={{ width: 10, height: 10, fill: '#e63946', color: '#e63946' }} />
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: '0.65rem', letterSpacing: '0.06em', color: '#fff', fontWeight: 600 }}>
            {movie.vote_average.toFixed(1)}
          </span>
        </div>

        {/* Genre pill — top left */}
        {movie.genres?.[0] && (
          <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-md"
            style={{ background: 'rgba(230,57,70,0.8)', backdropFilter: 'blur(6px)' }}>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', fontWeight: 600 }}>
              {movie.genres[0].name}
            </span>
          </div>
        )}

        {/* Hover: Buy Tickets overlay */}
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease' }}>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full"
            style={{
              background: 'rgba(230,57,70,0.95)',
              boxShadow: '0 0 24px rgba(230,57,70,0.4)',
              fontFamily: "'Courier New', monospace",
              fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase',
              fontWeight: 700, color: '#fff',
              transform: hovered ? 'translateY(0)' : 'translateY(8px)',
              transition: 'transform 0.3s ease',
            }}>
            <Ticket style={{ width: 13, height: 13 }} />
            Buy Tickets
          </div>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6">
          <h3 className="font-bold leading-tight truncate"
            style={{ fontFamily: "'Georgia', serif", fontSize: '0.95rem', color: '#fff', letterSpacing: '-0.01em' }}>
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5"
            style={{ fontFamily: "'Courier New', monospace", fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)' }}>
            <span>{new Date(movie.release_date).getFullYear()}</span>
            <span style={{ width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
            <Clock style={{ width: 9, height: 9 }} />
            <span>{timeFormat(movie.runtime)}</span>
          </div>
        </div>
      </div>

      {/* Red accent bar at bottom */}
      <div style={{
        height: 2,
        background: hovered
          ? 'linear-gradient(to right, #e63946, #c1121f)'
          : 'rgba(255,255,255,0.04)',
        transition: 'background 0.3s ease',
      }} />
    </div>
  )
}

export default MovieCard