
import Navbar from '@/components/Navbar'
import { Authorized } from '@/controllers/authControl'
import pool from '@/lib/db'
import { Bookmark, Calendar, Tag, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const page = async() => {
    const userId = await Authorized()

  const result = await pool.query(`
  SELECT 
    p.*,           -- All post columns
    u.name as author_name
  FROM bookmark_user bu
  JOIN posts p ON bu.post_id = p.id
  JOIN users u ON p.user_id = u.id
  WHERE bu.user_id = $1
    AND p.public = TRUE
  ORDER BY p.created_at DESC
`, [userId?.user?.id])
const posts=result?.rows
// console.log(result?.rows)
  const formattedDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  return (
    <div>
      <Navbar />
       <div className="min-h-screen px-4 py-8 mt-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Bookmarked Articles
          </h1>
          {/* <p className="text-gray-600">Discover our latest posts and insights</p> */}
        </div>

        {/* Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {posts?.map((post) => (
            <Link href={`/blog/${post.id}`} key={post.id}>
              <div className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                {/* Thumbnail Image */}
                <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-200">
                  <Image
                    src={post.thumbnailimage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Tag Badge */}
                  <div className="absolute top-4 w-full flex items-center justify-between px-2 ">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 backdrop-blur-sm">
                      <Tag className="w-3 h-3" />
                      {post.tag}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 backdrop-blur-sm">
                    <Bookmark
          fill={ '#028cdb'}
          stroke={'#028cdb'}
          className="w-3 h-3 cursor-pointer transition-colors hover:scale-110"
        />
                      Bookmarked
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2 flex-1">
                    {post.subtitle}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>{post.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{formattedDate(post.created_at)}</span>
                    </div>
                  </div>

                  {/* Read More */}
                  <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                    Read More
                    <span className="inline-block transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {!posts || posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts bookmarked yet.</p>
          </div>
        ) : null}
      </div>
    </div>
    </div>
  )
}

export default page
