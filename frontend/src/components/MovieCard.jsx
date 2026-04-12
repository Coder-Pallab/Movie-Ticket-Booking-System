import { Star, Clock, Ticket } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import timeFormat from '../lib/timeFormat';
import { useAppContext } from '../context/AppContext';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const { image_base_url } = useAppContext();

  const goToMovie = () => {
    navigate(`/movies/${movie._id}`);
    scrollTo(0, 0);
  };

  return (
    <div
      className="relative w-full max-w-55 flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: hovered
          ? '1px solid rgba(230,57,70,0.35)'
          : '1px solid rgba(255,255,255,0.07)',
        boxShadow: hovered
          ? '0 20px 48px rgba(0,0,0,0.6)'
          : '0 4px 20px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={goToMovie}
    >
      {/* Poster */}
      <div className="relative overflow-hidden aspect-2/3">
        <img
          src={image_base_url + movie.backdrop_path}
          alt={movie.title}
          className="w-full h-full object-cover transition-all duration-500"
          style={{
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            filter: hovered ? 'brightness(0.55)' : 'brightness(0.75)',
          }}
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />

        {/* Rating */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur border border-white/10">
          <Star className="w-3 h-3 text-red-500 fill-red-500" />
          <span className="text-[10px] font-mono font-semibold text-white">
            {movie.vote_average.toFixed(1)}
          </span>
        </div>

        {/* Genre */}
        {movie.genres?.[0] && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-red-500/90 backdrop-blur">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white font-semibold">
              {movie.genres[0].name}
            </span>
          </div>
        )}

        {/* Hover Button */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white text-xs font-mono uppercase tracking-widest shadow-lg">
            <Ticket className="w-3 h-3" />
            Buy Tickets
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 w-full px-3 pb-3 pt-6">
          <h3 className="text-sm font-bold text-white truncate">
            {movie.title}
          </h3>

          <div className="flex items-center gap-2 mt-1 text-[10px] text-white/50 font-mono tracking-wider">
            <span>{new Date(movie.release_date).getFullYear()}</span>
            <span className="w-1 h-1 bg-white/40 rounded-full"></span>
            <Clock className="w-3 h-3" />
            <span>{timeFormat(movie.runtime)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
      <div
        className="h-0.5 transition-all duration-300"
        style={{
          background: hovered
            ? 'linear-gradient(to right, #e63946, #c1121f)'
            : 'rgba(255,255,255,0.05)',
        }}
      />
    </div>
  );
};

export default MovieCard;