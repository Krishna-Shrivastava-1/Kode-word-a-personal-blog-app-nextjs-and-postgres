'use client'
import React, { useEffect, useState } from 'react'

export default function ScrollProgress() {
  const [scroll, setScroll] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = (scrollTop / scrollHeight) * 100
      setScroll(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      className="fixed top-0 left-0 h-1 z-50 bg-sky-500  transition-all duration-200 ease-out"
      style={{ width: `${scroll}%` }}
    />
  )
}
// bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500