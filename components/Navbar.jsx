'use client'
import React, { useEffect, useState } from 'react'
import UserIcon from './UserIcon'
import Image from 'next/image'
import logo from '../public/logo.png'
import Link from 'next/link'
import SearchBox from './SearchBox'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { FieldSeparator } from './ui/field'
import { useAuth } from './ContextAPI'
const Navbar = () => {
    const {UserData} = useAuth()
    const [scrolledMore, setscrolledMore] = useState(false)
    useEffect(() => {
        const handScroll =()=>{
            if (window.scrollY > 70) {
                setscrolledMore(true)
            } else {
                setscrolledMore(false)
            }
        }
        window.addEventListener('scroll',handScroll)
        return ()=>window.removeEventListener('scroll', handScroll);
    }, [])

    return (
        <div className={`w-full flex items-center justify-between z-50 fixed top-0 transition-all bg-white/15 duration-300 p-2 px-4 ${scrolledMore ? ' backdrop-blur-md' : 'bg-transparent'}`}>
            <div className='md:hidden block'>
                <Sheet>
  <SheetTrigger><Menu /></SheetTrigger>
  <SheetContent side='left'>
    <SheetHeader>
      <SheetTitle> <Link href={'/'}>
            <div className='flex items-center justify-center space-x-2 select-none cursor-pointer'>
                <Image priority src={logo} alt='Logo' width={75} height={70} />
                <span className='font-semibold text-xl '>Kode$word</span>
            </div>
           </Link></SheetTitle>
   
       <div>
   <Link href={'/'}>
            <div className='flex items-center justify-center space-x-2 select-none cursor-pointer'>

                <span className='font-semibold text-xl '>Home</span>
            </div>
           </Link>
             <FieldSeparator />
            <Link href={'/bookmark'}>
            <div className='flex items-center justify-center space-x-2 select-none cursor-pointer'>

                <span className='font-semibold text-xl '>Bookmark</span>
            </div>
           </Link>
           <FieldSeparator />
           
   <Link href={'/contact'}>
            <div className='flex items-center justify-center space-x-2 select-none cursor-pointer'>

                <span className='font-semibold text-xl '>Contact</span>
            </div>
           </Link>
           <FieldSeparator />
              <Link href={'/support'}>
            <div className='flex items-center justify-center space-x-2 select-none cursor-pointer'>

                <span className='font-semibold text-xl '>Support</span>
            </div>
           </Link>
         
           <FieldSeparator />
       {/*  Search bar removed from sheet */}
            {/* <div className='flex items-center justify-center space-x-2 select-none cursor-pointer'>
<SearchBox />
             
            </div> */}
              {/* <FieldSeparator /> */}
              {
                !UserData && <div className='flex items-center justify-center space-x-2 select-none cursor-pointer'>
<UserIcon />
             
            </div>
              }
           
         
       </div>
     
    </SheetHeader>
  </SheetContent>
</Sheet>

            </div>
           <Link href={'/'}>
            <div className='flex items-center justify-center space-x-2 select-none cursor-pointer'>
                <Image priority src={logo} alt='Logo' width={40} height={10} />
                <span className='font-semibold text-xl '>Kode$word</span>
            </div>
           </Link>
           <div className='hidden sm:block'>

           
           </div>

            <UserIcon />
        </div>
    )
}

export default Navbar
