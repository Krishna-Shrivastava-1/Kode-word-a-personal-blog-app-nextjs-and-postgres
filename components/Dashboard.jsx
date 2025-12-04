import React from 'react'
import Navbar from './Navbar'
import UserDashingSections from './UserDashingSections'
import { Authorized } from '@/controllers/authControl'
import { getUserbyID } from '@/models/users'
import BlogCards from './BlogCards'

const Dashboard = async () => {
    const userDat = await Authorized()
    const getUserData = await getUserbyID(userDat?.user?.id)
   
  return (
    <div>
       <Navbar />
       <UserDashingSections userData={getUserData} />
       <BlogCards />
    </div>
  )
}

export default Dashboard
