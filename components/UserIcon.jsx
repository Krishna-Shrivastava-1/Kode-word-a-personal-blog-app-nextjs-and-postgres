'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LogOut,
  User,
  Settings,
  Mail,
  Bookmark
} from "lucide-react"
import SearchBox from './SearchBox'

const UserIcon = () => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchLoggedUser = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('/api/auth/loggedinuser')
      
      if (data?.success) {
        setUserData(data)
      }
    } catch (error) {
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }
// console.log(userData)
  useEffect(() => {
    fetchLoggedUser()
  }, [])

const handleLogout = async () => {
  try {
    // 1. Clear backend FIRST
    await axios.post('/api/auth/logout')
    
    // 2. Hard refresh = Clean slate (middleware + state + cache)
    window.location.href = '/'
    
  } catch (error) {
    console.error('Logout error:', error)
    // Fallback: still hard refresh
    window.location.href = '/'
  }
}


  if (loading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
      </div>
    )
  }

  if (!userData?.success) {
    return (
      <div className="flex items-center gap-2 z-50">
        <div className='hidden md:flex  items-center'>
     <SearchBox />
     <Link href={'/contact'}>
                 <div className='flex items-center justify-center space-x-2 select-none cursor-pointer  ml-2'>
                     <Button variant='outline'>
                     <h1 className='font-medium '>Contact</h1>
                     </Button>
                 </div>
                </Link>
        <Link href={'/support'}>
                 <div className='flex items-center justify-center space-x-2 select-none cursor-pointer  ml-2'>
                     <Button variant='outline'>
                     <h1 className='font-medium '>Support</h1>
                     </Button>
                 </div>
                </Link>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9 px-3 hidden sm:flex text-center  items-center justify-center"
          asChild
        
        >
          <Link href="/sign-in">
            Sign in
          </Link>
        </Button>
        <Button 
          size="sm" 
          className="h-9 px-3"
          asChild
        >
          <Link href="/sign-up">
            Get started
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className='flex items-center gap-x-3 mx-4'>
      <div className='hidden sm:flex  items-center'>
     <SearchBox />
    <Link href={'/contact'}>
                 <div className='flex items-center justify-center space-x-2 select-none cursor-pointer  ml-2'>
                     <Button variant='outline'>
                     <h1 className='font-medium '>Contact</h1>
                     </Button>
                 </div>
                </Link>
    <Link href={'/support'}>
                 <div className='flex items-center justify-center space-x-2 select-none cursor-pointer  ml-2'>
                     <Button variant='outline'>
                     <h1 className='font-medium '>Support</h1>
                     </Button>
                 </div>
                </Link>
        </div>
        
        <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full"
          size="icon"
        >
          {/* ✅ SIMPLE CLEAN AVATAR */}
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={userData?.loggedUser?.image} 
              alt={userData?.loggedUser?.name}
              
            />
            <AvatarFallback className="bg-muted text-muted-foreground border">
              {userData?.loggedUser?.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          {/* ✅ Simple online dot */}
          {/* <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500 ring-white" /> */}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userData?.loggedUser?.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userData?.loggedUser?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/profile" className="w-full">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
{/*         
        <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground">
          <Mail className="mr-2 h-4 w-4" />
          <span>Inbox</span>
        </DropdownMenuItem> */}
        <Link href={'/bookmark'}>
           <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground">
          <Bookmark className="mr-2 h-4 w-4" />
          <span>Bookmarks</span>
          <span>{userData?.loggedUser?.bookmark_count>0 &&userData?.loggedUser?.bookmark_count}</span>
        </DropdownMenuItem>
        </Link>
     
        
        <DropdownMenuSeparator />
           <Link href={'/setting'}>
        <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-destructive hover:bg-destructive hover:text-accent focus:bg-destructive focus:text-destructive-foreground group select-none cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4 text-destructive group-hover:text-accent" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
   
  )
}

export default UserIcon
