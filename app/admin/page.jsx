'use client'
import PostsTable from '@/components/PostsTable'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Page = () => {
  const [postData, setpostData] = useState([])

  const fetchAllPost = async () => {
    try {
      const resp = await axios.get('/api/post/getallpost')
      if (resp?.data?.success) {
        setpostData(resp?.data?.posts)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    fetchAllPost()
  }, [])

  // 🔥 THIS FIXES YOUR UI UPDATE ISSUE
  const updatePostVisibility = (id, isPublic) => {
 
    setpostData(prev =>
      prev.map(p => (p.id === id ? { ...p, public: isPublic } : p))
    )
  }

  return (
    <div>
      Admin Page
      <PostsTable 
        postData={postData} 
        onUpdate={updatePostVisibility} 
      />
    </div>
  )
}

export default Page
