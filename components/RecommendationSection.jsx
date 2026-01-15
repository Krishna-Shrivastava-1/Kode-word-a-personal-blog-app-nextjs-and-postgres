import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const RecommendationSection = ({recommendationData}) => {
    
  return (
   <div className="w-full max-w-7xl mx-auto px-4 py-12">
  {recommendationData?.recommendations?.length > 0 && (
    <div className="flex flex-col gap-6">
      {/* Section Header */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Related Articles
        </h2>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recommendationData.recommendations.map((e) => (
          <Link 
            key={e.id} 
            href={`/blog/${e.slug}`}
            className="group flex flex-col bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-gray-100 dark:border-neutral-800 transition-all hover:shadow-lg hover:-translate-y-1"
          >
            {/* Image Container */}
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                fill
                src={e?.thumbnailimage}
                alt={e?.title}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Content Padding */}
            <div className="p-4 flex flex-col flex-1">
              <h3 className="text-lg font-bold leading-tight text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors line-clamp-2">
                {e?.title}
              </h3>
              {e?.subtitle && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {e?.subtitle}
                </p>
              )}
              
              {/* Optional: Add a "Read More" or Similarity Badge */}
              <div className="mt-auto pt-4 flex items-center text-xs font-medium text-blue-500">
                Read Article
                <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )}
</div>
  )
}

export default RecommendationSection
