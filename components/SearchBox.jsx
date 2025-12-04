import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from './ui/input'
import { Search, X } from 'lucide-react'
import { searchPosts } from '@/controllers/searchPosts'

// Helper function to strip HTML tags and get plain text
const stripHtml = (html) => {
  if (!html) return ''
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

const SearchBox = () => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // Search on query change (INSTANT, NO BLOCKING)
  useEffect(() => {
    if (query.trim().length > 0) {
      const search = async () => {
        setLoading(true)
        const response = await searchPosts(query)
        setResults(response.posts || [])
        setLoading(false)
      }
      search()
    } else {
      setResults([])
    }
  }, [query])

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen)
    if (!isOpen) {
      setQuery('')
      setResults([])
    }
  }

  const clearSearch = () => {
    setQuery('')
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <div className='rounded-sm sm:border flex items-center justify-end p-1 px-2 gap-x-3 cursor-pointer py-2 hover:bg-gray-50 bg-white/55 transition-colors'>
             <Search className='w-4 h-4 block sm:hidden' />
            <p className='sm:font-medium font-semibold text-lg sm:text-sm'>Type to Search</p>
            <Search className='w-4 h-4 sm:block hidden' />
          </div>
        </DialogTrigger>
        <DialogContent className='max-w-2xl max-h-[80vh]'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Search className='w-5 h-5' />
                Search Posts
              </div>
              {/* {query && (
                <button
                  onClick={clearSearch}
                  className='text-gray-500 hover:text-gray-700 p-1'
                >
                  <X className='w-5 h-5' />
                </button>
              )} */}
            </DialogTitle>
            
            <div className='relative'>
              <Input 
                placeholder='Type to search posts...' 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className='pl-10 pr-4'
              />
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
            </div>
          </DialogHeader>
          
          {/* Results */}
          <div className='mt-4 max-h-96 overflow-y-auto space-y-2'>
            {loading ? (
              <div className='flex items-center justify-center py-8'>
                <p className='text-gray-500'>Searching...</p>
              </div>
            ) : results.length === 0 ? (
              query.trim() ? (
                <p className='text-gray-500 text-center py-8'>No posts found</p>
              ) : (
                <p className='text-gray-500 text-center py-8 italic'>
                  Start typing to search posts
                </p>
              )
            ) : (
              results.map((post) => (
                <div 
                  key={post.id} 
                  className='border p-3 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors'
                  onClick={() => {
                    window.location.href = `/blog/${post.id}`
                  }}
                >
                  <h3 className='font-bold text-lg group-hover:text-blue-600 line-clamp-1 mb-1'>
                    {post.title}
                  </h3>
                  <p className='text-sm text-gray-600 line-clamp-2 mb-2'>
                    {stripHtml(post.subTitle || post.content?.slice(0, 100) + '...')}
                  </p>
                  {post.tag && (
                    <span className='inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                      {post.tag}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SearchBox
