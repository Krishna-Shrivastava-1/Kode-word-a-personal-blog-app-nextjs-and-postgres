import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Calendar, User, Tag, Eye, Linkedin, Github } from 'lucide-react'
import Navbar from '@/components/Navbar'
import pool from '@/lib/db'
import LikeButton from '@/components/LikeButton'
import { Authorized } from '@/controllers/authControl'
import BlogContentRenderer from '@/components/BlogContentRenderer'
import BookmarkButton from '@/components/BookmarkButton'
import ScrollProgress from '@/components/ScrollProgress'
import ShareButton from '@/components/ShareButton'
import Link from 'next/link'
import { IconBrandLinkedin } from '@tabler/icons-react'



const  Page =async({ params })=> {
  const { id } = await params
  const currUser = await Authorized()

  const result = await pool.query(
    `
    SELECT 
      p.*, 
      u.name,
      COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = p.id), 0) AS like_count,
      COALESCE((SELECT COUNT(*) FROM bookmark_user WHERE post_id = p.id), 0) AS bookmark_count,
      EXISTS (SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $2) AS liked_by_current_user,
      EXISTS (SELECT 1 FROM bookmark_user WHERE post_id = p.id AND user_id = $2) AS bookmarked_by_current_user
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE (p.id::text = $1 OR p.slug = $1) AND p.public = TRUE
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
  
  const stripHtml = (html) => html?.replace(/<[^>]*>/g, '').trim() || ''
  const plainTextContent = stripHtml(post.content)
  const wordCount = plainTextContent.split(/\s+/).filter(word => word.length > 0).length

  // ✅ 2. SCHEMA: Upgraded to 'TechArticle' + 'BreadcrumbList'
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle", // Better for code/tutorials than BlogPosting
      "headline": post.title,
      "description": post.subtitle || plainTextContent.slice(0, 160),
      "image": post.thumbnailimage || "https://kodesword.vercel.app/logo.png",
      "datePublished": post.created_at,
      "dateModified": post.created_at, // Use created_at as fallback
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
        "@id": `https://kodesword.vercel.app/blog/${post.slug}`
      },
      "keywords": post.tag || "programming",
      "articleBody": plainTextContent.slice(0, 5000),
      "wordCount": wordCount,
      "inLanguage": "en-US",
      "proficiencyLevel": "Beginner", // Helps Google categorize difficulty
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList", // Shows site hierarchy in search results
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kodesword.vercel.app" },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://kodesword.vercel.app/blog" },
        { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://kodesword.vercel.app/blog/${post.slug }` }
      ]
    }
  ];

  return (
    <>
      {/* ✅ JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      
      {/* <Navbar /> */}
      {/* <ScrollProgress /> */}
   

      <article className="min-h-screen  bg-gray-50">
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
                    postId={post.id}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <BookmarkButton
                    likebyCurrUser={post?.bookmarked_by_current_user}
                    likeCount={post.bookmark_count}
                    postId={post.id}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <ShareButton 
                    postId={post.slug} 
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
            pathname: `/blog/${post.slug}`, // your current page
            query: { tag: e.trim() }
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 mx-2 rounded-full text-xs  bg-blue-600/50 border font-bold border-blue-600 text-blue-700 mb-3 sm:mb-4 cursor-pointer select-none hover:bg-blue-700 hover:text-white transition-colors"
          scroll={false} // prevents scroll jump
        >
          <Tag className="w-3 h-3" />
          {e.trim()}
        </Link>
                      ))
                      
                      :
                          <Link
          href={{ 
            pathname: `/blog/${post.slug}`, // your current page
            query: { tag: post.tag.trim() }
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 mx-2 rounded-full text-xs  bg-blue-600/50 border font-bold border-blue-600 text-blue-700 mb-3 sm:mb-4 cursor-pointer select-none hover:bg-blue-700 hover:text-white transition-colors"
          scroll={false} // prevents scroll jump
        >
          <Tag className="w-3 h-3" />
          {post.tag.trim()}
        </Link>
                    }
                    </div>
           </div>
           <div className="max-w-4xl px-4 mx-auto  ">
            <div className="flex justify-center items-center mb-4 mt-2" >
                       <div className=" mx-3">
                  <Link href='https://www.linkedin.com/in/krishna-shrivastava-62b72129a/' target='_blank'><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="auto" viewBox="0 0 48 48">
<path fill="#0288D1" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"></path><path fill="#FFF" d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"></path>
</svg></Link>
                  
                </div>
                <div className=" mx-3">
                  <Link href='https://github.com/Krishna-Shrivastava-1' target='_blank'><Image className='min-w-[30px]' src='https://img.icons8.com/?size=100&id=3tC9EQumUAuq&format=png&color=000000' alt='Github icon' width={30} height={100} /> </Link>
                  
                </div>
                    </div>
           </div>
        </div>

        {/* ✅ Content with itemProp for structured data */}
        <div className="max-w-4xl mx-auto  px-2 py-8 sm:py-8">
          <div className="bg-white rounded-2xl overflow-x-auto text-wrap shadow-sm p-6 sm:p-8 lg:p-12" itemProp="articleBody">
            <BlogContentRenderer content={post.content} />
          </div>
        </div>
      </article>
    </>
  )
}
export default Page