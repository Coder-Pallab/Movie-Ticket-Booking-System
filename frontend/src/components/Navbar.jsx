import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/react'

const Navbar = () => {

  const navigate = useNavigate()
  const [ isOpen, setIsOpen ] = useState(false);
  const {user} = useUser()
  const {openSignIn} = useClerk()

  return (
    <div className='fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5'>
      <Link to='/' className='max-md:flex-1'>
      <img src={assets.logo} alt="" className='w-36 h-auto'/>
      </Link>

      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 md:px-8 py-3 max-md:h-screen md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-[width] duration-300 ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}`}>

        <XIcon className='md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer' onClick={()=> setIsOpen(!isOpen)}/>

        <Link onClick={()=> {scrollTo(0, 0), setIsOpen(false)}} to='/'>Home</Link>
        <Link onClick={()=> {scrollTo(0, 0), setIsOpen(false)}} to='/movies'>Movies</Link>
        <Link onClick={()=> {scrollTo(0, 0), setIsOpen(false)}} to='/'>Theaters</Link>
        <Link onClick={()=> {scrollTo(0, 0), setIsOpen(false)}} to='/'>Releases</Link>
        <Link onClick={()=> {scrollTo(0, 0), setIsOpen(false)}} to='/favorites'>Favorites</Link>
      </div>

      <div className='flex items-center gap-8'>
        <SearchIcon className='max-md:hidden w-6 h-6 cursor-pointer'/>
        {
          !user ? (
            <button onClick={openSignIn} className='px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>Login</button>
          ) : (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action label='My bookings' labelIcon={<TicketPlus width={15}/>} onClick={()=> navigate('/my-bookings')}/>
              </UserButton.MenuItems>
            </UserButton>
          )
        }
        
      </div>

      <MenuIcon className='max-md:ml-4 md:hidden w-8 h-8 cursor-pointer' onClick={()=> setIsOpen(!isOpen)}/>
    </div>
  )
}

export default Navbar

// import React, { useState, useEffect } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { assets } from '../assets/assets'
// import { MenuIcon, SearchIcon, TicketPlus, XIcon } from 'lucide-react'
// import { useClerk, UserButton, useUser } from '@clerk/react'

// const NAV_LINKS = [
//   { label: 'Home',      to: '/' },
//   { label: 'Movies',    to: '/movies' },
//   { label: 'Theaters',  to: '/' },
//   { label: 'Releases',  to: '/' },
//   { label: 'Favorites', to: '/favorites' },
// ]

// const Navbar = () => {
//   const navigate = useNavigate()
//   const [isOpen, setIsOpen] = useState(false)
//   const [scrolled, setScrolled] = useState(false)
//   const { user } = useUser()
//   const { openSignIn } = useClerk()

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 24)
//     window.addEventListener('scroll', onScroll)
//     return () => window.removeEventListener('scroll', onScroll)
//   }, [])

//   const closeMenu = () => { scrollTo(0, 0); setIsOpen(false) }

//   return (
//     <nav
//       className={`fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 transition-all duration-500
//         ${scrolled
//           ? 'py-3 bg-black/90 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.06),0_8px_40px_rgba(0,0,0,0.7)]'
//           : 'py-5 bg-gradient-to-b from-black/70 to-transparent'
//         }`}
//     >
//       {/* Logo */}
//       <Link to='/' onClick={() => scrollTo(0, 0)} className='max-md:flex-1 transition-opacity duration-200 hover:opacity-80'>
//         <img src={assets.logo} alt="Logo" className='w-36 h-auto' />
//       </Link>

//       {/* Mobile Drawer */}
//       <div
//         className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-6
//           bg-[#04040a]/95 backdrop-blur-2xl
//           border-l border-white/5
//           transition-transform duration-300 ease-in-out
//           md:static md:inset-auto md:flex-row md:gap-1
//           md:bg-transparent md:backdrop-blur-none md:border-none
//           md:translate-x-0
//           ${isOpen ? 'translate-x-0' : '-translate-x-full'}
//         `}
//       >
//         {/* Red left-edge accent — mobile only */}
//         <span className='md:hidden absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-transparent via-primary to-transparent' />

//         {/* Close button — mobile only */}
//         <button
//           onClick={() => setIsOpen(false)}
//           className='md:hidden absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/40 transition-all duration-200'
//           aria-label="Close menu"
//         >
//           <XIcon className='w-4 h-4' />
//         </button>

//         {NAV_LINKS.map(({ label, to }) => (
//           <Link
//             key={label}
//             to={to}
//             onClick={closeMenu}
//             className='group relative
//               max-md:text-4xl max-md:font-black max-md:tracking-widest max-md:uppercase
//               max-md:text-white/40 max-md:hover:text-white max-md:transition-colors max-md:duration-200
//               md:px-4 md:py-1.5 md:text-[13px] md:font-medium md:tracking-widest md:uppercase
//               md:text-white/60 md:hover:text-white md:transition-colors md:duration-200'
//           >
//             {label}
//             {/* Underline — desktop only */}
//             <span className='max-md:hidden absolute bottom-0 left-4 h-px bg-primary w-0 group-hover:w-[calc(100%-32px)] transition-all duration-300 ease-out' />
//           </Link>
//         ))}
//       </div>

//       {/* Right actions */}
//       <div className='flex items-center gap-4'>
//         {/* Search */}
//         <button
//           aria-label="Search"
//           className='hidden md:flex w-9 h-9 items-center justify-center rounded-full border border-white/10 text-white/55 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all duration-200'
//         >
//           <SearchIcon className='w-4 h-4' />
//         </button>

//         {/* Auth */}
//         {!user ? (
//           <button
//             onClick={openSignIn}
//             className='relative overflow-hidden px-5 py-2 sm:px-7 sm:py-2 text-[13px] font-semibold tracking-widest uppercase text-white
//               bg-primary hover:bg-primary-dull rounded-sm
//               shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:shadow-[0_0_28px_rgba(229,9,20,0.6)]
//               transition-all duration-200 cursor-pointer
//               after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/20 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-200'
//           >
//             Sign In
//           </button>
//         ) : (
//           <UserButton>
//             <UserButton.MenuItems>
//               <UserButton.Action
//                 label='My bookings'
//                 labelIcon={<TicketPlus width={15} />}
//                 onClick={() => navigate('/my-bookings')}
//               />
//             </UserButton.MenuItems>
//           </UserButton>
//         )}
//       </div>

//       {/* Hamburger — mobile only */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         aria-label="Open menu"
//         className='md:hidden ml-3 flex items-center justify-center w-9 h-9 text-white/70 hover:text-white transition-colors duration-200'
//       >
//         <MenuIcon className='w-6 h-6' />
//       </button>
//     </nav>
//   )
// }

// export default Navbar