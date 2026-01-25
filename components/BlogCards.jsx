// import Image from "next/image";
// import Link from "next/link";
// import { Calendar, User, Tag, Bookmark, ArrowRight } from "lucide-react";
// import pool from "@/lib/db";
// import { Authorized } from "@/controllers/authControl";

// // Server Component - async function, no 'use client'
// export default async function BlogCards() {
//   const currUser = await Authorized();
//   // Fetch posts directly server-side
//   const result = await pool.query(
//     `
//   SELECT 
//     p.*, 
//     u.name,
//     EXISTS (
//       SELECT 1 
//       FROM bookmark_user bu
//       WHERE bu.post_id = p.id AND bu.user_id = $1
//     ) AS bookmarked_by_current_user
//   FROM posts p
//   JOIN users u ON p.user_id = u.id
//   WHERE p.public = TRUE
//   ORDER BY p.created_at DESC
// `,
//     [currUser?.user?.id],
//   );

//   const posts = result.rows;

//   const formattedDate = (date) => {
//     return new Date(date).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   return (
//     <div className="min-h-screen px-4 py-8 mt-8 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto @container">
//         <div className="mb-8">
//           <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
//             Latest Articles
//           </h1>
//           <p className="text-gray-600">
//             Discover our latest posts and insights
//           </p>
//         </div>

//         {/* Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
//         <div
//           className=" grid gap-6
//     grid-cols-1
//     @md:grid-cols-2
//     @xl:grid-cols-3"
//         >
//           {posts?.map((post) => (
//             <Link href={`/blog/${post.slug || post.id}`} key={post.id}>
//               <div className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
//                 {/* Thumbnail Image */}
//                 <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-200">
//                   <Image
//                     src={post.thumbnailimage}
//                     alt={post.title}
//                     fill
//                     className="object-cover group-hover:scale-110 transition-transform duration-500"
//                   />
//                   {/* Tag Badge */}
//                   <div className="absolute top-4 w-full flex items-center justify-end px-2 ">
//                     <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 backdrop-blur-sm">
//                       {post?.bookmarked_by_current_user ? (
//                         <Bookmark
//                           fill={"#028cdb"}
//                           stroke={"#028cdb"}
//                           className="w-3 h-3 cursor-pointer transition-colors hover:scale-110"
//                         />
//                       ) : (
//                         <Bookmark
//                           fill={"transparent"}
//                           stroke={"#333536"}
//                           className="w-3 h-3 cursor-pointer transition-colors hover:scale-110"
//                         />
//                       )}
//                       Bookmark
//                     </span>
//                   </div>
//                 </div>

//                 {/* Content */}
//                 <div className="p-5 sm:p-6 flex-1 flex flex-col">
//                   {/* Title */}
//                   <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
//                     {post.title}
//                   </h3>

//                   {/* Subtitle */}
//                   <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2 flex-1">
//                     {post.subtitle}
//                   </p>

//                   {/* Meta Info */}
//                   <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 mb-3">
//                     <div className="flex items-center gap-1.5">
//                       <User className="w-4 h-4" />
//                       <span>{post.name}</span>
//                     </div>
//                     <div className="flex items-center gap-1.5">
//                       <Calendar className="w-4 h-4" />
//                       <span>{formattedDate(post.created_at)}</span>
//                     </div>
//                   </div>
//                   <div>
//                     {post.tag.split(",").length > 1 ? (
//                       post.tag.split(",")?.map((e, ind) => (
//                         <span
//                           key={ind}
//                           className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs mr-2 font-semibold bg-blue-600 m-1 text-white backdrop-blur-sm"
//                         >
//                           <Tag className="w-3 h-3" />
//                           {e}
//                         </span>
//                       ))
//                     ) : (
//                       <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 m-1 text-white backdrop-blur-sm">
//                         <Tag className="w-3 h-3" />
//                         {post.tag}
//                       </span>
//                     )}
//                   </div>
//                   {/* Read More */}
//                   <div className="flex items-center text-blue-600 font-semibold text-md group-hover:gap-2 transition-all">
//                     Read More
//                     <span className="inline-block transition-transform group-hover:translate-x-1">
//                       <ArrowRight size={18} />
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>

//         {/* Empty State */}
//         {!posts || posts.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-gray-500 text-lg">No posts available yet.</p>
//           </div>
//         ) : null}
//       </div>
//     </div>
//   );
// }






import Image from "next/image";
import Link from "next/link";
import { Calendar, User, Tag, Bookmark, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import pool from "@/lib/db";
import { Authorized } from "@/controllers/authControl";

export default async function BlogCards({ page = 1, postsPerPage = 9, totalPosts = 0 }) {
  const currUser = await Authorized()
  const currentPage = Math.max(1, Number(page))
  
  // ✅ Server-side pagination query
  const offset = (currentPage - 1) * postsPerPage
  
  const result = await pool.query(
    `
    SELECT 
      p.*, 
      u.name,
      EXISTS (
        SELECT 1 
        FROM bookmark_user bu
        WHERE bu.post_id = p.id AND bu.user_id = $1
      ) AS bookmarked_by_current_user
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.public = TRUE
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3
  `,
    [currUser?.user?.id, postsPerPage, offset]
  )

  const posts = result.rows
  const totalPages = Math.ceil(totalPosts / postsPerPage)

  const formattedDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getPaginationRange = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  return (
    <div className="max-w-7xl mx-auto @container">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Latest Articles
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
           Discover our latest posts and insights from the Kode$word journey
        </p>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {posts?.map((post) => (
          <Link href={`/blog/${post.slug || post.id}`} key={post.id}>
            <div className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full flex flex-col border border-gray-100">
              {/* Thumbnail Image */}
              <div className="relative h-48 sm:h-56 lg:h-60 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                <Image
                  src={post.thumbnailimage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={currentPage === 1}
                />
                {/* Bookmark Badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-sm shadow-lg border">
                    {post?.bookmarked_by_current_user ? (
                      <Bookmark fill="#028cdb" stroke="#028cdb" className="w-3.5 h-3.5" />
                    ) : (
                      <Bookmark fill="none" stroke="#6b7280" className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">Bookmark</span>
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 lg:p-8 flex-1 flex flex-col">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>

                <p className="text-sm lg:text-base text-gray-600 mb-6 line-clamp-2 flex-1">
                  {post.subtitle}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-xs lg:text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>{post.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedDate(post.created_at)}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  {post.tag?.split(",").map((tag, ind) => {
                    const cleanTag = tag?.trim()
                    if (!cleanTag) return null
                    return (
                      <span
                        key={ind}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white mr-2 mb-1 shadow-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {cleanTag}
                      </span>
                    )
                  })}
                </div>

                {/* Read More */}
                <div className="flex items-center mt-auto text-blue-600 font-semibold text-base group-hover:gap-2 transition-all">
                  Read More
                  <ArrowRight className="w-5 h-5 inline-block transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ✅ SEO-Friendly Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Pages Info */}
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} • {totalPosts} articles total
            </div>

            {/* Pagination Controls */}
            <nav aria-label="Blog pagination" className="flex items-center gap-1">
              {/* Previous */}
              <Link
                href={`/blog${currentPage > 1 ? `?page=${currentPage - 1}` : ''}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-50 hover:shadow-md shadow-sm bg-white border border-blue-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Link>

              {/* Page Numbers */}
              <div className="flex items-center gap-0.5">
                {getPaginationRange().map((pageNum, index) => (
                  <Link
                    key={index}
                    href={`/blog${pageNum === '...' ? '' : `?page=${pageNum}`}`}
                    className={`flex items-center justify-center w-12 h-12 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                      pageNum === '...'
                        ? 'text-gray-400 cursor-default'
                        : currentPage == pageNum
                        ? 'bg-blue-600 text-white shadow-md scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </Link>
                ))}
              </div>

              {/* Next */}
              <Link
                href={currentPage < totalPages ? `/blog?page=${currentPage + 1}` : '/blog'}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-50 hover:shadow-md shadow-sm bg-white border border-blue-200'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!posts || posts.length === 0 ? (
        <div className="text-center py-24">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No posts yet</h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Stay tuned! New articles will appear here soon.
          </p>
        </div>
      ) : null}
    </div>
  )
}
