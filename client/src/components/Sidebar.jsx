import { SignOutButton, useUser, useClerk } from '@clerk/react'
import { Eraser, FileText, Hash, House, Image, LogOut, Scissors, SquarePen, Users } from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
    {to: '/ai', label:'Dashboard', Icon: House},
    {to: '/ai/write-article', label:'Write Article', Icon: SquarePen},
    {to: '/ai/blog-titles', label:'Blog Titles', Icon: Hash},
    {to: '/ai/generate-images', label:'Generate Images', Icon: Image},
    {to: '/ai/remove-background', label:'Remove Background', Icon: Eraser},
    {to: '/ai/remove-object', label:'Remove Object', Icon: Scissors},
    {to: '/ai/review-resume', label:'Review Resume', Icon: FileText},
    {to: '/ai/community', label:'Community', Icon: Users},
]

const Sidebar = ({ sidebar, setSidebar}) => {

    const {user} = useUser()
    const {openUserProfile} = useClerk()

    if (!user) return null

  return (
    <div className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between h-full max-sm:absolute max-sm:top-14 max-sm:bottom-0 max-sm:z-50 sm:relative ${sidebar? 'max-sm:translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
      <div className='my-7 w-full px-6'>
        <img src={user.imageUrl} alt="User Avatar" className='w-13 rounded-full mx-auto'/>
        <h1 className='mt-1 text-center font-semibold'>{user.fullName}</h1>
        <div className='px-3 mt-5 text-sm text-gray-600 font-medium space-y-2'>
            {navItems.map(({to, label, Icon})=>(
                <NavLink key={to} to={to} end={to ==='/ai'} onClick={()=>setSidebar(false)} className={({isActive})=> `px-1.5 py-2.5 flex items-center gap-2 rounded transition-all whitespace-nowrap text-sm ${isActive ? 'bg-gradient-to-r from-[#3c81f6] to-[#9234ea] text-white' : 'hover:bg-gray-100' }`}>
                    {({isActive})=>(
                        <>
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                        <span className='text-sm'>{label}</span>
                        </>
                    )}
                </NavLink>
            ))}            
        </div>
      </div>
      <div className='w-full border-t border-gray-200 p-4 px-6 flex items-center justify-between gap-2'>
        <div onClick={() => openUserProfile()} className='flex gap-2 items-center flex-1 min-w-0 cursor-pointer hover:opacity-75 transition'>
            <img src={user.imageUrl} className='w-8 h-8 rounded-full flex-shrink-0' alt="" />
            <div className='min-w-0 flex-1'>
                <p className='text-sm font-medium truncate'>{user.fullName}</p>
                <p className='text-xs text-gray-500'>Premium Plan</p>
            </div>
        </div>
        <SignOutButton redirectUrl="/">
          <button className='p-1 hover:bg-gray-100 rounded transition'>
            <LogOut className='w-4 h-4 text-gray-600' />
          </button>
        </SignOutButton>
      </div>
    </div>
  )
}

export default Sidebar
