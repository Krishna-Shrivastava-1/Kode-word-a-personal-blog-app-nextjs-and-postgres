import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Calendar, User, Tag, Eye, Share, Bookmark } from 'lucide-react'
import Navbar from '@/components/Navbar'
import pool from '@/lib/db'
import PostViewCounter from '@/components/PostViewCounter'
import LikeButton from '@/components/LikeButton'
import { Authorized } from '@/controllers/authControl'
import BlogContentRenderer from '@/components/BlogContentRenderer'
import BookmarkButton from '@/components/BookmarkButton'
import ScrollProgress from '@/components/ScrollProgress'
import ShareButton from '@/components/ShareButton' // ✅ Import ShareButton

export default async function BlogPostPage({ params }) {
  const { id } = await params
  const currUser = await Authorized()

  const result = await pool.query(
    `
    SELECT 
      p.*, 
      u.name,
      COALESCE(
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id), 
        0
      ) AS like_count,
      COALESCE(
        (SELECT COUNT(*) FROM bookmark_user WHERE post_id = p.id), 
        0
      ) AS bookmark_count,
      EXISTS (
        SELECT 1 
        FROM post_likes
        WHERE post_id = p.id AND user_id = $2
      ) AS liked_by_current_user,
      EXISTS (
        SELECT 1 
        FROM bookmark_user
        WHERE post_id = p.id AND user_id = $2
      ) AS bookmarked_by_current_user
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = $1 AND p.public = TRUE
    `,
    [id, currUser?.user?.id]
  )

  const post = result.rows[0]

  if (!post) {
    notFound()
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <Navbar />
      <ScrollProgress />
      <PostViewCounter postId={post.id} />

      <article className="min-h-screen md:mt-0 mt-16 bg-gray-50">
        {/* Hero Section */}
        <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] object-cover bg-neutral-900 overflow-hidden bg-gradient-to-t from-neutral-900/90 via-white to-transparent">
          <Image
            src={post.thumbnailimage}
            alt={post.title}
            fill
            className="object-center object-contain opacity-85"
            priority
          />

          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-gray-900/40 to-transparent" />

          <div className="absolute inset-0 flex items-end">
            <div className="w-full p-4 sm:p-6 md:p-8 lg:p-12">
              <div className="max-w-5xl mx-auto">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white mb-3 sm:mb-4">
                  <Tag className="w-3 h-3" />
                  {post.tag}
                </span>

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2 sm:mb-3 line-clamp-3">
                  {post.title}
                </h1>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 leading-relaxed line-clamp-1 sm:line-clamp-2">
                  {post.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex  justify-between items-center gap-4 sm:gap-6 text-sm text-gray-600">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium text-nowrap">{post.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.views} views</span>
                </div>
              </div>

              {/* ✅ Added Share Button */}
              <div className="flex items-center gap-4 justify-end ">
                <div className="flex items-center gap-2">
                  <LikeButton
                    likebyCurrUser={post?.liked_by_current_user}
                    likeCount={post.like_count}
                    postId={id}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <BookmarkButton
                    likebyCurrUser={post?.bookmarked_by_current_user}
                    likeCount={post.bookmark_count}
                    postId={id}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <ShareButton 
                    postId={id} 
                    title={post.title} 
                    description={post.subtitle}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-2 py-8 sm:py-12">
          <div className="bg-white rounded-2xl overflow-x-auto text-wrap shadow-sm p-6 sm:p-8 lg:p-12">
            <BlogContentRenderer content={post.content} />
          </div>
        </div>
      </article>
    </>
  )
}

export async function generateMetadata({ params }) {
  const { id } = await params

  const result = await pool.query(
    'SELECT title, subtitle FROM posts WHERE id = $1',
    [id]
  )

  const post = result.rows[0]

  if (!post) return {}

  return {
    title: post.title,
    description: post.subtitle,
  }
}
