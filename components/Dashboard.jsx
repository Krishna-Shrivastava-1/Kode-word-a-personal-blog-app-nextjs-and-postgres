import React from 'react'
import Navbar from './Navbar'
import UserDashingSections from './UserDashingSections'
import { Authorized } from '@/controllers/authControl'
import { getUserbyID } from '@/models/users'
import BlogCards from './BlogCards'
import Link from 'next/link'
import { Button } from './ui/button'

const Dashboard = async () => {
    const userDat = await Authorized()
    const getUserData = await getUserbyID(userDat?.user?.id)
   
  return (
    <div>
       <Navbar />
       <UserDashingSections userData={getUserData} />
       <BlogCards />
       <Link href={'/blog'} className='w-full flex items-center justify-center my-4'>
       <Button>Go to Blog Page</Button>
       </Link>
    </div>
  )
}

export default Dashboard
