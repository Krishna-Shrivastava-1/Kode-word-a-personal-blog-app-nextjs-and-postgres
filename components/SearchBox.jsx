// import React, { useState, useEffect } from 'react'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Input } from './ui/input'
// import { Search, X, Loader2, Tag } from 'lucide-react'
// import { searchPosts } from '@/controllers/searchPosts'
// import { useDebounce } from '@/hooks/useDebounce'
// import { useSearchParams } from 'next/navigation'

// const stripHtml = (html) => {
//   if (!html) return ''
//   const div = document.createElement('div')
//   div.innerHTML = html
//   return div.textContent || div.innerText || ''
// }

// // ─── Outside component — shared media query hook ──────────────────────────────
// function useIsMd() {
//   const [isMd, setIsMd] = useState(false)
//   const [mounted, setMounted] = useState(false)
//   useEffect(() => {
//     const mq = window.matchMedia('(min-width: 768px)')
//     setIsMd(mq.matches)
//     setMounted(true)
//     const fn = (e) => setIsMd(e.matches)
//     mq.addEventListener('change', fn)
//     return () => mq.removeEventListener('change', fn)
//   }, [])
//   return { isMd, mounted }
// }

// const SearchBox = ({ showText = true }) => {
//   const { isMd, mounted } = useIsMd()
//   const searchParams = useSearchParams()
//   const tagFromUrl = searchParams.get('tag')
//   const [open, setOpen] = useState(false)
//   const [query, setQuery] = useState('')
//   const [results, setResults] = useState([])
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     if (tagFromUrl && !open) {
//       if (!mounted) return
//       if (showText && !isMd) return
//       if (!showText && isMd) return
//       setQuery(tagFromUrl)
//       setOpen(true)
//       window.history.replaceState({}, '', window.location.pathname)
//     }
//   }, [tagFromUrl, open, isMd, showText, mounted])

//   useEffect(() => {
//     const handler = (e) => {
//       if (e.ctrlKey && e.key === 'k') {
//         e.preventDefault()
//         if (!mounted) return
//         if (showText && !isMd) return
//         if (!showText && isMd) return
//         setOpen(true)
//       }
//     }
//     window.addEventListener('keydown', handler)
//     return () => window.removeEventListener('keydown', handler)
//   }, [isMd, showText, mounted])

//   const debouncedQuery = useDebounce(query, 400)

//   useEffect(() => {
//     if (debouncedQuery.trim().length > 0) {
//       const search = async () => {
//         setLoading(true)
//         try {
//           const response = await searchPosts(debouncedQuery)
//           setResults(response.posts || [])
//         } catch (error) {
//           console.error('Search failed:', error)
//           setResults([])
//         } finally {
//           setLoading(false)
//         }
//       }
//       search()
//     } else {
//       setResults([])
//       setLoading(false)
//     }
//   }, [debouncedQuery])

//   const handleOpenChange = (isOpen) => {
//     setOpen(isOpen)
//     if (!isOpen) {
//       setQuery('')
//       setResults([])
//     }
//   }

//   const clearSearch = () => {
//     setQuery('')
//     setResults([])
//   }

//   return (
//     <div>
//       <Dialog open={open} onOpenChange={handleOpenChange}>
//         <DialogTrigger asChild>
//           <div className='rounded-sm sm:border flex items-center justify-end p-1 px-2 gap-x-3 cursor-pointer py-2 hover:bg-gray-50 bg-white/55 transition-colors'>
//             {/* Mobile — icon only */}
//             <Search className='w-4 h-4 sm:hidden' />

//             {/* Desktop — text + shortcut badge */}
//             {showText && (
//               <div className='hidden sm:flex items-center gap-2'>
//                 <p className='font-medium text-sm text-gray-700'>Type to Search</p>
//                 <div className='flex items-center gap-0.5'>
//                   <kbd className='inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-300 rounded'>
//                     <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
//                     </svg>
//                   </kbd>
//                   <kbd className='inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-300 rounded'>
//                     K
//                   </kbd>
//                 </div>
//               </div>
//             )}

//             {/* Desktop search icon when showText is false */}
//             {!showText && <Search className='w-4 h-4 hidden sm:block' />}
//           </div>
//         </DialogTrigger>

//         <DialogContent className='max-w-2xl max-h-[80vh]'>
//           <DialogHeader>
//             <DialogTitle className='flex items-center justify-between'>
//               <div className='flex items-center gap-2'>
//                 <Search className='w-5 h-5' />
//                 Search Blogs
//               </div>
//             </DialogTitle>

//             <div className='relative'>
//               <Input
//                 placeholder='Type to search blogs...'
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 className='pl-10 pr-10'
//                 autoFocus
//               />
//               <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
//               {query && (
//                 <button
//                   onClick={clearSearch}
//                   className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
//                 >
//                   <X className='w-4 h-4' />
//                 </button>
//               )}
//             </div>
//           </DialogHeader>

//           <div className='mt-4 max-h-96 overflow-y-auto space-y-2'>
//             {loading ? (
//               <div className='flex flex-col items-center justify-center py-8 gap-2'>
//                 <Loader2 className='w-6 h-6 animate-spin text-blue-600' />
//                 <p className='text-gray-500 text-sm'>Searching...</p>
//               </div>
//             ) : results.length === 0 ? (
//               query.trim() ? (
//                 <div className='text-center py-8'>
//                   <p className='text-gray-500 mb-2'>No blogs found for "{query}"</p>
//                   <p className='text-xs text-gray-400'>Try different keywords</p>
//                 </div>
//               ) : (
//                 <p className='text-gray-500 text-center py-8 italic'>
//                   Start typing to search blogs
//                 </p>
//               )
//             ) : (
//               <>
//                 <p className='text-xs text-gray-500 px-1 mb-2'>
//                   Found {results.length} result{results.length !== 1 ? 's' : ''}
//                 </p>
//                 {results.map((post) => (
//                   <div
//                     key={post.id}
//                     className='border p-3 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors'
//                     onClick={() => {
//                       window.location.href = `/blog/${post.slug || post.id}`
//                       setOpen(false)
//                     }}
//                   >
//                     <h3 className='font-bold text-lg group-hover:text-blue-600 line-clamp-1 mb-1'>
//                       {post.title}
//                     </h3>
//                     <p className='text-sm text-gray-600 line-clamp-2 mb-2'>
//                       {stripHtml(post.subtitle || post.content?.slice(0, 150))}
//                     </p>
//                     {post.tag && (
//                       <div className="flex justify-start items-center flex-wrap">
//                         {post.tag.split(',').length > 1 ? (
//                           post.tag.split(',')?.map((e, ind) => (
//                             <span
//                               key={ind}
//                               className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 mx-2 rounded-full text-xs bg-blue-600/50 border font-bold border-blue-600 text-blue-700 mb-3 sm:mb-4 cursor-pointer select-none hover:bg-blue-700 hover:text-white transition-colors"
//                             >
//                               <Tag className="w-3 h-3" />
//                               {e.trim()}
//                             </span>
//                           ))
//                         ) : (
//                           <span className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 mx-2 rounded-full text-xs bg-blue-600/50 border font-bold border-blue-600 text-blue-700 mb-3 sm:mb-4 cursor-pointer select-none hover:bg-blue-700 hover:text-white transition-colors">
//                             <Tag className="w-3 h-3" />
//                             {post.tag.trim()}
//                           </span>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

// export default SearchBox


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

function useIsMd() {
  const [isMd, setIsMd] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setIsMd(mq.matches)
    setMounted(true)
    const fn = (e) => setIsMd(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return { isMd, mounted }
}

const SearchBox = ({ showText = true }) => {
  const { isMd, mounted } = useIsMd()
  const searchParams = useSearchParams()
  const tagFromUrl = searchParams.get('tag')
  
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // 1. SYNC STATE WITH HASH
  // This listener handles the "Back" button and manual URL entry
  useEffect(() => {
    const handleHashChange = () => {
      const isSearchActive = window.location.hash === '#search'
      setOpen(isSearchActive)
    }

    // Check on initial mount
    handleHashChange()

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // 2. HANDLE DIALOG VISIBILITY CHANGES
  const handleOpenChange = (isOpen) => {
    if (isOpen) {
      // Add #search to URL
      window.location.hash = 'search'
    } else {
      // If user clicks overlay or X, go back in history to remove hash
      if (window.location.hash === '#search') {
        window.history.back()
      }
      setQuery('')
      setResults([])
    }
  }

  // 3. HANDLE EXTERNAL TRIGGERS (Shortcuts & URL Params)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        if (!mounted) return
        if (showText && !isMd) return
        if (!showText && isMd) return
        window.location.hash = 'search'
      }
    }

    // Handle incoming 'tag' search param
    if (tagFromUrl && mounted) {
      setQuery(tagFromUrl)
      window.location.hash = 'search'
      // Clear param so it doesn't re-trigger
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tagFromUrl, isMd, showText, mounted])

  // 4. SEARCH LOGIC
  const debouncedQuery = useDebounce(query, 400)

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

  const clearSearch = () => {
    setQuery('')
    setResults([])
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <div className='rounded-sm sm:border flex items-center justify-end p-1 px-2 gap-x-3 cursor-pointer py-2 hover:bg-gray-50 bg-white/55 transition-colors'>
            <Search className='w-4 h-4 sm:hidden' />
            {showText && (
              <div className='hidden sm:flex items-center gap-2'>
                <p className='font-medium text-sm text-gray-700'>Type to Search</p>
                <div className='flex items-center gap-0.5'>
                  <kbd className='inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-300 rounded'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
                    </svg>
                  </kbd>
                  <kbd className='inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-300 rounded'>K</kbd>
                </div>
              </div>
            )}
            {!showText && <Search className='w-4 h-4 hidden sm:block' />}
          </div>
        </DialogTrigger>

        <DialogContent className='max-w-2xl max-h-[80vh]'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Search className='w-5 h-5' />
                Search Blogs
              </div>
            </DialogTitle>
            <div className='relative'>
              <Input
                placeholder='Type to search blogs...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className='pl-10 pr-10'
                autoFocus
              />
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              {query && (
                <button onClick={clearSearch} className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'>
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
                  <p className='text-gray-500 mb-2'>No blogs found for "{query}"</p>
                  <p className='text-xs text-gray-400'>Try different keywords</p>
                </div>
              ) : (
                <p className='text-gray-500 text-center py-8 italic'>Start typing to search blogs</p>
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
                      // Use window.location.href or router.push for navigation
                      window.location.href = `/blog/${post.slug || post.id}`
                      // We don't need setOpen(false) here because navigation will unmount component/clear hash
                    }}
                  >
                    <h3 className='font-bold text-lg group-hover:text-blue-600 line-clamp-1 mb-1'>{post.title}</h3>
                    <p className='text-sm text-gray-600 line-clamp-2 mb-2'>
                      {stripHtml(post.subtitle || post.content?.slice(0, 150))}
                    </p>
                    {post.tag && (
                      <div className="flex justify-start items-center flex-wrap">
                        {post.tag.split(',').map((e, ind) => (
                          <span key={ind} className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 mx-2 rounded-full text-xs bg-blue-600/50 border font-bold border-blue-600 text-blue-700 mb-3 sm:mb-4 cursor-pointer select-none hover:bg-blue-700 hover:text-white transition-colors">
                            <Tag className="w-3 h-3" />
                            {e.trim()}
                          </span>
                        ))}
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