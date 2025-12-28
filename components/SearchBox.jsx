import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from './ui/input'
import { Search, X, Loader2, Tag } from 'lucide-react'
import { searchPosts } from '@/controllers/searchPosts'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchParams } from 'next/navigation'

const stripHtml = (html) => {
  if (!html) return ''
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

const SearchBox = () => {
    const searchParams = useSearchParams()
  const tagFromUrl = searchParams.get('tag')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (tagFromUrl && !open) {
      setQuery(tagFromUrl)
      setOpen(true)
      // Clear the URL param after triggering (optional, cleaner UX)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [tagFromUrl, open])
  // Debounce search query by 400ms
  const debouncedQuery = useDebounce(query, 400)

  // Search only when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      const search = async () => {
        setLoading(true)
        try {
          const response = await searchPosts(debouncedQuery)
          setResults(response.posts || [])
        } catch (error) {
          console.error('Search failed:', error)
          setResults([])
        } finally {
          setLoading(false)
        }
      }
      search()
    } else {
      setResults([])
      setLoading(false)
    }
  }, [debouncedQuery])

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen)
    if (!isOpen) {
      setQuery('')
      setResults([])
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
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
            </DialogTitle>
            
            <div className='relative'>
              <Input 
                placeholder='Type to search posts...' 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className='pl-10 pr-10'
                autoFocus
              />
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              {query && (
                <button
                  onClick={clearSearch}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  <X className='w-4 h-4' />
                </button>
              )}
            </div>
          </DialogHeader>
          
          <div className='mt-4 max-h-96 overflow-y-auto space-y-2'>
            {loading ? (
              <div className='flex flex-col items-center justify-center py-8 gap-2'>
                <Loader2 className='w-6 h-6 animate-spin text-blue-600' />
                <p className='text-gray-500 text-sm'>Searching...</p>
              </div>
            ) : results.length === 0 ? (
              query.trim() ? (
                <div className='text-center py-8'>
                  <p className='text-gray-500 mb-2'>No posts found for "{query}"</p>
                  <p className='text-xs text-gray-400'>Try different keywords</p>
                </div>
              ) : (
                <p className='text-gray-500 text-center py-8 italic'>
                  Start typing to search posts
                </p>
              )
            ) : (
              <>
                <p className='text-xs text-gray-500 px-1 mb-2'>
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
                {results.map((post) => (
                  <div 
                    key={post.id} 
                    className='border p-3 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors'
                    onClick={() => {
                      window.location.href = `/blog/${post.id}`
                      setOpen(false)
                    }}
                  >
                    <h3 className='font-bold text-lg group-hover:text-blue-600 line-clamp-1 mb-1'>
                      {post.title}
                    </h3>
                    <p className='text-sm text-gray-600 line-clamp-2 mb-2'>
                      {stripHtml(post.subtitle || post.content?.slice(0, 150))}
                    </p>
                    {post.tag && (
                     <div className="flex justify-start items-center  flex-wrap" >
                      {
                    
                      post.tag.split(',').length > 1 ?
                      post.tag.split(',')?.map((e,ind)=>(
                          <span
                          key={ind}
          className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 mx-2 rounded-full text-xs font-semibold bg-blue-600 text-white mb-3 sm:mb-4 cursor-pointer select-none hover:bg-blue-700 transition-colors"
         
        >
          <Tag className="w-3 h-3" />
          {e.trim()}
        </span>
                      ))
                      
                      :
                         <span
          className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 mx-2 rounded-full text-xs font-semibold bg-blue-600 text-white mb-3 sm:mb-4 cursor-pointer select-none hover:bg-blue-700 transition-colors"
 
        >
          <Tag className="w-3 h-3" />
          {post.tag.trim()}
        </span>
                    }
                    </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SearchBox
