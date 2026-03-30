import React, { useEffect, useRef } from 'react'
import { assets } from '../assets/assets'
import { ArrowRight, CalendarIcon, Clock, Star, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Parallax effect on mouse move
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * 10;
      el.style.setProperty('--px', `${x}px`);
      el.style.setProperty('--py', `${y}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-section relative flex flex-col items-start justify-end pb-24 px-6 md:px-16 lg:px-36 h-screen overflow-hidden"
      style={{ '--px': '0px', '--py': '0px' }}
    >

      {/* Background image with subtle parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 transition-transform"
        style={{
          backgroundImage: 'url("/backgroundImage.png")',
          transform: 'translate(var(--px), var(--py)) scale(1.1)',
          transition: 'transform 0.1s ease-out',
        }}
      />

      {/* Deep cinematic gradient overlays */}
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/30 to-transparent" />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Decorative vertical line */}
      <div className="absolute left-6 md:left-16 lg:left-36 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-start gap-5 max-w-2xl hero-content">

        {/* Logo */}
        <img
          src={assets.marvelLogo}
          alt="Marvel"
          className="h-8 lg:h-9 w-auto object-contain hero-logo"
        />

        {/* Rating badge */}
        <div className="flex items-center gap-2 hero-badge">
          <div className="flex items-center gap-1 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-sm">
            <Star className="w-3 h-3 fill-yellow-400" />
            <span>8.0 / 10 · IMDb</span>
          </div>
          <span className="text-xs text-white/40 tracking-widest uppercase font-medium">Vol. 1</span>
        </div>

        {/* Title */}
        <h1
          className="font-black tracking-tight leading-none hero-title"
          style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontFamily: "'Georgia', serif",
            textShadow: '0 4px 40px rgba(0,0,0,0.8)',
            letterSpacing: '-0.02em',
          }}
        >
          Guardians <br />
          <span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)', color: 'transparent' }}>
            of the
          </span>{' '}
          <span className="text-white">Galaxy</span>
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/50 hero-meta" style={{ fontFamily: "'Courier New', monospace", letterSpacing: '0.05em' }}>
          <span className="text-white/70 uppercase text-xs tracking-widest">Action · Adventure · Sci-Fi</span>
          <span className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>2014</span>
          </div>
          <span className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>2h 8m</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-16 h-px bg-linear-to-r from-white/40 to-transparent hero-divider" />

        {/* Description */}
        <p
          className="text-sm leading-relaxed text-white/55 max-w-md hero-desc"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Brash space adventurer Peter Quill finds himself the quarry of relentless bounty hunters
          after he steals an orb coveted by Ronan. To survive, he forges an uneasy truce with four
          misfits — and together, they might just save the galaxy.
        </p>

        {/* CTA row */}
        <div className="flex items-center gap-4 pt-2 hero-cta">
          <button
            onClick={() => navigate('/movies')}
            className="group relative flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold tracking-wide overflow-hidden rounded-full cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #e63946, #c1121f)',
              boxShadow: '0 0 30px rgba(230,57,70,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              letterSpacing: '0.06em',
              fontFamily: "'Courier New', monospace",
              textTransform: 'uppercase',
            }}
          >
            <span className="relative z-10">Explore Movies</span>
            <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            {/* Shimmer */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'linear-gradient(135deg, #ff6b6b, #e63946)' }}
            />
          </button>

          <button
            className="group flex items-center gap-2.5 px-5 py-3.5 text-sm text-white/70 hover:text-white transition-colors duration-200 cursor-pointer"
            style={{ fontFamily: "'Courier New', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 group-hover:border-white/50 transition-colors duration-300">
              <Play className="w-3.5 h-3.5 fill-white" />
            </span>
            Watch Trailer
          </button>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black to-transparent pointer-events-none" />

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-logo   { animation: fadeUp .6s ease both .1s; }
        .hero-badge  { animation: fadeUp .6s ease both .2s; }
        .hero-title  { animation: fadeUp .7s ease both .3s; }
        .hero-meta   { animation: fadeUp .6s ease both .45s; }
        .hero-divider{ animation: fadeUp .6s ease both .55s; }
        .hero-desc   { animation: fadeUp .6s ease both .65s; }
        .hero-cta    { animation: fadeUp .6s ease both .75s; }
      `}</style>
    </div>
  )
}

export default HeroSection