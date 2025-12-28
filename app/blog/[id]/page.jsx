
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Calendar, User, Tag, Eye } from 'lucide-react'
import Navbar from '@/components/Navbar'
import pool from '@/lib/db'
import PostViewCounter from '@/components/PostViewCounter'
import LikeButton from '@/components/LikeButton'
import { Authorized } from '@/controllers/authControl'
import BlogContentRenderer from '@/components/BlogContentRenderer'
import BookmarkButton from '@/components/BookmarkButton'
import ScrollProgress from '@/components/ScrollProgress'
import ShareButton from '@/components/ShareButton'
import Link from 'next/link'

// ✅ Enhanced metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = await params

  try {
    const result = await pool.query(
      `SELECT 
        p.title, 
        p.subtitle, 
        p.tag, 
        p.content, 
        p.thumbnailimage,
        p.created_at, 
        u.name as author_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND p.public = TRUE`,
      [id]
    )

    if (result.rows.length === 0) {
      return {
        title: 'Post Not Found | Kode$word',
        description: 'The blog post you are looking for could not be found.'
      }
    }

    const post = result.rows[0]
    
    // Strip HTML from content for clean description
    const stripHtml = (html) => html?.replace(/<[^>]*>/g, '').trim() || ''
    const description = post.subtitle 
      ? stripHtml(post.subtitle).slice(0, 160)
      : stripHtml(post.content).slice(0, 160)

    // Generate keywords based on tag and content
    // const postKeywords = [
    //   post.tag,
    //   'programming tutorial',
    //   'coding guide',
    //   post.title.toLowerCase().split(' ').slice(0, 3).join(' '),
    //   'Kode$word'
    // ].filter(Boolean)
    const postKeywords = [
  'kodesword', // ← BRAND FIRST
  'kodesword ' + post.tag.toLowerCase(), // "kodesword spring boot"
  post.tag.toLowerCase(), // "spring boot"
  post.title.toLowerCase(),
  'programming tutorial',
  'Kode$word blog'
].filter(Boolean).slice(0, 10)

    return {
      title: post.title,
      description,
      keywords: postKeywords,
      
      authors: [{ name: post.author_name || 'Krishna Shrivastava' }],
      creator: post.author_name || 'Krishna Shrivastava',
      publisher: 'Kode$word',
      
      openGraph: {
        title: post.title,
        description,
        type: 'article',
        publishedTime: post.created_at,
        modifiedTime: post.updated_at || post.created_at,
        authors: [post.author_name || 'Krishna Shrivastava'],
        tags: post.tag ? [post.tag] : [],
        url: `https://kodesword.vercel.app/blog/${id}`,
        siteName: 'Kode$word',
        images: post.thumbnailimage ? [
          {
            url: post.thumbnailimage,
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ] : undefined,
      },
      
      alternates: {
        canonical: `https://kodesword.vercel.app/blog/${id}`,
      },
      
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
      
      other: {
        'article:published_time': post.created_at,
        'article:modified_time': post.updated_at || post.created_at,
        'article:author': post.author_name || 'Krishna Shrivastava',
        'article:tag': post.tag || 'Programming',
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Error | Kode$word',
      description: 'An error occurred while loading this blog post.'
    }
  }
}

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
  
  // ✅ Prepare data for JSON-LD
  const stripHtml = (html) => html?.replace(/<[^>]*>/g, '').trim() || ''
  const plainTextContent = stripHtml(post.content)
  const wordCount = plainTextContent.split(/\s+/).filter(word => word.length > 0).length

  // ✅ JSON-LD structured data for BlogPosting
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.subtitle || plainTextContent.slice(0, 160),
    "image": post.thumbnailimage || "https://kodesword.vercel.app/logo.png",
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": {
      "@type": "Person",
      "name": post.name || "Krishna Shrivastava",
      "url": "https://kodesword.vercel.app"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Kode$word",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kodesword.vercel.app/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://kodesword.vercel.app/blog/${id}`
    },
    "keywords": post.tag || "programming",
    "articleBody": plainTextContent.slice(0, 5000), // First 5000 chars
    "wordCount": wordCount,
    "url": `https://kodesword.vercel.app/blog/${id}`,
    "inLanguage": "en-US",
    "isAccessibleForFree": "True",
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": post.like_count || 0
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ReadAction",
        "userInteractionCount": post.views || 0
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/BookmarkAction",
        "userInteractionCount": post.bookmark_count || 0
      }
    ]
  };

  return (
    <>
      {/* ✅ JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
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
                {/* <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white mb-3 sm:mb-4">
                  <Tag className="w-3 h-3" />
                  {post.tag}
                </span> */}

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

        {/* ✅ Meta Info with semantic HTML */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center gap-4 sm:gap-6 text-sm text-gray-600">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium text-nowrap" itemProp="author">
                    {post.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.created_at} itemProp="datePublished">
                    {formattedDate}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.views} views</span>
                </div>
                
              </div>

              <div className="flex items-center gap-4 justify-end">
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
           <div className="max-w-4xl px-4 mx-auto ">
            <div className="flex justify-start items-center  flex-wrap" >
                      {
                    
                      post.tag.split(',').length > 1 ?
                      post.tag.split(',')?.map((e,ind)=>(
                          <Link
          key={ind}
          href={{ 
            pathname: `/blog/${id}`, // your current page
            query: { tag: e.trim() }
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 mx-2 rounded-full text-xs font-semibold bg-blue-600 text-white mb-3 sm:mb-4 cursor-pointer select-none hover:bg-blue-700 transition-colors"
          scroll={false} // prevents scroll jump
        >
          <Tag className="w-3 h-3" />
          {e.trim()}
        </Link>
                      ))
                      
                      :
                         <Link
          href={{ 
            pathname: `/blog/${id}`, // your current page
            query: { tag: post.tag.trim() }
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 mx-2 rounded-full text-xs font-semibold bg-blue-600 text-white mb-3 sm:mb-4 cursor-pointer select-none hover:bg-blue-700 transition-colors"
          scroll={false} // prevents scroll jump
        >
          <Tag className="w-3 h-3" />
          {post.tag.trim()}
        </Link>
                    }
                    </div>
           </div>
        </div>

        {/* ✅ Content with itemProp for structured data */}
        <div className="max-w-4xl mx-auto px-2 py-8 sm:py-12">
          <div className="bg-white rounded-2xl overflow-x-auto text-wrap shadow-sm p-6 sm:p-8 lg:p-12" itemProp="articleBody">
            <BlogContentRenderer content={post.content} />
          </div>
        </div>
      </article>
    </>
  )
}
