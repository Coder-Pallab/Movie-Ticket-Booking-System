import React from 'react'
import { assets } from '../assets/assets'
import { ArrowRight, CalendarIcon, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {

  const navigate = useNavigate();
  return (
    <div className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("/backgroundImage.png")] bg-cover bg-center h-screen'>
      <img src={assets.marvelLogo} alt="" className='max-h-11 lg:h-11 mt-20'/>
      <h1 className='text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110'>Guardians <br/> of the Galaxy</h1>
      <div className='flex items-center gap-4 text-gray-300'>
          <span>Action {" "} | {" "} Adventure {" "} | {" "} Sci-Fi</span>
          <div className='flex items-center gap-1'>
            <CalendarIcon className='w-4.5 h-4.5'/> 2018
          </div>

          <div className='flex items-center gap-1'>
            <Clock className='w-4.5 h-4.5'/> 2h 8m
          </div>
      </div>
      <p className='max-w-md text-sm text-gray-300'>Brash space adventurer Peter Quill finds himself the quarry of relentless bounty hunters after he steals an orb coveted by Ronan, a powerful villain. To evade Ronan, Quill is forced into an uneasy truce with four disparate misfits: gun-toting Rocket Raccoon, treelike-humanoid Groot, enigmatic Gamora, and vengeance-driven Drax the Destroyer.</p>

      <button onClick={()=> navigate('/movies')} className='group flex items-center gap-2 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>
        Explore Movies
        <ArrowRight className='w-5 h-5 transition duration-300 group-hover:translate-x-1'/>
      </button>
    </div>
  )
}

export default HeroSection