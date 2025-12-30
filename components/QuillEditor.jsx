
'use client'
import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

function getImageUrls(html) {
  if (!html) return []
  const container = document.createElement('div')
  container.innerHTML = html
  const imgs = Array.from(container.querySelectorAll('img'))
  return imgs.map((img) => img.getAttribute('src')).filter(Boolean)
}

export default function QuillEditor({ content = '', onChange }) {
  const quillRef = useRef(null)
  const prevContentRef = useRef(content)

  const deleteImageFromStorage = useCallback(async (imageUrl) => {
    try {
      await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })
      console.log('Deleted from storage:', imageUrl)
    } catch (error) {
      console.error('Storage delete failed:', error)
    }
  }, [])

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

        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (data.url) {
          quill.insertEmbed(range.index, 'image', data.url)
          quill.setSelection(range.index + 1)
        } else {
          alert('Image upload failed: ' + (data.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert('Image upload failed')
      }
    }
  }, [])

  const linkHandler = useCallback(() => {
    const quill = quillRef.current?.getEditor()
    if (!quill) return
    
    const range = quill.getSelection()
    if (!range) return

    const existing = quill.getFormat(range).link || ''
    const url = window.prompt('Enter URL:', existing)

    if (url === null) return
    if (!url.trim()) {
      quill.format('link', false)
      return
    }

    let finalUrl = url.trim()
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl
    }

    quill.format('link', finalUrl)
  }, [])

  const videoHandler = useCallback(() => {
    const quill = quillRef.current?.getEditor()
    if (!quill) return
    
    const range = quill.getSelection(true)
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    setTimeout(() => {
      const url = window.prompt('Enter YouTube/Vimeo URL:')
      
      if (!url) return
      
      let videoUrl = url.trim()
      
      if (videoUrl.includes('youtube.com/watch')) {
        const videoId = new URL(videoUrl).searchParams.get('v')
        if (videoId) {
          videoUrl = `https://www.youtube.com/embed/${videoId}`
        }
      } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0]
        if (videoId) {
          videoUrl = `https://www.youtube.com/embed/${videoId}`
        }
      } else if (videoUrl.includes('vimeo.com/')) {
        const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0]
        if (videoId) {
          videoUrl = `https://player.vimeo.com/video/${videoId}`
        }
      }
      
      quill.insertEmbed(range.index, 'video', videoUrl)
      quill.setSelection(range.index + 1)
    }, 100)
  }, [])

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
        ['clean'],['table']
      ],
      handlers: { 
        image: imageHandler,
        link: linkHandler,
        video: videoHandler,
      },
    },
    history: {
      delay: 500,
      maxStack: 200,
      userOnly: true,
    },
  }), [imageHandler, linkHandler, videoHandler])

  const handleChange = useCallback(async (html) => {
    const prevHtml = prevContentRef.current || ''
    const prevImages = getImageUrls(prevHtml)
    const newImages = getImageUrls(html)

    const removed = prevImages.filter((url) => !newImages.includes(url))

    if (removed.length > 0) {
      for (const url of removed) {
        await deleteImageFromStorage(url)
      }
    }

    prevContentRef.current = html
    if (onChange) onChange(html)
  }, [deleteImageFromStorage, onChange])

  useEffect(() => {
    if (!quillRef.current) return
    const quill = quillRef.current.getEditor()
    const editorElement = quill.root

    const addCopyButton = (preElement) => {
      if (preElement.querySelector('.copy-code-btn')) return

      const btn = document.createElement('button')
      btn.className = 'copy-code-btn'
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      `
      btn.type = 'button'

      btn.onclick = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        const code = preElement.textContent || ''
        
        try {
          await navigator.clipboard.writeText(code)
          btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Copied!</span>
          `
          btn.classList.add('copied')
          
          setTimeout(() => {
            btn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            `
            btn.classList.remove('copied')
          }, 2000)
        } catch (err) {
          console.error('Failed to copy:', err)
        }
      }

      preElement.style.position = 'relative'
      preElement.appendChild(btn)
    }

    const addDeleteButton = (iframeElement) => {
      console.log('Adding delete button to iframe:', iframeElement)
      
      // Skip if already has a delete button nearby
      if (iframeElement.parentElement?.querySelector('.video-delete-btn')) {
        console.log('Button already exists')
        return
      }

      // Create delete button
      const btn = document.createElement('button')
      btn.className = 'video-delete-btn'
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      `
      btn.type = 'button'
      btn.title = 'Delete video'
      btn.contentEditable = 'false'

      btn.onclick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (confirm('Delete this video?')) {
          // Try to find and remove the parent paragraph
          let parent = iframeElement.parentElement
          while (parent && parent !== editorElement) {
            if (parent.tagName === 'P') {
              parent.remove()
              return
            }
            parent = parent.parentElement
          }
          
          // Fallback: remove iframe directly
          iframeElement.remove()
        }
      }

      // Make parent relative
      const parent = iframeElement.parentElement
      if (parent) {
        parent.style.position = 'relative'
        parent.appendChild(btn)
        console.log('Delete button added successfully')
      }
    }

    const processCodeBlocks = () => {
      const codeBlocks = editorElement.querySelectorAll('pre')
      codeBlocks.forEach(addCopyButton)
    }

    const processVideos = () => {
      const videos = editorElement.querySelectorAll('iframe')
      console.log('Found iframes:', videos.length)
      videos.forEach((iframe) => {
        addDeleteButton(iframe)
      })
    }

    // Process immediately
    processCodeBlocks()
    
    // Process videos with a small delay to ensure DOM is ready
    setTimeout(() => {
      processVideos()
    }, 100)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (node.tagName === 'PRE') {
                addCopyButton(node)
              } else if (node.tagName === 'IFRAME') {
                console.log('New iframe detected')
                setTimeout(() => addDeleteButton(node), 100)
              } else {
                const preElements = node.querySelectorAll?.('pre')
                preElements?.forEach(addCopyButton)
                
                const iframes = node.querySelectorAll?.('iframe')
                if (iframes && iframes.length > 0) {
                  console.log('New iframes in container:', iframes.length)
                  iframes.forEach((iframe) => {
                    setTimeout(() => addDeleteButton(iframe), 100)
                  })
                }
              }
            }
          })
        }
      })
    })

    observer.observe(editorElement, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
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
        .quill-editor .ql-toolbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: white;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .quill-editor .ql-container {
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
        }

        .quill-editor .ql-editor {
          min-height: 400px;
          max-height: calc(100vh - 200px);
          padding: 20px;
          font-size: 16px;
          line-height: 1.6;
          overflow-y: auto;
        }

        .quill-editor .ql-editor pre {
          position: relative;
          background: #1e293b !important;
          border-radius: 8px !important;
          padding: 50px 20px 20px 20px !important;
          margin: 20px 0 !important;
          overflow-x: auto;
          border: 1px solid #334155;
          color: #e2e8f0 !important;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
        }

        .copy-code-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #374151;
          color: #e5e7eb;
          border: 1px solid #4b5563;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
          font-family: system-ui, -apple-system, sans-serif !important;
        }

        .copy-code-btn:hover {
          background: #4b5563;
          border-color: #6b7280;
          transform: translateY(-1px);
        }

        .copy-code-btn:active {
          transform: translateY(0);
        }

        .copy-code-btn.copied {
          background: #059669;
          border-color: #10b981;
        }

        .copy-code-btn svg {
          flex-shrink: 0;
        }

        .quill-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
          display: block;
          border: 2px solid transparent;
          transition: 0.2s ease;
        }

        .quill-editor .ql-editor img:hover {
          border-color: #dc3545;
          box-shadow: 0 4px 20px rgba(220, 53, 69, 0.2);
        }

        /* Video styling */
        .quill-editor .ql-editor iframe {
          max-width: 100%;
          height: 400px;
          border-radius: 8px;
          margin: 16px 0;
          display: block;
          border: none;
        }

        .quill-editor .ql-editor p:has(iframe) {
          position: relative !important;
        }

        /* Video delete button - ALWAYS VISIBLE FOR NOW */
        .video-delete-btn {
          position: absolute !important;
          top: 24px !important;
          right: 12px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 44px !important;
          height: 44px !important;
          padding: 0 !important;
          background: rgba(220, 38, 38, 0.95) !important;
          color: white !important;
          border: 2px solid white !important;
          border-radius: 8px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          z-index: 1000 !important;
          opacity: 1 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
        }

        .video-delete-btn:hover {
          background: rgb(185, 28, 28) !important;
          transform: scale(1.1) !important;
        }

        .video-delete-btn:active {
          transform: scale(0.95) !important;
        }

        .video-delete-btn svg {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}

