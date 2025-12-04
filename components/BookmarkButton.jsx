'use client'
import { Bookmark, Heart } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useAuth } from './ContextAPI'
import { Button } from './ui/button'
import Link from 'next/link'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Loader2 } from 'lucide-react'

const BookmarkButton = ({ postId, likeCount, likebyCurrUser }) => {
  const { UserData } = useAuth()

  // Loading state while waiting for UserData
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [liked, setLiked] = useState(likebyCurrUser)
  const [count, setCount] = useState(likeCount)

  // Update state if props change
  useEffect(() => {
    setLiked(likebyCurrUser)
  }, [likebyCurrUser])

  useEffect(() => {
    setCount(likeCount)
  }, [likeCount])

  // Set loading false once UserData is available
  useEffect(() => {
    if (UserData !== undefined) {
      setIsLoadingUser(false)
    }
  }, [UserData])

  const handleLikeToggle = async () => {
    // Skip if still loading user data
    if (isLoadingUser) return

    if (!UserData?.id) {
      return // Let popover handle it
    }

    try {
      const res = await fetch('/api/post/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: UserData.id, postid: postId }),
      })

      const data = await res.json()
      if (data.success) {
        setLiked(data.liked)
        setCount(data.likeCount)
      } else {
        alert('Failed to update like: ' + (data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Like toggle error:', error)
      alert('Server error while updating like')
    }
  }

  // Show loading spinner while checking user data
  if (isLoadingUser) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>0</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleLikeToggle}
      className="flex items-center gap-2 focus:outline-none"
      aria-pressed={liked}
      aria-label={liked ? 'Unlike post' : 'Like post'}
    >
      {!UserData?.id ? (
        <Popover>
          <PopoverTrigger asChild>
            <Bookmark
              fill={liked ? '#028cdb' : 'none'}
              stroke={liked ? '#028cdb' : 'currentColor'}
              className="w-5 h-5 cursor-pointer transition-colors"
            />
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-gray-900">
                Sign in to Bookmark posts
              </h3>
              <p className="text-sm text-gray-600">
                Bookmark posts and save your favorites by signing in.
              </p>
              <Link href="/sign-in" className="w-full">
                <Button className="w-full">Sign In</Button>
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Bookmark
          fill={liked ? '#028cdb' : 'none'}
          stroke={liked ? '#028cdb' : 'currentColor'}
          className="w-5 h-5 cursor-pointer transition-colors hover:scale-110"
        />
      )}
      {/* <span className="font-semibold">{count}</span> */}
    </button>
  )
}

export default BookmarkButton
