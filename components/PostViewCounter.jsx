'use client'
import { useEffect } from 'react'

export default function PostViewCounter({ postId }) {
  useEffect(() => {
    if (!postId) return

    const viewedKey = `viewed_post_${postId}`
    if (!sessionStorage.getItem(viewedKey)) {
      fetch('/api/post/incrementView', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
        .then(() => sessionStorage.setItem(viewedKey, 'true'))
        .catch(() => {})
    }
  }, [postId])

  return null
}
