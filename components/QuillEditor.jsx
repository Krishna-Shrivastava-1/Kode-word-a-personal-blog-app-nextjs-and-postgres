
// 'use client'
// import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
// import dynamic from 'next/dynamic'
// import 'react-quill-new/dist/quill.snow.css'

// const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

// function getImageUrls(html) {
//   if (!html) return []
//   const container = document.createElement('div')
//   container.innerHTML = html
//   const imgs = Array.from(container.querySelectorAll('img'))
//   return imgs.map((img) => img.getAttribute('src')).filter(Boolean)
// }

// export default function QuillEditor({ content = '', onChange }) {
//   const quillRef = useRef(null)
//   const prevContentRef = useRef(content)

//   const deleteImageFromStorage = useCallback(async (imageUrl) => {
//     try {
//       await fetch('/api/delete-image', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ imageUrl }),
//       })
//       console.log('Deleted from storage:', imageUrl)
//     } catch (error) {
//       console.error('Storage delete failed:', error)
//     }
//   }, [])

//   const imageHandler = useCallback(() => {
//     const input = document.createElement('input')
//     input.setAttribute('type', 'file')
//     input.setAttribute('accept', 'image/*')
//     input.click()

//     input.onchange = async () => {
//       const file = input.files[0]
//       if (!file) return

//       const quill = quillRef.current?.getEditor()
//       if (!quill) return
      
//       const range = quill.getSelection(true)

//       try {
//         const formData = new FormData()
//         formData.append('image', file)

//         const response = await fetch('/api/upload-image', {
//           method: 'POST',
//           body: formData,
//         })

//         const data = await response.json()

//         if (data.url) {
//           quill.insertEmbed(range.index, 'image', data.url)
//           quill.setSelection(range.index + 1)
//         } else {
//           alert('Image upload failed: ' + (data.error || 'Unknown error'))
//         }
//       } catch (error) {
//         console.error('Upload error:', error)
//         alert('Image upload failed')
//       }
//     }
//   }, [])

//   const linkHandler = useCallback(() => {
//     const quill = quillRef.current?.getEditor()
//     if (!quill) return
    
//     const range = quill.getSelection()
//     if (!range) return

//     const existing = quill.getFormat(range).link || ''
//     const url = window.prompt('Enter URL:', existing)

//     if (url === null) return
//     if (!url.trim()) {
//       quill.format('link', false)
//       return
//     }

//     let finalUrl = url.trim()
//     if (!/^https?:\/\//i.test(finalUrl)) {
//       finalUrl = 'https://' + finalUrl
//     }

//     quill.format('link', finalUrl)
//   }, [])

//   const videoHandler = useCallback(() => {
//     const quill = quillRef.current?.getEditor()
//     if (!quill) return
    
//     const range = quill.getSelection(true)
    
//     window.scrollTo({ top: 0, behavior: 'smooth' })
    
//     setTimeout(() => {
//       const url = window.prompt('Enter YouTube/Vimeo URL:')
      
//       if (!url) return
      
//       let videoUrl = url.trim()
      
//       if (videoUrl.includes('youtube.com/watch')) {
//         const videoId = new URL(videoUrl).searchParams.get('v')
//         if (videoId) {
//           videoUrl = `https://www.youtube.com/embed/${videoId}`
//         }
//       } else if (videoUrl.includes('youtu.be/')) {
//         const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0]
//         if (videoId) {
//           videoUrl = `https://www.youtube.com/embed/${videoId}`
//         }
//       } else if (videoUrl.includes('vimeo.com/')) {
//         const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0]
//         if (videoId) {
//           videoUrl = `https://player.vimeo.com/video/${videoId}`
//         }
//       }
      
//       quill.insertEmbed(range.index, 'video', videoUrl)
//       quill.setSelection(range.index + 1)
//     }, 100)
//   }, [])

//   const modules = useMemo(() => ({
//     toolbar: {
//       container: [
//         [{ header: [1, 2, 3, false] }],
//         ['bold', 'italic', 'underline', 'strike'],
//         [{ color: [] }, { background: [] }],
//         [{ list: 'ordered' }, { list: 'bullet' }],
//         [{ align: [] }],
//         ['blockquote', 'code-block'],
//         ['link', 'image', 'video'],
//         ['clean'],['table']
//       ],
//       handlers: { 
//         image: imageHandler,
//         link: linkHandler,
//         video: videoHandler,
//       },
//     },
//     history: {
//       delay: 500,
//       maxStack: 200,
//       userOnly: true,
//     },
//   }), [imageHandler, linkHandler, videoHandler])

//   const handleChange = useCallback(async (html) => {
//     const prevHtml = prevContentRef.current || ''
//     const prevImages = getImageUrls(prevHtml)
//     const newImages = getImageUrls(html)

//     const removed = prevImages.filter((url) => !newImages.includes(url))

//     if (removed.length > 0) {
//       for (const url of removed) {
//         await deleteImageFromStorage(url)
//       }
//     }

//     prevContentRef.current = html
//     if (onChange) onChange(html)
//   }, [deleteImageFromStorage, onChange])

//   useEffect(() => {
//     if (!quillRef.current) return
//     const quill = quillRef.current.getEditor()
//     const editorElement = quill.root

//     const addCopyButton = (preElement) => {
//       if (preElement.querySelector('.copy-code-btn')) return

//       const btn = document.createElement('button')
//       btn.className = 'copy-code-btn'
//       btn.innerHTML = `
//         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//           <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
//           <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
//         </svg>
//         <span>Copy</span>
//       `
//       btn.type = 'button'

//       btn.onclick = async (e) => {
//         e.preventDefault()
//         e.stopPropagation()
        
//         const code = preElement.textContent || ''
        
//         try {
//           await navigator.clipboard.writeText(code)
//           btn.innerHTML = `
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//               <polyline points="20 6 9 17 4 12"></polyline>
//             </svg>
//             <span>Copied!</span>
//           `
//           btn.classList.add('copied')
          
//           setTimeout(() => {
//             btn.innerHTML = `
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//                 <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
//                 <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
//               </svg>
//               <span>Copy</span>
//             `
//             btn.classList.remove('copied')
//           }, 2000)
//         } catch (err) {
//           console.error('Failed to copy:', err)
//         }
//       }

//       preElement.style.position = 'relative'
//       preElement.appendChild(btn)
//     }

//     const addDeleteButton = (iframeElement) => {
//       console.log('Adding delete button to iframe:', iframeElement)
      
//       // Skip if already has a delete button nearby
//       if (iframeElement.parentElement?.querySelector('.video-delete-btn')) {
//         console.log('Button already exists')
//         return
//       }

//       // Create delete button
//       const btn = document.createElement('button')
//       btn.className = 'video-delete-btn'
//       btn.innerHTML = `
//         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
//           <polyline points="3 6 5 6 21 6"></polyline>
//           <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
//           <line x1="10" y1="11" x2="10" y2="17"></line>
//           <line x1="14" y1="11" x2="14" y2="17"></line>
//         </svg>
//       `
//       btn.type = 'button'
//       btn.title = 'Delete video'
//       btn.contentEditable = 'false'

//       btn.onclick = (e) => {
//         e.preventDefault()
//         e.stopPropagation()
        
//         if (confirm('Delete this video?')) {
//           // Try to find and remove the parent paragraph
//           let parent = iframeElement.parentElement
//           while (parent && parent !== editorElement) {
//             if (parent.tagName === 'P') {
//               parent.remove()
//               return
//             }
//             parent = parent.parentElement
//           }
          
//           // Fallback: remove iframe directly
//           iframeElement.remove()
//         }
//       }

//       // Make parent relative
//       const parent = iframeElement.parentElement
//       if (parent) {
//         parent.style.position = 'relative'
//         parent.appendChild(btn)
//         console.log('Delete button added successfully')
//       }
//     }

//     const processCodeBlocks = () => {
//       const codeBlocks = editorElement.querySelectorAll('pre')
//       codeBlocks.forEach(addCopyButton)
//     }

//     const processVideos = () => {
//       const videos = editorElement.querySelectorAll('iframe')
//       console.log('Found iframes:', videos.length)
//       videos.forEach((iframe) => {
//         addDeleteButton(iframe)
//       })
//     }

//     // Process immediately
//     processCodeBlocks()
    
//     // Process videos with a small delay to ensure DOM is ready
//     setTimeout(() => {
//       processVideos()
//     }, 100)

//     const observer = new MutationObserver((mutations) => {
//       mutations.forEach((mutation) => {
//         if (mutation.type === 'childList') {
//           mutation.addedNodes.forEach((node) => {
//             if (node.nodeType === 1) {
//               if (node.tagName === 'PRE') {
//                 addCopyButton(node)
//               } else if (node.tagName === 'IFRAME') {
//                 console.log('New iframe detected')
//                 setTimeout(() => addDeleteButton(node), 100)
//               } else {
//                 const preElements = node.querySelectorAll?.('pre')
//                 preElements?.forEach(addCopyButton)
                
//                 const iframes = node.querySelectorAll?.('iframe')
//                 if (iframes && iframes.length > 0) {
//                   console.log('New iframes in container:', iframes.length)
//                   iframes.forEach((iframe) => {
//                     setTimeout(() => addDeleteButton(iframe), 100)
//                   })
//                 }
//               }
//             }
//           })
//         }
//       })
//     })

//     observer.observe(editorElement, {
//       childList: true,
//       subtree: true,
//     })

//     return () => {
//       observer.disconnect()
//     }
//   }, [])

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
//         <ReactQuill
//           ref={quillRef}
//           theme="snow"
//           defaultValue={content}
//           onChange={handleChange}
//           modules={modules}
//           placeholder="Start writing your article..."
//           className="quill-editor"
//         />
//       </div>

//       <style jsx global>{`
//         .quill-editor .ql-toolbar {
//           position: sticky;
//           top: 0;
//           z-index: 100;
//           background: white;
//           border-top-left-radius: 16px;
//           border-top-right-radius: 16px;
//           box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
//         }

//         .quill-editor .ql-container {
//           border-bottom-left-radius: 16px;
//           border-bottom-right-radius: 16px;
//         }

//         .quill-editor .ql-editor {
//           min-height: 400px;
//           max-height: calc(100vh - 200px);
//           padding: 20px;
//           font-size: 16px;
//           line-height: 1.6;
//           overflow-y: auto;
//         }

//         .quill-editor .ql-editor pre {
//           position: relative;
//           background: #1e293b !important;
//           border-radius: 8px !important;
//           padding: 50px 20px 20px 20px !important;
//           margin: 20px 0 !important;
//           overflow-x: auto;
//           border: 1px solid #334155;
//           color: #e2e8f0 !important;
//           font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
//           font-size: 14px !important;
//           line-height: 1.6 !important;
//         }

//         .copy-code-btn {
//           position: absolute;
//           top: 8px;
//           right: 8px;
//           display: flex;
//           align-items: center;
//           gap: 6px;
//           padding: 6px 12px;
//           background: #374151;
//           color: #e5e7eb;
//           border: 1px solid #4b5563;
//           border-radius: 6px;
//           font-size: 13px;
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           z-index: 10;
//           font-family: system-ui, -apple-system, sans-serif !important;
//         }

//         .copy-code-btn:hover {
//           background: #4b5563;
//           border-color: #6b7280;
//           transform: translateY(-1px);
//         }

//         .copy-code-btn:active {
//           transform: translateY(0);
//         }

//         .copy-code-btn.copied {
//           background: #059669;
//           border-color: #10b981;
//         }

//         .copy-code-btn svg {
//           flex-shrink: 0;
//         }

//         .quill-editor .ql-editor img {
//           max-width: 100%;
//           height: auto;
//           border-radius: 8px;
//           margin: 16px 0;
//           display: block;
//           border: 2px solid transparent;
//           transition: 0.2s ease;
//         }

//         .quill-editor .ql-editor img:hover {
//           border-color: #dc3545;
//           box-shadow: 0 4px 20px rgba(220, 53, 69, 0.2);
//         }

//         /* Video styling */
//         .quill-editor .ql-editor iframe {
//           max-width: 100%;
//           height: 400px;
//           border-radius: 8px;
//           margin: 16px 0;
//           display: block;
//           border: none;
//         }

//         .quill-editor .ql-editor p:has(iframe) {
//           position: relative !important;
//         }

//         /* Video delete button - ALWAYS VISIBLE FOR NOW */
//         .video-delete-btn {
//           position: absolute !important;
//           top: 24px !important;
//           right: 12px !important;
//           display: flex !important;
//           align-items: center !important;
//           justify-content: center !important;
//           width: 44px !important;
//           height: 44px !important;
//           padding: 0 !important;
//           background: rgba(220, 38, 38, 0.95) !important;
//           color: white !important;
//           border: 2px solid white !important;
//           border-radius: 8px !important;
//           cursor: pointer !important;
//           transition: all 0.2s ease !important;
//           z-index: 1000 !important;
//           opacity: 1 !important;
//           box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
//         }

//         .video-delete-btn:hover {
//           background: rgb(185, 28, 28) !important;
//           transform: scale(1.1) !important;
//         }

//         .video-delete-btn:active {
//           transform: scale(0.95) !important;
//         }

//         .video-delete-btn svg {
//           flex-shrink: 0;
//         }
//       `}</style>
//     </div>
//   )
// }





'use client'
import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

// ─── Custom Video Blot — registered once on module load ───────────────────────
// Renders uploaded videos as <video> tag, YouTube/Vimeo as <iframe>
let videoBlotRegistered = false
function registerVideoBlot() {
  if (videoBlotRegistered || typeof window === 'undefined') return
  try {
    const Quill = require('react-quill-new').default.Quill
    const BlockEmbed = Quill.import('blots/block/embed')

    class VideoBlot extends BlockEmbed {
      static create(value) {
        const node = super.create()
        node.setAttribute('data-video-src', value)

        const isUpload =
          value.includes('blob.vercel-storage.com') ||
           value.includes('res.cloudinary.com') ||
          value.match(/\.(mp4|webm|mov)(\?|$)/i)

        if (isUpload) {
          node.setAttribute('data-type', 'upload')
          const video = document.createElement('video')
          video.src = value
          video.controls = true
          video.setAttribute('controlslist', 'nodownload')
          video.setAttribute('disablepictureinpicture', '')
          video.setAttribute('playsinline', '')
          video.style.cssText = 'width:100%;display:block;border-radius:10px;margin:0.5rem 0;max-height:420px;background:#000;border:1px solid #e2e8f0;'
          node.appendChild(video)
        } else {
          // YouTube / Vimeo
          node.setAttribute('data-type', 'embed')
          const iframe = document.createElement('iframe')
          iframe.src = value
          iframe.setAttribute('allowfullscreen', '')
          iframe.setAttribute('frameborder', '0')
          iframe.style.cssText = 'width:100%;height:400px;display:block;border-radius:10px;margin:0.5rem 0;border:none;'
          node.appendChild(iframe)
        }
        return node
      }

      static value(node) {
        return node.getAttribute('data-video-src')
      }
    }

    VideoBlot.blotName = 'video'
    VideoBlot.tagName = 'div'
    VideoBlot.className = 'ql-video-wrapper'
    Quill.register(VideoBlot, true)
    videoBlotRegistered = true
  } catch (err) {
    console.error('VideoBlot registration failed:', err)
  }
}

registerVideoBlot()

const ReactQuill = dynamic(
  () => import('react-quill-new').then(mod => { registerVideoBlot(); return mod }),
  { ssr: false }
)

// ─────────────────────────────────────────────────────────────────────────────
// cleanupRemovedAssets — call from Edit page on Save to delete removed files
//
// Usage in edit page handleUpdate:
//   await cleanupRemovedAssets(originalContent, currentContent)
//   then do your axios.patch
// ─────────────────────────────────────────────────────────────────────────────
export async function cleanupRemovedAssets(originalHtml, currentHtml) {
  if (!originalHtml) return

  const getImageUrls = (h) => {
    const d = document.createElement('div')
    d.innerHTML = h
    return Array.from(d.querySelectorAll('img'))
      .map(i => i.getAttribute('src'))
      .filter(s => s && s.includes('blob.vercel-storage.com'))
  }

  const getVideoUrls = (h) => {
    const d = document.createElement('div')
    d.innerHTML = h
    return Array.from(d.querySelectorAll('.ql-video-wrapper[data-type="upload"]'))
      .map(w => w.getAttribute('data-video-src'))
      .filter(s => s && s.includes('blob.vercel-storage.com')|| s.includes('res.cloudinary.com'))
  }

  const removedImages = getImageUrls(originalHtml).filter(u => !getImageUrls(currentHtml).includes(u))
  const removedVideos = getVideoUrls(originalHtml).filter(u => !getVideoUrls(currentHtml).includes(u))

  for (const url of removedImages) {
    try {
      await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url }),
      })
    } catch (err) { console.error('Delete image failed:', err) }
  }

  for (const url of removedVideos) {
    try {
      await fetch('/api/delete-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url }),
      })
    } catch (err) { console.error('Delete video failed:', err) }
  }
}

export default function QuillEditor({ content = '', onChange }) {
  const quillRef = useRef(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [uploadingVideo, setUploadingVideo] = useState(false)

  useEffect(() => {
    window.__editorSetSaving = (saving) => {
      setSaveStatus(saving ? 'saving' : 'saved')
      if (!saving) setTimeout(() => setSaveStatus('idle'), 2500)
    }
    return () => { delete window.__editorSetSaving }
  }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && fullscreen) setFullscreen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [fullscreen])

  // ─── Image handler — upload immediately, insert real URL ──────────────────
  const imageHandler = useCallback(() => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()
    input.onchange = async () => {
      const file = input.files[0]
      if (!file) return
      const quill = quillRef.current?.getEditor()
      if (!quill) return
      const range = quill.getSelection(true)
      try {
        const formData = new FormData()
        formData.append('image', file)
        const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.url) {
          quill.insertEmbed(range.index, 'image', data.url)
          quill.setSelection(range.index + 1)
        } else {
          alert('Image upload failed: ' + (data.error || 'Unknown error'))
        }
      } catch (err) {
        console.error('Upload error:', err)
        alert('Image upload failed')
      }
    }
  }, [])

  // ─── Link handler ──────────────────────────────────────────────────────────
  const linkHandler = useCallback(() => {
    const quill = quillRef.current?.getEditor()
    if (!quill) return
    const range = quill.getSelection()
    if (!range) return
    const existing = quill.getFormat(range).link || ''
    const url = window.prompt('Enter URL:', existing)
    if (url === null) return
    if (!url.trim()) { quill.format('link', false); return }
    let finalUrl = url.trim()
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl
    quill.format('link', finalUrl)
  }, [])

  // ─── Video handler — upload immediately, insert real URL ──────────────────
  const videoHandler = useCallback(() => {
  const quill = quillRef.current?.getEditor()
  if (!quill) return
  const range = quill.getSelection(true)

  const choice = window.confirm(
    'Click OK to upload a video file.\nClick Cancel to embed YouTube/Vimeo URL.'
  )

  if (choice) {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'video/mp4,video/webm,video/mov,video/*')
    input.click()
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      if (file.size > 200 * 1024 * 1024) {
        alert('Video exceeds 200MB.')
        return
      }
      setUploadingVideo(true)
      try {
        // ✅ Upload directly to Cloudinary from browser — bypasses Vercel 4.5MB limit
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)
        formData.append('folder', 'blog-videos')

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
          { method: 'POST', body: formData }
        )
        const data = await res.json()

        if (data.secure_url) {
          quill.insertEmbed(range.index, 'video', data.secure_url)
          quill.setSelection(range.index + 1)
        } else {
          alert('Video upload failed: ' + (data.error?.message || 'Unknown error'))
        }
      } catch (err) {
        console.error('Video upload error:', err)
        alert('Video upload failed')
      } finally {
        setUploadingVideo(false)
      }
    }
  } else {
    // YouTube/Vimeo URL embed — unchanged
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      const url = window.prompt('Enter YouTube or Vimeo URL:')
      if (!url) return
      let videoUrl = url.trim()
      if (videoUrl.includes('youtube.com/watch')) {
        const id = new URL(videoUrl).searchParams.get('v')
        if (id) videoUrl = `https://www.youtube.com/embed/${id}`
      } else if (videoUrl.includes('youtu.be/')) {
        const id = videoUrl.split('youtu.be/')[1]?.split('?')[0]
        if (id) videoUrl = `https://www.youtube.com/embed/${id}`
      } else if (videoUrl.includes('vimeo.com/')) {
        const id = videoUrl.split('vimeo.com/')[1]?.split('?')[0]
        if (id) videoUrl = `https://player.vimeo.com/video/${id}`
      }
      quill.insertEmbed(range.index, 'video', videoUrl)
      quill.setSelection(range.index + 1)
    }, 100)
  }
}, [])
  // const videoHandler = useCallback(() => {
  //   const quill = quillRef.current?.getEditor()
  //   if (!quill) return
  //   const range = quill.getSelection(true)

  //   const choice = window.confirm(
  //     'Click OK to upload a video file from your device.\nClick Cancel to embed a YouTube/Vimeo URL instead.'
  //   )

  //   if (choice) {
  //     const input = document.createElement('input')
  //     input.setAttribute('type', 'file')
  //     input.setAttribute('accept', 'video/mp4,video/webm,video/mov,video/*')
  //     input.click()
  //     input.onchange = async () => {
  //       const file = input.files?.[0]
  //       if (!file) return
  //       if (file.size > 100 * 1024 * 1024) {
  //         alert('Video exceeds 100MB. Please compress it first.')
  //         return
  //       }
  //       setUploadingVideo(true)
  //       try {
  //         const formData = new FormData()
  //         formData.append('video', file)
  //         const res = await fetch('/api/upload-video', { method: 'POST', body: formData })
  //         const data = await res.json()
  //         if (data.url) {
  //           quill.insertEmbed(range.index, 'video', data.url)
  //           quill.setSelection(range.index + 1)
  //         } else {
  //           alert('Video upload failed: ' + (data.error || 'Unknown error'))
  //         }
  //       } catch (err) {
  //         console.error('Video upload error:', err)
  //         alert('Video upload failed')
  //       } finally {
  //         setUploadingVideo(false)
  //       }
  //     }
  //   } else {
  //     window.scrollTo({ top: 0, behavior: 'smooth' })
  //     setTimeout(() => {
  //       const url = window.prompt('Enter YouTube or Vimeo URL:')
  //       if (!url) return
  //       let videoUrl = url.trim()
  //       if (videoUrl.includes('youtube.com/watch')) {
  //         const id = new URL(videoUrl).searchParams.get('v')
  //         if (id) videoUrl = `https://www.youtube.com/embed/${id}`
  //       } else if (videoUrl.includes('youtu.be/')) {
  //         const id = videoUrl.split('youtu.be/')[1]?.split('?')[0]
  //         if (id) videoUrl = `https://www.youtube.com/embed/${id}`
  //       } else if (videoUrl.includes('vimeo.com/')) {
  //         const id = videoUrl.split('vimeo.com/')[1]?.split('?')[0]
  //         if (id) videoUrl = `https://player.vimeo.com/video/${id}`
  //       }
  //       quill.insertEmbed(range.index, 'video', videoUrl)
  //       quill.setSelection(range.index + 1)
  //     }, 100)
  //   }
  // }, [])

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'], ['table'],
      ],
      handlers: { image: imageHandler, link: linkHandler, video: videoHandler },
    },
    history: { delay: 500, maxStack: 200, userOnly: true },
  }), [imageHandler, linkHandler, videoHandler])

  // ─── Track previous content for deletion detection ────────────────────────
  const prevContentRef = useRef(content)

  // ─── onChange — word/char count + immediate deletion of removed assets ─────
  const handleChange = useCallback(async (html) => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    setWordCount(text ? text.split(' ').filter(w => w.length > 0).length : 0)
    setCharCount(text.length)

    const prevHtml = prevContentRef.current || ''

    // ── Detect and delete removed uploaded images ─────────────────────────
    const getStorageImages = (h) => {
      const d = document.createElement('div')
      d.innerHTML = h
      return Array.from(d.querySelectorAll('img'))
        .map(i => i.getAttribute('src'))
        .filter(s => s && s.includes('blob.vercel-storage.com'))
    }
    const removedImages = getStorageImages(prevHtml).filter(u => !getStorageImages(html).includes(u))
    for (const url of removedImages) {
      try {
        fetch('/api/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: url }),
        }).catch(err => console.error('Delete image failed:', err))
      } catch (err) { console.error('Delete image failed:', err) }
    }

    // ── Detect and delete removed uploaded videos ─────────────────────────
    const getStorageVideos = (h) => {
      const d = document.createElement('div')
      d.innerHTML = h
      return Array.from(d.querySelectorAll('.ql-video-wrapper[data-type="upload"]'))
        .map(w => w.getAttribute('data-video-src'))
        .filter(s => s && s.includes('blob.vercel-storage.com') ||  s.includes('res.cloudinary.com'))
    }
    const removedVideos = getStorageVideos(prevHtml).filter(u => !getStorageVideos(html).includes(u))
    for (const url of removedVideos) {
      try {
        fetch('/api/delete-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl: url }),
        }).catch(err => console.error('Delete video failed:', err))
      } catch (err) { console.error('Delete video failed:', err) }
    }

    prevContentRef.current = html
    if (onChange) onChange(html)
  }, [onChange])

  // ─── DOM: copy buttons + video delete buttons ─────────────────────────────
  useEffect(() => {
    if (!quillRef.current) return
    const quill = quillRef.current.getEditor()
    const editorEl = quill.root

    const addCopyButton = (pre) => {
      if (pre.querySelector('.copy-code-btn')) return
      const btn = document.createElement('button')
      btn.className = 'copy-code-btn'
      btn.type = 'button'
      btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span>`
      btn.onclick = async (e) => {
        e.preventDefault(); e.stopPropagation()
        try {
          await navigator.clipboard.writeText(pre.textContent || '')
          btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>Copied!</span>`
          btn.classList.add('copied')
          setTimeout(() => {
            btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span>`
            btn.classList.remove('copied')
          }, 2000)
        } catch (err) { console.error('Copy failed:', err) }
      }
      pre.style.position = 'relative'
      pre.appendChild(btn)
    }

    const addVideoDeleteButton = (wrapper) => {
      if (wrapper.querySelector('.video-delete-btn')) return
      const src = wrapper.getAttribute('data-video-src') || ''
      const isUpload = wrapper.getAttribute('data-type') === 'upload'
      const btn = document.createElement('button')
      btn.className = 'video-delete-btn'
      btn.type = 'button'
      btn.title = isUpload ? 'Delete video from storage' : 'Remove video embed'
      btn.contentEditable = 'false'
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`
      btn.onclick = async (e) => {
        e.preventDefault(); e.stopPropagation()
        const msg = isUpload ? 'Delete this video from storage?' : 'Remove this video embed?'
        if (!confirm(msg)) return
        if (isUpload) {
          try {
            await fetch('/api/delete-video', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ videoUrl: src }),
            })
          } catch (err) { console.error('Delete video failed:', err) }
        }
        wrapper.remove()
      }
      wrapper.style.position = 'relative'
      wrapper.appendChild(btn)
    }

    const processAll = () => {
      editorEl.querySelectorAll('pre').forEach(addCopyButton)
      setTimeout(() => editorEl.querySelectorAll('.ql-video-wrapper').forEach(addVideoDeleteButton), 150)
    }
    processAll()

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(({ type, addedNodes }) => {
        if (type !== 'childList') return
        addedNodes.forEach(node => {
          if (node.nodeType !== 1) return
          if (node.tagName === 'PRE') addCopyButton(node)
          else if (node.classList?.contains('ql-video-wrapper')) {
            setTimeout(() => addVideoDeleteButton(node), 150)
          } else {
            node.querySelectorAll?.('pre').forEach(addCopyButton)
            node.querySelectorAll?.('.ql-video-wrapper').forEach(w => {
              setTimeout(() => addVideoDeleteButton(w), 150)
            })
          }
        })
      })
    })
    observer.observe(editorEl, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return (
    <div className={`editor-shell${fullscreen ? ' editor-fullscreen' : ''}`}>

      {/* Video upload overlay */}
      {/* {uploadingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
            <p className="font-semibold text-gray-800">Uploading video...</p>
            <p className="text-sm text-gray-500">Please wait, do not close this page</p>
          </div>
        </div>
      )} */}

      {/* Status bar */}
      <div className="editor-statusbar">
        <div className="editor-counts">
          <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
          <span className="editor-sep">·</span>
          <span>{charCount} chars</span>
        </div>
        <div className="editor-actions-bar">
          {saveStatus === 'saving' && (
            <span className="save-indicator saving">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Saving…
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="save-indicator saved">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Draft saved
            </span>
          )}
          <button
            className="fullscreen-btn"
            onClick={() => setFullscreen(f => !f)}
            title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
            type="button"
          >
            {fullscreen ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
                <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
              </svg>
            )}
            {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="editor-body">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          defaultValue={content}
          onChange={handleChange}
          modules={modules}
          placeholder="Start writing your article..."
          className="quill-editor"
        />
      </div>

      <style jsx global>{`
        .editor-shell { max-width: 56rem; margin: 0 auto; }
        .editor-fullscreen {
          position: fixed !important; inset: 0 !important; z-index: 9999 !important;
          max-width: 100% !important; background: white !important;
          display: flex !important; flex-direction: column !important;
        }
        .editor-fullscreen .editor-body { flex: 1; overflow-y: auto; border-radius: 0 !important; }
        .editor-fullscreen .editor-body .ql-editor { max-height: none !important; min-height: calc(100vh - 100px) !important; }
        .editor-fullscreen .quill-editor .ql-toolbar { border-radius: 0 !important; }

        .editor-statusbar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 6px 14px; background: #f8fafc;
          border: 1px solid #e2e8f0; border-bottom: none;
          border-radius: 16px 16px 0 0;
          font-size: 12px; color: #94a3b8;
          font-family: 'DM Sans', -apple-system, sans-serif;
        }
        .editor-counts { display: flex; align-items: center; gap: 5px; }
        .editor-sep { opacity: 0.4; }
        .editor-actions-bar { display: flex; align-items: center; gap: 10px; }
        .save-indicator { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 500; }
        .save-indicator.saving { color: #f59e0b; }
        .save-indicator.saved  { color: #10b981; }
        .spin { animation: editorSpin 0.9s linear infinite; }
        @keyframes editorSpin { to { transform: rotate(360deg); } }
        .fullscreen-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 6px;
          font-size: 12px; font-weight: 500; cursor: pointer;
          border: 1px solid #e2e8f0; background: white; color: #64748b;
          transition: all 0.15s; font-family: inherit;
        }
        .fullscreen-btn:hover { background: #f1f5f9; color: #1e293b; border-color: #cbd5e1; }

        .editor-body {
          background: white; border-radius: 0 0 16px 16px;
          overflow: hidden; border: 1px solid #e2e8f0; border-top: none;
        }
        .quill-editor .ql-toolbar {
          position: sticky; top: 0; z-index: 100; background: white;
          box-shadow: 0 1px 6px rgba(0,0,0,0.05);
        }
        .quill-editor .ql-container {
          border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; border-top: none;
        }
        .quill-editor .ql-editor {
          min-height: 500px; max-height: calc(100vh - 200px);
          padding: 28px 32px; overflow-y: auto;
          font-family: 'DM Sans', -apple-system, sans-serif;
          font-size: 1rem; line-height: 1.875; color: #374151;
        }
        .quill-editor .ql-editor.ql-blank::before { color: #cbd5e1; font-style: normal; font-size: 1rem; }

        .quill-editor .ql-editor h1 {
          font-size: clamp(1.3rem, 3.6vw, 1.85rem) !important;
          font-weight: 600 !important; line-height: 1.25 !important; color: #0f172a !important;
          margin: 2rem 0 0.75rem !important; letter-spacing: -0.02em !important;
          padding-bottom: 0.5rem !important; border-bottom: 1px solid #f1f5f9 !important;
        }
        .quill-editor .ql-editor h2 {
          font-size: clamp(1.1rem, 2.8vw, 1.45rem) !important;
          font-weight: 600 !important; line-height: 1.3 !important; color: #0f172a !important;
          margin: 1.875rem 0 0.625rem !important; letter-spacing: -0.015em !important;
        }
        .quill-editor .ql-editor h3 {
          font-size: clamp(0.95rem, 2.2vw, 1.1rem) !important;
          font-weight: 600 !important; line-height: 1.4 !important;
          color: #1e293b !important; margin: 1.5rem 0 0.45rem !important;
        }
        .quill-editor .ql-editor p {
          font-size: 1rem !important; line-height: 1.875 !important;
          color: #374151 !important; margin: 0 0 1.1rem !important;
        }
        .quill-editor .ql-editor blockquote {
          border-left: 3px solid #2563eb !important; background: #f8faff !important;
          padding: 1rem 1.5rem !important; border-radius: 0 8px 8px 0 !important;
          font-style: italic !important; color: #1e3a5f !important; margin: 1.5rem 0 !important;
        }
        .quill-editor .ql-editor pre {
          position: relative !important; background: #0d1117 !important;
          border-radius: 10px !important; padding: 2.5rem 1.25rem 1.25rem !important;
          margin: 1.5rem 0 !important; overflow-x: auto !important;
          border: 1px solid #1e293b !important; color: #e2e8f0 !important;
          font-family: 'JetBrains Mono','Fira Code',monospace !important;
          font-size: 0.875rem !important; line-height: 1.75 !important;
        }
        .quill-editor .ql-editor img {
          max-width: 100% !important; height: auto !important;
          border-radius: 10px !important; margin: 1.5rem 0 !important;
          display: block !important; border: 1px solid #e2e8f0 !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
        }
        .quill-editor .ql-editor img:hover {
          border-color: #2563eb !important;
          box-shadow: 0 4px 20px rgba(37,99,235,0.12) !important;
        }

        /* Custom video blot */
        .quill-editor .ql-editor .ql-video-wrapper {
          position: relative; margin: 1.5rem 0;
          border-radius: 10px; overflow: hidden;
        }
        .quill-editor .ql-editor .ql-video-wrapper video {
          width: 100% !important; display: block !important;
          border-radius: 10px !important; max-height: 420px !important; background: #000 !important;
        }
        .quill-editor .ql-editor .ql-video-wrapper iframe {
          width: 100% !important; height: 400px !important;
          display: block !important; border: none !important; border-radius: 10px !important;
        }

        .quill-editor .ql-editor ul li,
        .quill-editor .ql-editor ol li {
          line-height: 1.75 !important; color: #374151 !important; margin-bottom: 0.4rem !important;
        }
        .quill-editor .ql-editor a { color: #2563eb !important; }

        .copy-code-btn {
          position: absolute; top: 8px; right: 8px;
          display: flex; align-items: center; gap: 5px;
          padding: 5px 10px; background: #1e293b; color: #94a3b8;
          border: 1px solid #334155; border-radius: 6px;
          font-size: 12px; font-weight: 500; cursor: pointer;
          transition: all 0.18s; z-index: 10; font-family: system-ui, sans-serif !important;
        }
        .copy-code-btn:hover { background: #334155; color: #e2e8f0; }
        .copy-code-btn.copied { background: #064e3b; color: #6ee7b7; border-color: #065f46; }

        .video-delete-btn {
          position: absolute !important; top: 10px !important; right: 10px !important;
          display: flex !important; align-items: center !important; justify-content: center !important;
          width: 34px !important; height: 34px !important;
          background: rgba(220,38,38,0.9) !important; color: white !important;
          border: 2px solid white !important; border-radius: 8px !important;
          cursor: pointer !important; z-index: 1000 !important;
          transition: all 0.18s !important; box-shadow: 0 2px 8px rgba(0,0,0,0.22) !important;
        }
        .video-delete-btn:hover { background: rgb(185,28,28) !important; transform: scale(1.08) !important; }
      `}</style>
    </div>
  )
}