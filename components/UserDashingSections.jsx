'use client'
import React, { useEffect, useState } from 'react'
import { AuroraText } from './ui/aurora-text'
import { Button } from './ui/button'
import Link from 'next/link'


const UserDashingSections = ({userData}) => {

  return (
    <div className='mt-20'>
        <div className='flex items-center justify-end w-full px-3'>{
          userData?.role === 'admin' && <Link href={'/admin'}>
          <Button>Go to Admin Page</Button>
          </Link>
        }</div>
      <h1 className='font-bold text-3xl text-center'>Hello, <AuroraText>{userData?.name}</AuroraText></h1>
    
    </div>
  )
}

export default UserDashingSections
